import { FrozenGuild } from "../../shared/game/FrozenGuild";
import { createRequire } from "node:module";

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

const PORT = Number(process.env.PORT ?? 8000);

const allowedOrigins =
  process.env.CORS_ORIGINS === "*"
    ? ["*"]
    : (
        process.env.CORS_ORIGINS ??
        "*,http://localhost:5173,http://127.0.0.1:5173,http://0.0.0.0:5173"
      )
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const server = Server({
  games: [FrozenGuild],
  origins: allowedOrigins
});

server.run(PORT, () => {
  console.log(`[frozen-guild] server running on http://localhost:${PORT}`);
});
