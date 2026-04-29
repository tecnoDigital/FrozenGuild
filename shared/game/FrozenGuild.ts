import type { ActivePlayersArg, Ctx, Game } from "boardgame.io";
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

const INVALID_MOVE = "INVALID_MOVE" as const;

function isBotPlayer(G: FrozenGuildState, playerID: string): boolean {
  const player = G.players[playerID];
  if (!player) {
    return false;
  }

  return player.name.trim().toUpperCase().startsWith("BOT ");
}

function randomPick<T>(items: T[], randomFn: () => number): T | null {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * items.length);
  return items[index] ?? null;
}

function getEffectiveActionValue(G: FrozenGuildState): number | null {
  if (!G.dice.rolled || G.dice.value === null) {
    return null;
  }

  if (G.dice.value === 6) {
    return G.turn.padrinoAction;
  }

  return G.dice.value;
}

function botCanSwap(G: FrozenGuildState): boolean {
  const playersWithCards = Object.values(G.players).filter((player) => player.zone.length > 0).length;
  return playersWithCards >= 2;
}

function runBasicBotTurn(args: {
  G: FrozenGuildState;
  ctx: Ctx;
  events?:
    | {
        endTurn?: () => void;
        endGame?: (arg?: unknown) => void;
        setActivePlayers?: (arg: ActivePlayersArg) => void;
      }
    | undefined;
  random?: { D6: () => number } | undefined;
}): void {
  const { G, ctx, events, random } = args;
  const playerID = ctx.currentPlayer;
  const randomFn = () => Math.random();

  const rollResult = rollDice({ G, ctx, playerID, random });
  if (rollResult === INVALID_MOVE) {
    return;
  }

  if (G.dice.value === 6) {
    const padrinoOptions = [1, 2, 3, 4, 5].filter((value) => value !== 5 || botCanSwap(G));
    const chosen = randomPick(padrinoOptions, randomFn);
    if (chosen !== null) {
      choosePadrinoAction({ G, ctx, playerID }, chosen as 1 | 2 | 3 | 4 | 5);
    }
  }

  const action = getEffectiveActionValue(G);

  if (action !== null && action >= 1 && action <= 3) {
    const fishableSlots = G.iceGrid
      .map((cardId, slot) => (typeof cardId === "string" ? slot : -1))
      .filter((slot) => slot >= 0);
    const slot = randomPick(fishableSlots, randomFn);
    if (slot !== null) {
      fishFromIce({ G, ctx, playerID, events }, slot);
    }
  } else if (action === 4) {
    const revealed = G.iceGrid
      .map((cardId, slot) => (typeof cardId === "string" ? slot : -1))
      .filter((slot) => slot >= 0)
      .slice(0, 3);

    const spyResult = spyOnIce({ G, ctx, playerID }, revealed);
    if (spyResult !== INVALID_MOVE) {
      const otherPlayers = Object.keys(G.players).filter((id) => id !== playerID);
      const target = randomPick(otherPlayers, randomFn);
      const giftSlot = randomPick(revealed, randomFn);

      if (target && giftSlot !== null && randomFn() < 0.5) {
        const giftResult = spyGiveCard({ G, ctx, playerID, events }, giftSlot, target);
        if (giftResult === INVALID_MOVE) {
          completeSpy({ G, ctx, playerID });
        }
      } else {
        completeSpy({ G, ctx, playerID });
      }
    }
  } else if (action === 5) {
    const candidates = Object.entries(G.players)
      .filter(([, player]) => player.zone.length > 0)
      .map(([id]) => id);

    const firstPlayerID = randomPick(candidates, randomFn);
    const secondPlayerID = randomPick(
      candidates.filter((id) => id !== firstPlayerID),
      randomFn
    );

    if (firstPlayerID && secondPlayerID) {
      const firstPlayer = G.players[firstPlayerID]!;
      const secondPlayer = G.players[secondPlayerID]!;
      const firstIndex = Math.floor(randomFn() * firstPlayer.zone.length);
      const secondIndex = Math.floor(randomFn() * secondPlayer.zone.length);

      swapCards(
        { G, ctx, playerID, events },
        { area: "player_zone", playerID: firstPlayerID, index: firstIndex },
        { area: "player_zone", playerID: secondPlayerID, index: secondIndex }
      );
    }
  }

  if (G.orcaResolution?.playerID === playerID) {
    const target = G.orcaResolution.validTargetCardIDs[0];
    if (target) {
      resolveOrcaDestroy({ G, ctx, playerID, events }, target);
    }
  }

  if (G.sealBombResolution?.playerID === playerID) {
    const targets = G.sealBombResolution.validTargetCardIDs.slice(
      0,
      G.sealBombResolution.requiredDiscardCount
    );
    resolveSealBombExplosion({ G, ctx, playerID }, targets);
  }

  endTurn({ G, ctx, playerID, events });
}

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }) => createInitialState(ctx.numPlayers),
  turn: {
    onBegin: ({ G, ctx, events, random }) => {
      resetTurnState(G);
      setBombAtTurnStart(G, ctx.currentPlayer);

      if (isBotPlayer(G, ctx.currentPlayer)) {
        runBasicBotTurn({ G, ctx, events, random });
      }
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
