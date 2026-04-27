import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { setupSqlitePersistence } from "../../server/src/storage";

type MiddlewareCtx = {
  path: string;
  body?: unknown;
};

function createFakeServer() {
  const middlewares: Array<(ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>> = [];

  return {
    middlewares,
    server: {
      db: {
        state: new Map<string, unknown>(),
        initial: new Map<string, unknown>(),
        metadata: new Map<string, unknown>(),
        log: new Map<string, unknown>()
      },
      app: {
        use: (middleware: (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>) => {
          middlewares.push(middleware);
        }
      }
    }
  };
}

async function runMiddleware(
  middleware: (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>,
  path: string
) {
  const ctx: MiddlewareCtx = { path };
  await middleware(ctx, async () => undefined);
  return ctx;
}

const tempFolders: string[] = [];

afterEach(() => {
  for (const folder of tempFolders.splice(0, tempFolders.length)) {
    rmSync(folder, { recursive: true, force: true });
  }
});

describe("sqlite persistence", () => {
  it("persists state/metadata/log and loads again on restart", () => {
    const dir = mkdtempSync(join(tmpdir(), "fg-stage20-"));
    tempFolders.push(dir);
    const dbPath = join(dir, "frozen-guild.db");

    const first = createFakeServer();
    const firstDb = setupSqlitePersistence(first.server, { sqlitePath: dbPath });

    first.server.db.initial.set("match-1", { setup: true });
    first.server.db.metadata.set("match-1", {
      players: {
        "0": { name: "P1", credentials: "secret" }
      }
    });
    first.server.db.log.set("match-1", [{ action: "rollDice" }]);
    first.server.db.state.set("match-1", {
      ctx: {
        gameover: {
          winner_id: "0",
          scores: { "0": 10, "1": 5 }
        }
      }
    });

    firstDb.close();

    const second = createFakeServer();
    const secondDb = setupSqlitePersistence(second.server, { sqlitePath: dbPath });

    expect(second.server.db.state.get("match-1")).toBeTruthy();
    expect(second.server.db.initial.get("match-1")).toEqual({ setup: true });
    expect(second.server.db.metadata.get("match-1")).toBeTruthy();
    expect(second.server.db.log.get("match-1")).toEqual([{ action: "rollDice" }]);

    secondDb.close();
  });

  it("exposes /persistence/health middleware response", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fg-stage20-health-"));
    tempFolders.push(dir);
    const dbPath = join(dir, "frozen-guild.db");

    const fake = createFakeServer();
    const db = setupSqlitePersistence(fake.server, { sqlitePath: dbPath });

    const healthMiddleware = fake.middlewares[0];
    expect(healthMiddleware).toBeTruthy();

    if (!healthMiddleware) {
      db.close();
      return;
    }

    const ctx = await runMiddleware(healthMiddleware, "/persistence/health");
    expect(ctx.body).toMatchObject({ ok: true });

    const health = ctx.body as { sqlitePath: string; savedMatches: { total: number } };
    expect(health.sqlitePath).toContain("frozen-guild.db");
    expect(health.savedMatches.total).toBeTypeOf("number");

    db.close();
  });

  it("writes summary row when gameover exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "fg-stage20-summary-"));
    tempFolders.push(dir);
    const dbPath = join(dir, "frozen-guild.db");

    const fake = createFakeServer();
    const db = setupSqlitePersistence(fake.server, { sqlitePath: dbPath });

    fake.server.db.state.set("match-finished", {
      ctx: {
        gameover: {
          winner_id: "1",
          scores: { "0": 4, "1": 9 }
        }
      }
    });

    const rawDb = new Database(dbPath);
    const raw = rawDb
      .prepare("SELECT winner_id, score_json FROM match_summaries WHERE match_id = ?")
      .get("match-finished") as { winner_id: string; score_json: string };

    expect(raw.winner_id).toBe("1");
    expect(JSON.parse(raw.score_json)).toEqual({ "0": 4, "1": 9 });

    rawDb.close();
    db.close();
  });
});
