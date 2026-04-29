import { FrozenGuild } from "../../shared/game/FrozenGuild.js";
import { createRequire } from "node:module";
import { serverConfig } from "./config.js";
import { setupObservability } from "./observability.js";
import { setupSqlitePersistence } from "./storage.js";

const require = createRequire(import.meta.url);

const generatorFunctionModule = require("generator-function");
if (
  typeof generatorFunctionModule !== "function" &&
  generatorFunctionModule &&
  typeof generatorFunctionModule.default === "function"
) {
  const generatorFunctionPath = require.resolve("generator-function");
  if (require.cache?.[generatorFunctionPath]) {
    require.cache[generatorFunctionPath].exports = generatorFunctionModule.default;
  }
}

const boardgameServer = await import("boardgame.io/dist/cjs/server.js");
const Server = boardgameServer.default?.Server ?? boardgameServer.Server;

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
