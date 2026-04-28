import type { Ctx } from "boardgame.io";
import { getCardById } from "./cards";
import { calculateFinalScores } from "./scoring";
import type { FrozenGuildState, PlayerID } from "./types";

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

type LegacyPlayerZoneRef = {
  area: "player_zone";
  playerID: string;
  index: number;
};

type SwapRef = string | LegacyPlayerZoneRef;

function isDevRuntime(): boolean {
  const mode = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV;
  return mode !== "production";
}

function logInvalidSwap(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.warn(`[swapCards:INVALID_MOVE] ${reason}`, details);
}

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

function hasPendingOrcaSelection(G: FrozenGuildState): boolean {
  return G.pendingStage?.type === "ORCA_DESTROY_SELECTION";
}

function setActivePlayersMaybe(events: MoveCtx["events"], value: unknown): void {
  const pluginEvents = events as unknown as {
    setActivePlayers?: (arg: unknown) => void;
  };

  pluginEvents.setActivePlayers?.(value);
}

function startOrcaSelectionStage(
  G: FrozenGuildState,
  events: MoveCtx["events"],
  playerID: PlayerID,
  orcaCardID: string
): void {
  const player = G.players[playerID];
  if (!player) {
    return;
  }

  const validTargets = player.zone.filter((cardID) => cardID !== orcaCardID);
  const targets = validTargets.length > 0 ? validTargets : [orcaCardID];

  G.pendingStage = {
    type: "ORCA_DESTROY_SELECTION",
    playerID,
    orcaCardID,
    validTargets: targets
  };

  setActivePlayersMaybe(events, {
    value: {
      [playerID]: "ORCA_DESTROY_SELECTION"
    }
  });
}

function clearPendingStage(G: FrozenGuildState, events: MoveCtx["events"]): void {
  G.pendingStage = null;
  setActivePlayersMaybe(events, { value: null });
}

function isLegacyPlayerZoneRef(value: unknown): value is LegacyPlayerZoneRef {
  if (!value || typeof value !== "object") {
    return false;
  }

  const ref = value as Partial<LegacyPlayerZoneRef>;
  return (
    ref.area === "player_zone" &&
    typeof ref.playerID === "string" &&
    Number.isInteger(ref.index) &&
    (ref.index as number) >= 0
  );
}

function resolveSwapCardID(G: FrozenGuildState, ref: SwapRef, expectedPlayerID: string): string | null {
  if (typeof ref === "string") {
    return ref;
  }

  if (!isLegacyPlayerZoneRef(ref)) {
    return null;
  }

  if (ref.playerID !== expectedPlayerID) {
    return null;
  }

  const player = G.players[ref.playerID];
  if (!player) {
    return null;
  }

  const cardID = player.zone[ref.index];
  return typeof cardID === "string" ? cardID : null;
}

