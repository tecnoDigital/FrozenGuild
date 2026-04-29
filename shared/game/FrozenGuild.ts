import type { Game } from "boardgame.io";
import {
  choosePadrinoAction,
  completeSpy,
  endTurn,
  fishFromIce,
  markPlayerDisconnected,
  markPlayerReconnected,
  resolveOrcaDestroy,
  resolveSealBombExplosion,
  resetTurnState,
  rollDice,
  setBombAtTurnStart,
  setTableActive,
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
    endTurn,
    setTableActive,
    markPlayerDisconnected,
    markPlayerReconnected
  },
  playerView: ({ G, playerID }) => buildPlayerView(G, playerID)
};
