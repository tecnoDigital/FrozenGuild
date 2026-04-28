import type { Game } from "boardgame.io";
import {
  endTurn,
  fishFromIce,
  markPlayerDisconnected,
  markPlayerReconnected,
  processAutoResolve,
  resolveOrcaDestroy,
  resetTurnState,
  rollDice,
  setTableActive,
  swapCards
} from "./moves";
import { buildPlayerView } from "./playerView";
import { createInitialState } from "./setup";
import type { FrozenGuildState } from "./types";

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }) => createInitialState(ctx.numPlayers),
  turn: {
    stages: {
      ORCA_DESTROY_SELECTION: {
        moves: {
          resolveOrcaDestroy
        }
      }
    },
    onBegin: ({ G, ctx, events }) => {
      resetTurnState(G);

      const current = G.players[ctx.currentPlayer];
      if (!current || current.connectionStatus !== "absent") {
        return;
      }

      if (!G.activeTable) {
        return;
      }

      const hasAnotherOnline = Object.entries(G.players).some(([playerID, player]) => {
        if (playerID === ctx.currentPlayer) {
          return false;
        }

        return player.connectionStatus === "connected" || player.connectionStatus === "reconnecting";
      });

      if (hasAnotherOnline) {
        events?.endTurn?.();
      }
    }
  },
  moves: {
    rollDice,
    fishFromIce,
    swapCards,
    markPlayerDisconnected,
    markPlayerReconnected,
    processAutoResolve,
    resolveOrcaDestroy,
    setTableActive,
    endTurn
  },
  playerView: ({ G }) => buildPlayerView(G)
};
