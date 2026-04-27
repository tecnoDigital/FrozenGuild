import type { Ctx } from "boardgame.io";
import { calculateFinalScores } from "./scoring";
import type { FrozenGuildState } from "./types";

const INVALID_MOVE = "INVALID_MOVE" as const;
export const DISCONNECT_GRACE_MS = 30_000;

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

function hasConnectedOrReconnectingPlayersExceptCurrent(
  G: FrozenGuildState,
  currentPlayer: string
): boolean {
  return Object.entries(G.players).some(([playerID, player]) => {
    if (playerID === currentPlayer) {
      return false;
    }

    return player.connectionStatus === "connected" || player.connectionStatus === "reconnecting";
  });
}

function removePendingTurnSkip(G: FrozenGuildState, playerID: string): void {
  G.autoResolveQueue = G.autoResolveQueue.filter(
    (item) => !(item.playerID === playerID && item.stageType === "TURN_SKIP")
  );
}

function upsertPendingTurnSkip(G: FrozenGuildState, playerID: string, startedAt: number): void {
  removePendingTurnSkip(G, playerID);
  G.autoResolveQueue.push({
    playerID,
    stageType: "TURN_SKIP",
    startedAt,
    resolveAfterMs: DISCONNECT_GRACE_MS
  });
}

export function resetTurnState(G: FrozenGuildState): void {
  G.dice.value = null;
  G.dice.rolled = false;
  G.turn.actionCompleted = false;
}

export function markPlayerDisconnected(
  { G, playerID }: MoveCtx,
  nowMs: number = Date.now()
): typeof INVALID_MOVE | void {
  if (!playerID) {
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  player.connectionStatus = "reconnecting";
  player.disconnectStartedAt = nowMs;
  upsertPendingTurnSkip(G, playerID, nowMs);
}

export function markPlayerReconnected({ G, playerID }: MoveCtx): typeof INVALID_MOVE | void {
  if (!playerID) {
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  player.connectionStatus = "connected";
  delete player.disconnectStartedAt;
  removePendingTurnSkip(G, playerID);
}

export function processAutoResolve({ G, ctx, events }: MoveCtx, nowMs: number = Date.now()): void {
  if (!G.activeTable) {
    return;
  }

  const nextQueue = [];

  for (const item of G.autoResolveQueue) {
    const isDue = nowMs - item.startedAt >= item.resolveAfterMs;
    if (!isDue) {
      nextQueue.push(item);
      continue;
    }

    if (item.stageType !== "TURN_SKIP") {
      continue;
    }

    const player = G.players[item.playerID];
    if (!player) {
      continue;
    }

    if (player.connectionStatus === "reconnecting") {
      player.connectionStatus = "absent";
      delete player.disconnectStartedAt;
    }
  }

  G.autoResolveQueue = nextQueue;

  const currentPlayer = G.players[ctx.currentPlayer];
  if (!currentPlayer || currentPlayer.connectionStatus !== "absent") {
    return;
  }

  if (!hasConnectedOrReconnectingPlayersExceptCurrent(G, ctx.currentPlayer)) {
    return;
  }

  events?.endTurn?.();
}

export function setTableActive(
  { G, playerID }: MoveCtx,
  active: boolean
): typeof INVALID_MOVE | void {
  if (!playerID) {
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  G.activeTable = active;
}

function requiresFishingAction(G: FrozenGuildState): boolean {
  if (!G.dice.rolled || G.dice.value === null) {
    return false;
  }

  return G.dice.value >= 1 && G.dice.value <= 3;
}

function requiresSwapAction(G: FrozenGuildState): boolean {
  if (!G.dice.rolled || G.dice.value === null) {
    return false;
  }

  return G.dice.value === 5;
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

export function swapCards(
  { G, ctx, playerID }: MoveCtx,
  firstPlayerID: string,
  firstCardID: string,
  secondPlayerID: string,
  secondCardID: string
): typeof INVALID_MOVE | void {
  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!requiresSwapAction(G)) {
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  const firstPlayer = G.players[firstPlayerID];
  const secondPlayer = G.players[secondPlayerID];

  if (!firstPlayer || !secondPlayer) {
    return INVALID_MOVE;
  }

  if (firstPlayerID === secondPlayerID) {
    return INVALID_MOVE;
  }

  const firstIndex = firstPlayer.zone.indexOf(firstCardID);
  const secondIndex = secondPlayer.zone.indexOf(secondCardID);

  if (firstIndex === -1 || secondIndex === -1) {
    return INVALID_MOVE;
  }

  firstPlayer.zone[firstIndex] = secondCardID;
  secondPlayer.zone[secondIndex] = firstCardID;
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

  if (requiresSwapAction(G) && !G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  events?.endTurn?.();
}
