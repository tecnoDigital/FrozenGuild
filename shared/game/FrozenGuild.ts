import type { Game } from "boardgame.io";
import { createInitialState } from "./setup";
import type { FrozenGuildState } from "./types";

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }) => createInitialState(ctx.numPlayers),
  moves: {}
};
