import type { Ctx } from "boardgame.io";
import { calculateFinalScores } from "./scoring";
import { getCardById } from "./cards";
import type { FrozenGuildState, SwapLocation } from "./types";

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

function isSealBombCard(cardID: string): boolean {
  return getCardById(cardID)?.type === "seal_bomb";
}

function hasPendingMandatoryResolution(G: FrozenGuildState): boolean {
  return G.orcaResolution !== null || G.sealBombResolution !== null;
}

function removeCardFromPlayerZoneById(
  G: FrozenGuildState,
  playerID: string,
  cardID: string
): boolean {
  const player = G.players[playerID];
  if (!player) {
    return false;
  }

  const index = player.zone.findIndex((zoneCardID) => zoneCardID === cardID);
  if (index < 0) {
    return false;
  }

  player.zone.splice(index, 1);
  return true;
}

function triggerOrcaResolutionOnReceive(
  G: FrozenGuildState,
  playerID: string,
  cardID: string
): void {
  const card = getCardById(cardID);
  if (!card || card.type !== "orca") {
    return;
  }

  const player = G.players[playerID];
  if (!player) {
    return;
  }

  const validTargetCardIDs = player.zone.filter((zoneCardID) => zoneCardID !== cardID);

  if (validTargetCardIDs.length === 0) {
    if (removeCardFromPlayerZoneById(G, playerID, cardID)) {
      G.discardPile.push(cardID);
    }
    return;
  }

  G.orcaResolution = {
    playerID,
    orcaCardID: cardID,
    validTargetCardIDs
  };
}

function addCardToPlayerZoneWithEffects(
  G: FrozenGuildState,
  playerID: string,
  cardID: string
): void {
  const player = G.players[playerID];
  if (!player) {
    return;
  }

  player.zone.push(cardID);
  triggerOrcaResolutionOnReceive(G, playerID, cardID);
}

export function setBombAtTurnStart(G: FrozenGuildState, playerID: string): void {
  const player = G.players[playerID];
  if (!player) {
    return;
  }

  player.hasBombAtStart = player.zone.some((cardID) => isSealBombCard(cardID));
}

function triggerSealBombResolutionIfNeeded(G: FrozenGuildState, playerID: string): boolean {
  const player = G.players[playerID];
  if (!player || !player.hasBombAtStart) {
    return false;
  }

  const bombCardID = player.zone.find((cardID) => isSealBombCard(cardID));
  if (!bombCardID) {
    player.hasBombAtStart = false;
    return false;
  }

  const validTargetCardIDs = player.zone.filter((cardID) => cardID !== bombCardID);
  const requiredDiscardCount = Math.min(2, validTargetCardIDs.length);

  if (requiredDiscardCount === 0) {
    if (removeCardFromPlayerZoneById(G, playerID, bombCardID)) {
      G.discardPile.push(bombCardID);
    }
    player.hasBombAtStart = false;
    return false;
  }

  G.sealBombResolution = {
    playerID,
    bombCardID,
    requiredDiscardCount,
    validTargetCardIDs
  };

  return true;
}