export function fishFromIce(
  { G, ctx, playerID, events }: MoveCtx,
  slot: number
): typeof INVALID_MOVE | void {
  if (!playerID) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!requiresFishingAction(G)) {
    return INVALID_MOVE;
  }

  if (hasPendingOrcaSelection(G)) {
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

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  player.zone.push(cardId);

  const card = getCardById(cardId);
  if (card?.type === "orca") {
    startOrcaSelectionStage(G, events, playerID, cardId);
  }

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
  { G, ctx, playerID, events }: MoveCtx,
  firstPlayerID: string,
  firstCardRef: SwapRef,
  secondPlayerID: string,
  secondCardRef: SwapRef
): typeof INVALID_MOVE | void {
  if (!isActivePlayer(ctx, playerID)) {
    logInvalidSwap("NOT_ACTIVE_PLAYER", {
      playerID,
      currentPlayer: ctx.currentPlayer
    });
    return INVALID_MOVE;
  }

  if (!requiresSwapAction(G)) {
    logInvalidSwap("DICE_NOT_SWAP", {
      rolled: G.dice.rolled,
      diceValue: G.dice.value
    });
    return INVALID_MOVE;
  }

  if (hasPendingOrcaSelection(G)) {
    logInvalidSwap("PENDING_ORCA_SELECTION", {
      pendingStage: G.pendingStage
    });
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted) {
    logInvalidSwap("ACTION_ALREADY_COMPLETED", {
      actionCompleted: G.turn.actionCompleted
    });
    return INVALID_MOVE;
  }

  const firstPlayer = G.players[firstPlayerID];
  const secondPlayer = G.players[secondPlayerID];

  if (!firstPlayer || !secondPlayer) {
    logInvalidSwap("PLAYER_NOT_FOUND", {
      firstPlayerID,
      secondPlayerID,
      firstExists: !!firstPlayer,
      secondExists: !!secondPlayer
    });
    return INVALID_MOVE;
  }

  if (firstPlayerID === secondPlayerID) {
    logInvalidSwap("SAME_PLAYER_SELECTED", {
      firstPlayerID,
      secondPlayerID
    });
    return INVALID_MOVE;
  }

  const firstCardID = resolveSwapCardID(G, firstCardRef, firstPlayerID);
  const secondCardID = resolveSwapCardID(G, secondCardRef, secondPlayerID);

  if (!firstCardID || !secondCardID) {
    logInvalidSwap("CARD_REF_RESOLVE_FAILED", {
      firstPlayerID,
      secondPlayerID,
      firstCardRef,
      secondCardRef,
      firstCardID,
      secondCardID
    });
    return INVALID_MOVE;
  }

  const firstIndex = firstPlayer.zone.indexOf(firstCardID);
  const secondIndex = secondPlayer.zone.indexOf(secondCardID);

  if (firstIndex === -1 || secondIndex === -1) {
    logInvalidSwap("CARD_NOT_IN_PLAYER_ZONE", {
      firstPlayerID,
      secondPlayerID,
      firstCardID,
      secondCardID,
      firstIndex,
      secondIndex
    });
    return INVALID_MOVE;
  }

  firstPlayer.zone[firstIndex] = secondCardID;
  secondPlayer.zone[secondIndex] = firstCardID;

  const cardGivenToFirst = getCardById(secondCardID);
  if (cardGivenToFirst?.type === "orca") {
    startOrcaSelectionStage(G, events, firstPlayerID, secondCardID);
  }

  const cardGivenToSecond = getCardById(firstCardID);
  if (!hasPendingOrcaSelection(G) && cardGivenToSecond?.type === "orca") {
    startOrcaSelectionStage(G, events, secondPlayerID, firstCardID);
  }

  G.turn.actionCompleted = true;
}

export function resolveOrcaDestroy(
  { G, playerID, events }: MoveCtx,
  targetCardID: string
): typeof INVALID_MOVE | void {
  const pending = G.pendingStage;
  if (!pending || pending.type !== "ORCA_DESTROY_SELECTION") {
    return INVALID_MOVE;
  }

  if (!playerID || playerID !== pending.playerID) {
    return INVALID_MOVE;
  }

  if (!pending.validTargets.includes(targetCardID)) {
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  const orcaIndex = player.zone.indexOf(pending.orcaCardID);
  if (orcaIndex === -1) {
    clearPendingStage(G, events);
    return INVALID_MOVE;
  }

  player.zone.splice(orcaIndex, 1);
  G.discardPile.push(pending.orcaCardID);

  if (targetCardID !== pending.orcaCardID) {
    const targetIndex = player.zone.indexOf(targetCardID);
    if (targetIndex === -1) {
      clearPendingStage(G, events);
      return INVALID_MOVE;
    }

    player.zone.splice(targetIndex, 1);
    G.discardPile.push(targetCardID);
  }

  clearPendingStage(G, events);
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

  if (hasPendingOrcaSelection(G)) {
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

  if (hasPendingOrcaSelection(G)) {
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
