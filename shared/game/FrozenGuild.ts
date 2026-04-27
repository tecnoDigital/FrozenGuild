import type { Game } from "boardgame.io";
import {
  choosePadrinoAction,
  completeSpy,
  endTurn,
  fishFromIce,
  resolveOrcaDestroy,
  resolveSealBombExplosion,
  resetTurnState,
  rollDice,
  setBombAtTurnStart,
  spyGiveCard,
  spyOnIce,
  swapCards
} from "./moves";
import { buildPlayerView } from "./playerView";
import { createInitialState } from "./setup";
import type { FrozenGuildState } from "./types";

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }) => createInitialState(ctx.numPlayers),
  turn: {
    onBegin: ({ G, ctx }) => {
      resetTurnState(G);
      setBombAtTurnStart(G, ctx.currentPlayer);
    }
  },
  moves: {
    rollDice,
    fishFromIce,
    spyOnIce,
    completeSpy,
    spyGiveCard,
    swapCards,
    choosePadrinoAction,
    resolveOrcaDestroy,
    resolveSealBombExplosion,
    endTurn
  },
  playerView: ({ G, playerID }) => buildPlayerView(G, playerID)
};