export function resetTurnState(G: FrozenGuildState): void {
  G.dice.value = null;
  G.dice.rolled = false;
  G.turn.actionCompleted = false;
  G.turn.padrinoAction = null;
  G.spy = null;
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

function requiresActionForDiceValue(G: FrozenGuildState, value: number): boolean {
  return getEffectiveActionValue(G) === value;
}

function requiresFishingAction(G: FrozenGuildState): boolean {
  const effectiveAction = getEffectiveActionValue(G);
  return effectiveAction !== null && effectiveAction >= 1 && effectiveAction <= 3;
}

function requiresSpyAction(G: FrozenGuildState): boolean {
  return requiresActionForDiceValue(G, 4);
}

function requiresSwapAction(G: FrozenGuildState): boolean {
  return requiresActionForDiceValue(G, 5);
}

function requiresPadrinoSelection(G: FrozenGuildState): boolean {
  return G.dice.rolled && G.dice.value === 6 && G.turn.padrinoAction === null;
}

function isValidIceSlotIndex(slot: number, length: number): boolean {
  return Number.isInteger(slot) && slot >= 0 && slot < length;
}

function sameLocation(source: SwapLocation, target: SwapLocation): boolean {
  if (source.area !== target.area) {
    return false;
  }

  if (source.area === "ice_grid" && target.area === "ice_grid") {
    return source.slot === target.slot;
  }

  if (source.area === "player_zone" && target.area === "player_zone") {
    return source.playerID === target.playerID && source.index === target.index;
  }

  return false;
}

function readCardFromLocation(G: FrozenGuildState, location: SwapLocation): string | null {
  if (location.area === "ice_grid") {
    if (!isValidIceSlotIndex(location.slot, G.iceGrid.length)) {
      return null;
    }

    const cardId = G.iceGrid[location.slot];
    return typeof cardId === "string" ? cardId : null;
  }

  const player = G.players[location.playerID];
  if (!player) {
    return null;
  }

  if (!Number.isInteger(location.index) || location.index < 0 || location.index >= player.zone.length) {
    return null;
  }

  return player.zone[location.index] ?? null;
}

function writeCardToLocation(G: FrozenGuildState, location: SwapLocation, cardId: string): void {
  if (location.area === "ice_grid") {
    G.iceGrid[location.slot] = cardId;
    return;
  }

  const player = G.players[location.playerID];
  if (!player) {
    return;
  }

  player.zone[location.index] = cardId;
}

function refillIceSlotOrEndGame(
  G: FrozenGuildState,
  slot: number,
  events?: MoveCtx["events"]
): void {
  if (G.deck.length > 0) {
    const replacement = G.deck.shift() ?? null;
    G.iceGrid[slot] = replacement;
    return;
  }

  G.iceGrid[slot] = null;
  events?.endGame?.({
    reason: "ICE_CANNOT_REFILL",
    scores: calculateFinalScores(G.players)
  });
}

export function fishFromIce(
  { G, ctx, playerID, events }: MoveCtx,
  slot: number
): typeof INVALID_MOVE | void {

  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

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

  if (typeof cardId !== "string") {
    return INVALID_MOVE;
  }

  const player = playerID ? G.players[playerID] : undefined;
  if (!playerID || !player) {
    return INVALID_MOVE;
  }

  addCardToPlayerZoneWithEffects(G, playerID, cardId);

  refillIceSlotOrEndGame(G, slot, events);

  G.turn.actionCompleted = true;
}

export function spyOnIce(
  { G, ctx, playerID }: MoveCtx,
  slots: number[]
): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!requiresSpyAction(G)) {
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted || G.spy) {
    return INVALID_MOVE;
  }

  if (!Array.isArray(slots) || slots.length < 1 || slots.length > 3) {
    return INVALID_MOVE;
  }

  const uniqueSlots = [...new Set(slots)];
  if (uniqueSlots.length !== slots.length) {
    return INVALID_MOVE;
  }

  const hasInvalidSlot = uniqueSlots.some((slot) => {
    if (!isValidIceSlotIndex(slot, G.iceGrid.length)) {
      return true;
    }

    return G.iceGrid[slot] === null;
  });

  if (hasInvalidSlot || !playerID) {
    return INVALID_MOVE;
  }

  G.spy = {
    playerID,
    revealedSlots: uniqueSlots
  };
}

export function completeSpy({ G, ctx, playerID }: MoveCtx): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!G.spy || G.spy.playerID !== playerID) {
    return INVALID_MOVE;
  }

  G.spy = null;
  G.turn.actionCompleted = true;
}

export function spyGiveCard(
  { G, ctx, playerID, events }: MoveCtx,
  slot: number,
  targetPlayerID: string
): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!G.spy || G.spy.playerID !== playerID) {
    return INVALID_MOVE;
  }

  if (!isValidIceSlotIndex(slot, G.iceGrid.length) || !G.spy.revealedSlots.includes(slot)) {
    return INVALID_MOVE;
  }

  if (!targetPlayerID || targetPlayerID === playerID) {
    return INVALID_MOVE;
  }

  const targetPlayer = G.players[targetPlayerID];
  if (!targetPlayer) {
    return INVALID_MOVE;
  }

  const cardId = G.iceGrid[slot];
  if (typeof cardId !== "string") {
    return INVALID_MOVE;
  }

  addCardToPlayerZoneWithEffects(G, targetPlayerID, cardId);
  refillIceSlotOrEndGame(G, slot, events);
  G.spy = null;
  G.turn.actionCompleted = true;
}

