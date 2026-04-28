import { afterEach, describe, expect, it, vi } from "vitest";
import { setupObservability } from "../../server/src/observability";

type MiddlewareCtx = {
  path: string;
  method: string;
  status?: number;
  body?: unknown;
};

function createFakeServer() {
  const middlewares: Array<
    (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>
  > = [];

  return {
    middlewares,
    server: {
      db: {
        state: new Map<string, unknown>([
          ["active", { G: { activeTable: true }, ctx: {} }],
          ["paused", { G: { activeTable: false }, ctx: {} }],
          ["finished", { G: { activeTable: true }, ctx: { gameover: { winner_id: "0" } } }]
        ])
      },
      app: {
        use: (middleware: (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>) => {
          middlewares.push(middleware);
        }
      }
    }
  };
}

async function runChain(
  middlewares: Array<(ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<void>>,
  ctx: MiddlewareCtx
) {
  let idx = -1;

  async function dispatch(i: number): Promise<void> {
    if (i <= idx) {
      throw new Error("next called multiple times");
    }

    idx = i;
    const middleware = middlewares[i];
    if (!middleware) {
      return;
    }

    await middleware(ctx, async () => dispatch(i + 1));
  }

  await dispatch(0);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("observability", () => {
  it("returns health and metrics payload", async () => {
    vi.spyOn(global, "setInterval").mockImplementation(
      () => ({ unref: () => undefined }) as unknown as NodeJS.Timeout
    );

    const fake = createFakeServer();
    setupObservability(fake.server);

    const healthCtx: MiddlewareCtx = { method: "GET", path: "/ops/health" };
    await runChain(fake.middlewares, healthCtx);
    expect(healthCtx.body).toMatchObject({ ok: true });

    const metricsCtx: MiddlewareCtx = { method: "GET", path: "/ops/metrics" };
    await runChain(fake.middlewares, metricsCtx);

    expect(metricsCtx.body).toMatchObject({
      totalTables: 3,
      activeTables: 1,
      pausedTables: 1,
      finishedTables: 1
    });
  });

  it("logs game route requests", async () => {
    vi.spyOn(global, "setInterval").mockImplementation(
      () => ({ unref: () => undefined }) as unknown as NodeJS.Timeout
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const fake = createFakeServer();
    setupObservability(fake.server);

    const ctx: MiddlewareCtx = { method: "POST", path: "/games/frozen-guild/abc/join", status: 200 };
    await runChain(fake.middlewares, ctx);

    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls.some((call) => String(call[0]).includes("[http]"))).toBe(true);
  });

  it("logs moves and error status", async () => {
    vi.spyOn(global, "setInterval").mockImplementation(
      () => ({ unref: () => undefined }) as unknown as NodeJS.Timeout
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fake = createFakeServer();
    setupObservability(fake.server);

    const okMoveCtx: MiddlewareCtx = {
      method: "POST",
      path: "/games/frozen-guild/match-1/moves/rollDice",
      status: 200
    };
    await runChain(fake.middlewares, okMoveCtx);

    const invalidMoveCtx: MiddlewareCtx = {
      method: "POST",
      path: "/games/frozen-guild/match-1/moves/fishFromIce",
      status: 400
    };
    await runChain(fake.middlewares, invalidMoveCtx);

    expect(logSpy.mock.calls.some((call) => String(call[0]).includes("[move]"))).toBe(true);
    expect(errorSpy.mock.calls.some((call) => String(call[0]).includes("[http:error-status]"))).toBe(
      true
    );
  });
});
