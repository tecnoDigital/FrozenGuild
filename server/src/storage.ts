import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type MatchStateLike = {
  ctx?: {
    gameover?: unknown;
  };
};

type MetadataLike = {
  players?: Record<string, { name?: string; credentials?: string }>;
};

type MatchSummaryLike = {
  winner_id?: string;
  scores?: unknown;
};

type MapStore<T> = {
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => unknown;
  entries: () => IterableIterator<[string, T]>;
};

type ServerLike = {
  db: {
    state: MapStore<unknown>;
    initial: MapStore<unknown>;
    metadata: MapStore<unknown>;
    log: MapStore<unknown>;
  };
  app: {
    use: (middleware: (ctx: { path: string; body?: unknown }, next: () => Promise<unknown>) => Promise<void>) => void;
  };
};

const DEFAULT_DB_PATH = "./data/frozen-guild.db";

type PersistenceOptions = {
  sqlitePath?: string;
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export function setupSqlitePersistence(
  server: ServerLike,
  options: PersistenceOptions = {}
): Database.Database {
  const dbPath = resolve(options.sqlitePath ?? process.env.SQLITE_PATH ?? DEFAULT_DB_PATH);
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      match_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      state_json TEXT,
      initial_json TEXT,
      metadata_json TEXT,
      log_json TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      match_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      name TEXT,
      credentials_hash TEXT,
      PRIMARY KEY (match_id, player_id)
    );

    CREATE TABLE IF NOT EXISTS match_summaries (
      match_id TEXT PRIMARY KEY,
      winner_id TEXT,
      score_json TEXT,
      finished_at INTEGER NOT NULL
    );
  `);

  const upsertMatch = db.prepare(`
    INSERT INTO matches (
      match_id, status, created_at, updated_at,
      state_json, initial_json, metadata_json, log_json
    ) VALUES (
      @matchID, @status, @nowMs, @nowMs,
      @stateJson, @initialJson, @metadataJson, @logJson
    )
    ON CONFLICT(match_id) DO UPDATE SET
      status = excluded.status,
      updated_at = excluded.updated_at,
      state_json = COALESCE(excluded.state_json, matches.state_json),
      initial_json = COALESCE(excluded.initial_json, matches.initial_json),
      metadata_json = COALESCE(excluded.metadata_json, matches.metadata_json),
      log_json = COALESCE(excluded.log_json, matches.log_json)
  `);

  const upsertPlayer = db.prepare(`
    INSERT INTO players (match_id, player_id, name, credentials_hash)
    VALUES (@matchID, @playerID, @name, @credentialsHash)
    ON CONFLICT(match_id, player_id) DO UPDATE SET
      name = excluded.name,
      credentials_hash = excluded.credentials_hash
  `);

  const upsertSummary = db.prepare(`
    INSERT INTO match_summaries (match_id, winner_id, score_json, finished_at)
    VALUES (@matchID, @winnerID, @scoreJson, @finishedAt)
    ON CONFLICT(match_id) DO UPDATE SET
      winner_id = excluded.winner_id,
      score_json = excluded.score_json,
      finished_at = excluded.finished_at
  `);

  const loadRows = db
    .prepare(
      "SELECT match_id, state_json, initial_json, metadata_json, log_json FROM matches ORDER BY updated_at DESC"
    )
    .all() as Array<{
    match_id: string;
    state_json: string | null;
    initial_json: string | null;
    metadata_json: string | null;
    log_json: string | null;
  }>;

  for (const row of loadRows) {
    const state = safeJsonParse(row.state_json);
    const initial = safeJsonParse(row.initial_json);
    const metadata = safeJsonParse(row.metadata_json);
    const log = safeJsonParse(row.log_json);

    if (state !== null) {
      server.db.state.set(row.match_id, state);
    }

    if (initial !== null) {
      server.db.initial.set(row.match_id, initial);
    }

    if (metadata !== null) {
      server.db.metadata.set(row.match_id, metadata);
    }

    if (log !== null) {
      server.db.log.set(row.match_id, log);
    }
  }

  const persistState = (matchID: string, value: unknown) => {
    const nowMs = Date.now();
    const state = value as MatchStateLike;
    const status = state.ctx?.gameover ? "finished" : "active";

    upsertMatch.run({
      matchID,
      status,
      nowMs,
      stateJson: toJson(value),
      initialJson: null,
      metadataJson: null,
      logJson: null
    });

    const summary = state.ctx?.gameover as MatchSummaryLike | undefined;
    if (summary) {
      upsertSummary.run({
        matchID,
        winnerID: summary.winner_id ?? null,
        scoreJson: toJson(summary.scores ?? summary),
        finishedAt: nowMs
      });
    }
  };

  const persistInitial = (matchID: string, value: unknown) => {
    upsertMatch.run({
      matchID,
      status: "active",
      nowMs: Date.now(),
      stateJson: null,
      initialJson: toJson(value),
      metadataJson: null,
      logJson: null
    });
  };

  const persistMetadata = (matchID: string, value: unknown) => {
    upsertMatch.run({
      matchID,
      status: "active",
      nowMs: Date.now(),
      stateJson: null,
      initialJson: null,
      metadataJson: toJson(value),
      logJson: null
    });

    const metadata = value as MetadataLike;
    const players = metadata.players ?? {};

    for (const [playerID, player] of Object.entries(players)) {
      upsertPlayer.run({
        matchID,
        playerID,
        name: player.name ?? null,
        credentialsHash: player.credentials ?? null
      });
    }
  };

  const persistLog = (matchID: string, value: unknown) => {
    upsertMatch.run({
      matchID,
      status: "active",
      nowMs: Date.now(),
      stateJson: null,
      initialJson: null,
      metadataJson: null,
      logJson: toJson(value)
    });
  };

  const patchStore = <T>(store: MapStore<T>, onSet: (matchID: string, value: T) => void) => {
    const originalSet = store.set.bind(store);

    store.set = (matchID: string, value: T) => {
      const result = originalSet(matchID, value);
      onSet(matchID, value);
      return result;
    };
  };

  patchStore(server.db.state, (matchID, value) => persistState(matchID, value));
  patchStore(server.db.initial, (matchID, value) => persistInitial(matchID, value));
  patchStore(server.db.metadata, (matchID, value) => persistMetadata(matchID, value));
  patchStore(server.db.log, (matchID, value) => persistLog(matchID, value));

  server.app.use(async (ctx, next) => {
    if (ctx.path === "/persistence/health") {
      ctx.body = {
        ok: true,
        sqlitePath: dbPath,
        savedMatches: db.prepare("SELECT COUNT(*) as total FROM matches").get()
      };
      return;
    }

    await next();
  });

  return db;
}