export function swapCards(
  { G, ctx, playerID }: MoveCtx,
  source: SwapLocation,
  target: SwapLocation
): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!requiresSwapAction(G)) {
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  if (!source || !target || sameLocation(source, target)) {
    return INVALID_MOVE;
  }

  if (source.area !== "player_zone" || target.area !== "player_zone") {
    return INVALID_MOVE;
  }

  if (source.playerID === target.playerID) {
    return INVALID_MOVE;
  }

  const sourceCard = readCardFromLocation(G, source);
  const targetCard = readCardFromLocation(G, target);

  if (!sourceCard || !targetCard) {
    return INVALID_MOVE;
  }

  writeCardToLocation(G, source, targetCard);
  writeCardToLocation(G, target, sourceCard);

  triggerOrcaResolutionOnReceive(G, source.playerID, targetCard);
  triggerOrcaResolutionOnReceive(G, target.playerID, sourceCard);

  G.turn.actionCompleted = true;
}

export function rollDice({
  G,
  ctx,
  playerID,
  random
}: MoveCtx): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

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

export function choosePadrinoAction(
  { G, ctx, playerID }: MoveCtx,
  action: 1 | 2 | 3 | 4 | 5
): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!G.dice.rolled || G.dice.value !== 6) {
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted || G.turn.padrinoAction !== null) {
    return INVALID_MOVE;
  }

  if (!Number.isInteger(action) || action < 1 || action > 5) {
    return INVALID_MOVE;
  }

  G.turn.padrinoAction = action;
}

export function resolveOrcaDestroy(
  { G, playerID }: MoveCtx,
  targetCardID: string
): typeof INVALID_MOVE | void {
  const pending = G.orcaResolution;
  if (!pending || !playerID || pending.playerID !== playerID) {
    return INVALID_MOVE;
  }

  if (!pending.validTargetCardIDs.includes(targetCardID)) {
    return INVALID_MOVE;
  }

  const removedOrca = removeCardFromPlayerZoneById(G, playerID, pending.orcaCardID);
  const removedTarget = removeCardFromPlayerZoneById(G, playerID, targetCardID);

  if (!removedTarget) {
    return INVALID_MOVE;
  }

  if (removedOrca) {
    G.discardPile.push(pending.orcaCardID);
  }

  G.discardPile.push(targetCardID);
  G.orcaResolution = null;
}

export function resolveSealBombExplosion(
  { G, playerID }: MoveCtx,
  targetCardIDs: string[]
): typeof INVALID_MOVE | void {
  const pending = G.sealBombResolution;
  if (!pending || !playerID || pending.playerID !== playerID) {
    return INVALID_MOVE;
  }

  if (!Array.isArray(targetCardIDs) || targetCardIDs.length !== pending.requiredDiscardCount) {
    return INVALID_MOVE;
  }

  const uniqueTargets = [...new Set(targetCardIDs)];
  if (uniqueTargets.length !== targetCardIDs.length) {
    return INVALID_MOVE;
  }

  const invalidTarget = uniqueTargets.some(
    (cardID) => !pending.validTargetCardIDs.includes(cardID)
  );
  if (invalidTarget) {
    return INVALID_MOVE;
  }

  for (const targetCardID of uniqueTargets) {
    const removed = removeCardFromPlayerZoneById(G, playerID, targetCardID);
    if (!removed) {
      return INVALID_MOVE;
    }
  }

  const removedBomb = removeCardFromPlayerZoneById(G, playerID, pending.bombCardID);
  if (removedBomb) {
    G.discardPile.push(pending.bombCardID);
  }

  for (const targetCardID of uniqueTargets) {
    G.discardPile.push(targetCardID);
  }

  G.players[playerID]!.hasBombAtStart = false;
  G.sealBombResolution = null;
}

export function endTurn({ G, ctx, playerID, events }: MoveCtx): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    return INVALID_MOVE;
  }

  if (!G.dice.rolled) {
    return INVALID_MOVE;
  }

  if (requiresPadrinoSelection(G)) {
    return INVALID_MOVE;
  }

  if (requiresFishingAction(G) && !G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  if (requiresSpyAction(G) && !G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  if (requiresSwapAction(G) && !G.turn.actionCompleted) {
    return INVALID_MOVE;
  }

  if (playerID && triggerSealBombResolutionIfNeeded(G, playerID)) {
    return INVALID_MOVE;
  }

  events?.endTurn?.();
}
