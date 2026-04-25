import type { Ctx } from "boardgame.io";
import { calculateFinalScores } from "./scoring";
import type { FrozenGuildState } from "./types";

const INVALID_MOVE = "INVALID_MOVE" as const;

type MoveCtx = {
  G: FrozenGuildState;
  ctx: Ctx;
  playerID?: string;
  random?: {
    D6: () => number;
  };
  events?: {
    endTurn?: () => void;
    endGame?: (arg?: unknown) => void;
  };
};

function isActivePlayer(ctx: Ctx, playerID?: string): boolean {
  if (!playerID) {
    return false;
  }

  return playerID === ctx.currentPlayer;
}

export function resetTurnState(G: FrozenGuildState): void {
  G.dice.value = null;
  G.dice.rolled = false;
  G.turn.actionCompleted = false;
}

function requiresFishingAction(G: FrozenGuildState): boolean {
  if (!G.dice.rolled || G.dice.value === null) {
    return false;
  }

  return G.dice.value >= 1 && G.dice.value <= 3;
}

function isValidIceSlotIndex(slot: number, length: number): boolean {
  return Number.isInteger(slot) && slot >= 0 && slot < length;
}

export function fishFromIce(
  { G, ctx, playerID, events }: MoveCtx,
  slot: number
): typeof INVALID_MOVE | void {

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!requiresFishingAction(G)) {
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  if (!isValidIceSlotIndex(slot, G.iceGrid.length)) {
    return INVALID_MOVE;
  }

  const cardId = G.iceGrid[slot];
  if (cardId === null || cardId === undefined) {
    return INVALID_MOVE;
  }

  const player = playerID ? G.players[playerID] : undefined;
  if (!player) {
    return INVALID_MOVE;
  }

  player.zone.push(cardId);

  if (G.deck.length > 0) {
    const replacement = G.deck.shift() ?? null;
    G.iceGrid[slot] = replacement;
  } else {
    G.iceGrid[slot] = null;
    events?.endGame?.({
      reason: "ICE_CANNOT_REFILL",
      scores: calculateFinalScores(G.players)
    });
  }

  G.turn.actionCompleted = true;
}

export function rollDice({
  G,
  ctx,
  playerID,
  random
}: MoveCtx): typeof INVALID_MOVE | void {
  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (G.dice.rolled) {
    return INVALID_MOVE;
  }

  const value = random?.D6 ? random.D6() : Math.floor(Math.random() * 6) + 1;
  G.dice.value = value;
  G.dice.rolled = true;
}

export function endTurn({ G, ctx, playerID, events }: MoveCtx): typeof INVALID_MOVE | void {
  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!G.dice.rolled) {
    return INVALID_MOVE;
  }

  if (requiresFishingAction(G) && !G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  events?.endTurn?.();
}
