type MatchStateLike = {
  G?: {
    activeTable?: boolean;
  };
  ctx?: {
    currentPlayer?: string;
    gameover?: unknown;
  };
};

type MapStore<T> = {
  entries: () => IterableIterator<[string, T]>;
};

type ServerLike = {
  db: {
    state: MapStore<unknown>;
  };
  app: {
    use: (middleware: (ctx: { path: string; method: string; status?: number; body?: unknown }, next: () => Promise<unknown>) => Promise<void>) => void;
  };
};

type MoveRouteInfo = {
  game: string;
  matchID: string;
  moveName: string;
};

function extractMoveRoute(path: string): MoveRouteInfo | null {
  const match = path.match(/^\/games\/([^/]+)\/([^/]+)\/moves\/([^/?#]+)/);
  if (!match) {
    return null;
  }

  const [, game, matchID, moveName] = match;
  if (!game || !matchID || !moveName) {
    return null;
  }

  return {
    game,
    matchID,
    moveName
  };
}

function isErrorStatus(status: number | undefined): boolean {
  if (status === undefined) {
    return false;
  }

  return status >= 400;
}

function buildTableMetrics(server: ServerLike) {
  const rows = Array.from(server.db.state.entries());
  let activeTables = 0;
  let pausedTables = 0;
  let finishedTables = 0;

  for (const [, rawState] of rows) {
    const state = rawState as MatchStateLike;

    if (state.ctx?.gameover) {
      finishedTables += 1;
      continue;
    }

    if (state.G?.activeTable === false) {
      pausedTables += 1;
    } else {
      activeTables += 1;
    }
  }

  return {
    totalTables: rows.length,
    activeTables,
    pausedTables,
    finishedTables
  };
}

export function setupObservability(server: ServerLike): void {
  server.app.use(async (ctx, next) => {
    const start = Date.now();
    const moveRoute = extractMoveRoute(ctx.path);

    try {
      await next();
      const elapsed = Date.now() - start;
      const status = ctx.status ?? 200;

      if (ctx.path.startsWith("/games/")) {
        console.log(`[http] ${ctx.method} ${ctx.path} status=${status} ${elapsed}ms`);
      }

      if (moveRoute) {
        console.log(
          `[move] game=${moveRoute.game} match=${moveRoute.matchID} move=${moveRoute.moveName} status=${status} ${elapsed}ms`
        );
      }

      if (isErrorStatus(status) && ctx.path.startsWith("/games/")) {
        console.error(`[http:error-status] ${ctx.method} ${ctx.path} status=${status} ${elapsed}ms`);
      }
    } catch (error) {
      const elapsed = Date.now() - start;

      if (moveRoute) {
        console.error(
          `[move:error] game=${moveRoute.game} match=${moveRoute.matchID} move=${moveRoute.moveName} ${elapsed}ms`,
          error
        );
      }

      console.error(`[http:error] ${ctx.method} ${ctx.path} ${elapsed}ms`, error);
      throw error;
    }
  });

  server.app.use(async (ctx, next) => {
    if (ctx.path === "/ops/health") {
      ctx.body = {
        ok: true,
        uptimeSec: Math.round(process.uptime())
      };
      return;
    }

    if (ctx.path === "/ops/metrics") {
      const memory = process.memoryUsage();
      ctx.body = {
        ...buildTableMetrics(server),
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        uptimeSec: Math.round(process.uptime())
      };
      return;
    }

    await next();
  });

  setInterval(() => {
    const metrics = buildTableMetrics(server);
    const memory = process.memoryUsage();
    console.log(
      `[ops] tables=${metrics.totalTables} active=${metrics.activeTables} paused=${metrics.pausedTables} finished=${metrics.finishedTables} rssMb=${Math.round(
        memory.rss / 1024 / 1024
      )} heapMb=${Math.round(memory.heapUsed / 1024 / 1024)}`
    );
  }, 30_000).unref();
}
