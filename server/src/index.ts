import { FrozenGuild } from "../../shared/game/FrozenGuild";
import { serverConfig } from "./config";
import { setupObservability } from "./observability";
import { setupSqlitePersistence } from "./storage";

import boardgameServer from "boardgame.io/dist/cjs/server.js";

const { Server } = boardgameServer;

const server = Server({
  games: [FrozenGuild],
  origins: serverConfig.origins
});

const sqlite = setupSqlitePersistence(
  server as unknown as Parameters<typeof setupSqlitePersistence>[0],
  { sqlitePath: serverConfig.sqlitePath }
);

setupObservability(server as unknown as Parameters<typeof setupObservability>[0]);

server.run(serverConfig.port, () => {
  console.log(`[frozen-guild] env=${serverConfig.nodeEnv}`);
  console.log(`[frozen-guild] server running on http://localhost:${serverConfig.port}`);
  console.log(`[frozen-guild] sqlite ready at ${sqlite.name}`);
  console.log(`[frozen-guild] cors origins: ${serverConfig.origins.join(", ")}`);
});
