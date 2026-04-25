import type { Game } from "boardgame.io";
import { endTurn, fishFromIce, resetTurnState, rollDice } from "./moves";
import { buildPlayerView } from "./playerView";
import { createInitialState } from "./setup";
import type { FrozenGuildState } from "./types";

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }) => createInitialState(ctx.numPlayers),
  turn: {
    onBegin: ({ G }) => {
      resetTurnState(G);
    }
  },
  moves: {
    rollDice,
    fishFromIce,
    endTurn
  },
  playerView: ({ G }) => buildPlayerView(G)
};
