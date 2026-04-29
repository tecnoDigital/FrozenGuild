import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { FrozenGuild } from "../../../shared/game/FrozenGuild.js";
import type { FrozenGuildState } from "../../../shared/game/types.js";

export type FrozenGuildClientConfig = {
  serverUrl: string;
  matchID: string;
  playerID: string;
  credentials: string;
};

export function createFrozenGuildClient(config: FrozenGuildClientConfig) {
  return Client<FrozenGuildState>({
    game: FrozenGuild,
    multiplayer: SocketIO({ server: config.serverUrl }),
    matchID: config.matchID,
    playerID: config.playerID,
    credentials: config.credentials
  });
}
