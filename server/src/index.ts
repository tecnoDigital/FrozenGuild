import { FrozenGuild } from "../../shared/game/FrozenGuild";

import boardgameServer from "boardgame.io/dist/cjs/server.js";

const { Server } = boardgameServer;

const PORT = Number(process.env.PORT ?? 8000);

const server = Server({
  games: [FrozenGuild],
  origins: ["http://localhost:5173"]
});

server.run(PORT, () => {
  console.log(`[frozen-guild] server running on http://localhost:${PORT}`);
});
