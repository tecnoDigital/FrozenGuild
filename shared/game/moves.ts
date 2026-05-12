import type { ActivePlayersArg, Ctx } from "boardgame.io";
import { getCardById } from "./cards.js";
import { calculateFinalScores } from "./scoring.js";
import { isValidPlayerColorID } from "./playerColors.js";
import type { FinalResults, FrozenGuildState, SwapLocation } from "./types.js";

const INVALID_MOVE = "INVALID_MOVE" as const;
export const DISCONNECT_GRACE_MS = 30_000;

function isBotPlayerState(G: FrozenGuildState, playerID: string): boolean {
  if (G.botIDs?.includes(playerID)) {
    return true;
  }
  const player = G.players[playerID];
  return player ? player.name.trim().toUpperCase().startsWith("BOT ") : false;
}

type MoveCtx = {
  G: FrozenGuildState;
  ctx: Ctx;
  playerID?: string | undefined;
  random?:
    | {
        D6: () => number;
      }
    | undefined;
  events?:
    | {
        endTurn?: () => void;
        endGame?: (arg?: unknown) => void;
        setActivePlayers?: (arg: ActivePlayersArg) => void;
      }
    | undefined;
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

function logInvalidOrca(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.warn(`[resolveOrcaDestroy:INVALID_MOVE] ${reason}`, details);
}

function logInvalidSealBomb(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.warn(`[resolveSealBombExplosion:INVALID_MOVE] ${reason}`, details);
}

function logInvalidFish(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.log(`[fishFromIce:INVALID_MOVE] ${reason}`, details);
}

function logEndTurnGuard(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.log(`[endTurn:GUARD] ${reason}`, details);
}

function isActivePlayer(ctx: Ctx, playerID?: string): boolean {
  return !!playerID && playerID === ctx.currentPlayer;
}

function calculateDensePlacements(players: Array<{ playerID: string; fishes: number }>): Map<string, number> {
  let lastFishes: number | null = null;
  let placement = 0;
  const placements = new Map<string, number>();

  for (const player of players) {
    if (lastFishes === null || player.fishes !== lastFishes) {
      placement += 1;
      lastFishes = player.fishes;
    }
    placements.set(player.playerID, placement);
  }

  return placements;
}

function buildFinalResults(G: FrozenGuildState): FinalResults {
  const byPlayer = calculateFinalScores(G.players);
  const ranked = Object.entries(byPlayer)
    .map(([playerID, score]) => ({
      playerID,
      nickname: G.players[playerID]?.name ?? `Player ${playerID}`,
      avatarId: G.players[playerID]?.avatarId ?? "penguin1",
      fishes: score.total
    }))
    .sort((a, b) => b.fishes - a.fishes || a.playerID.localeCompare(b.playerID));

  const placementByPlayer = calculateDensePlacements(ranked);

  return {
    players: ranked.map((player) => ({
      ...player,
      placement: placementByPlayer.get(player.playerID) ?? 1
    }))
  };
}

export function setPlayerProfile(
  { G, playerID }: MoveCtx,
  profile: { nickname?: string; avatarId?: string; colorId?: string }
): typeof INVALID_MOVE | void {
  if (!playerID) {
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    return INVALID_MOVE;
  }

  if (typeof profile.nickname === "string" && profile.nickname.trim().length > 0) {
    player.name = profile.nickname.trim().slice(0, 40);
  }

  if (typeof profile.avatarId === "string" && profile.avatarId.trim().length > 0) {
    player.avatarId = profile.avatarId.trim().slice(0, 40);
  }

  if (typeof profile.colorId === "string" && isValidPlayerColorID(profile.colorId)) {
    player.colorId = profile.colorId;
  }
}

export function isSealBombCard(cardID: string): boolean {
  return getCardById(cardID)?.type === "seal_bomb";
}

export function isOrcaCard(cardID: string): boolean {
  return getCardById(cardID)?.type === "orca";
}

function hasPendingMandatoryResolution(G: FrozenGuildState): boolean {
  return G.orcaResolution !== null || G.sealBombResolution !== null || G.pendingStage !== null;
}

function clearPendingStage(G: FrozenGuildState, events?: MoveCtx["events"]): void {
  G.pendingStage = null;
  events?.setActivePlayers?.({});
}

function syncPendingStageFromOrcaResolution(
  G: FrozenGuildState,
  events?: MoveCtx["events"]
): void {
  if (!G.orcaResolution) {
    clearPendingStage(G, events);
    return;
  }

  G.pendingStage = {
    type: "ORCA_DESTROY_SELECTION",
    playerID: G.orcaResolution.playerID,
    orcaCardID: G.orcaResolution.orcaCardID,
    validTargets: [...G.orcaResolution.validTargetCardIDs]
  };
  events?.setActivePlayers?.({ [G.orcaResolution.playerID]: null });
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
  cardID: string,
  events?: MoveCtx["events"]
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
    G.orcaResolution = null;
    clearPendingStage(G, events);
    return;
  }

  G.orcaResolution = {
    playerID,
    orcaCardID: cardID,
    validTargetCardIDs
  };
  syncPendingStageFromOrcaResolution(G, events);
}

function addCardToPlayerZoneWithEffects(
  G: FrozenGuildState,
  playerID: string,
  cardID: string,
  events?: MoveCtx["events"]
): void {
  const player = G.players[playerID];
  if (!player) {
    return;
  }

  player.zone.push(cardID);
  triggerOrcaResolutionOnReceive(G, playerID, cardID, events);
}

export function setBombAtTurnStart(G: FrozenGuildState, playerID: string): void {
  const player = G.players[playerID];
  if (!player) {
    return;
  }

  player.hasBombAtStart = player.zone.some((cardID) => isSealBombCard(cardID));
  player.hasBombAtEnd = player.hasBombAtStart;
}

function triggerSealBombResolutionIfNeeded(G: FrozenGuildState, playerID: string): boolean {
  const player = G.players[playerID];
  if (!player) {
    return false;
  }

  const hasBombNow = player.zone.some((cardID) => isSealBombCard(cardID));
  const hadBombAtStart = player.hasBombAtStart;

  if (!hadBombAtStart || !hasBombNow) {
    player.hasBombAtStart = false;
    player.hasBombAtEnd = false;
    return false;
  }

  const bombCardID = player.zone.find((cardID) => isSealBombCard(cardID));
  if (!bombCardID) {
    player.hasBombAtStart = false;
    player.hasBombAtEnd = false;
    return false;
  }

  const validTargetCardIDs = player.zone.filter((cardID) => cardID !== bombCardID);
  const requiredDiscardCount = Math.min(2, validTargetCardIDs.length);

  if (requiredDiscardCount === 0) {
    if (removeCardFromPlayerZoneById(G, playerID, bombCardID)) {
      G.discardPile.push(bombCardID);
    }
    player.hasBombAtStart = false;
    player.hasBombAtEnd = false;
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
  G.pendingStage = null;
  G.orcaResolution = null;
  G.sealBombResolution = null;
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

function upsertPendingTurnSkip(G: FrozenGuildState, playerID: string, startedAt: number): void {
  const existing = G.autoResolveQueue.find(
    (item) => item.playerID === playerID && item.stageType === "TURN_SKIP"
  );

  if (existing) {
    existing.startedAt = startedAt;
    existing.resolveAfterMs = DISCONNECT_GRACE_MS;
    return;
  }

  G.autoResolveQueue.push({
    playerID,
    stageType: "TURN_SKIP",
    startedAt,
    resolveAfterMs: DISCONNECT_GRACE_MS
  });
}

function removePendingTurnSkip(G: FrozenGuildState, playerID: string): void {
  G.autoResolveQueue = G.autoResolveQueue.filter(
    (item) => !(item.playerID === playerID && item.stageType === "TURN_SKIP")
  );
}

function hasConnectedOrReconnectingPlayersExceptCurrent(
  G: FrozenGuildState,
  currentPlayerID: string
): boolean {
  return Object.entries(G.players).some(([playerID, player]) => {
    if (playerID === currentPlayerID) {
      return false;
    }

    return player.connectionStatus === "connected" || player.connectionStatus === "reconnecting";
  });
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
      nextQueue.push(item);
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
  if (!playerID || !G.players[playerID]) {
    return INVALID_MOVE;
  }

  G.activeTable = active;
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

function shouldSkipTwoPlayerSwap(G: FrozenGuildState): boolean {
  const players = Object.values(G.players);
  return players.length === 2 && players.some((player) => player.zone.length === 0);
}

function requiresPadrinoSelection(G: FrozenGuildState): boolean {
  return G.dice.rolled && G.dice.value === 6 && G.turn.padrinoAction === null;
}

function hasAnyIceCard(G: FrozenGuildState): boolean {
  return G.iceGrid.some((slot) => typeof slot === "string");
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

    const cardID = G.iceGrid[location.slot];
    return typeof cardID === "string" ? cardID : null;
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

function writeCardToLocation(G: FrozenGuildState, location: SwapLocation, cardID: string): void {
  if (location.area === "ice_grid") {
    G.iceGrid[location.slot] = cardID;
    return;
  }

  const player = G.players[location.playerID];
  if (!player) {
    return;
  }

  player.zone[location.index] = cardID;
}

function drawIceReplacementCard(G: FrozenGuildState): string | null {
  if (!G.deck || G.deck.length === 0) {
    return null;
  }

  const [replacement] = G.deck.splice(0, 1);
  return replacement ?? null;
}

function refillIceSlotOrEndGame(
  G: FrozenGuildState,
  slot: number,
  _events?: MoveCtx["events"]
): void {
  const replacement = drawIceReplacementCard(G);
  if (replacement !== null) {
    G.iceGrid[slot] = replacement;
    return;
  }

  G.iceGrid[slot] = null;
}

export function fishFromIce(
  { G, ctx, playerID, events, random }: MoveCtx,
  slot: number
): typeof INVALID_MOVE | void {
  if (!playerID) {
    logInvalidFish("MISSING_PLAYER_ID", { slot, currentPlayer: ctx.currentPlayer });
    return INVALID_MOVE;
  }

  if (hasPendingMandatoryResolution(G)) {
    logInvalidFish("PENDING_MANDATORY_RESOLUTION", {
      slot,
      playerID,
      pendingStage: G.pendingStage,
      orcaResolution: G.orcaResolution,
      sealBombResolution: G.sealBombResolution
    });
    return INVALID_MOVE;
  }

  if (!isActivePlayer(ctx, playerID)) {
    logInvalidFish("NOT_ACTIVE_PLAYER", { slot, playerID, currentPlayer: ctx.currentPlayer });
    return INVALID_MOVE;
  }

  if (!requiresFishingAction(G)) {
    logInvalidFish("FISH_ACTION_NOT_REQUIRED", {
      slot,
      playerID,
      dice: G.dice,
      padrinoAction: G.turn.padrinoAction
    });
    return INVALID_MOVE;
  }

  if (G.turn.actionCompleted) {
    logInvalidFish("ACTION_ALREADY_COMPLETED", { slot, playerID, turn: G.turn });
    return INVALID_MOVE;
  }

  if (!isValidIceSlotIndex(slot, G.iceGrid.length)) {
    logInvalidFish("INVALID_SLOT_INDEX", { slot, iceGridLength: G.iceGrid.length, playerID });
    return INVALID_MOVE;
  }

  const cardID = G.iceGrid[slot];
  if (typeof cardID !== "string") {
    logInvalidFish("EMPTY_OR_INVALID_ICE_SLOT", {
      slot,
      playerID,
      cardID,
      iceGrid: G.iceGrid
    });
    return INVALID_MOVE;
  }

  if (!G.players[playerID]) {
    logInvalidFish("PLAYER_NOT_FOUND", { slot, playerID });
    return INVALID_MOVE;
  }

  addCardToPlayerZoneWithEffects(G, playerID, cardID, events);
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
  { G, ctx, playerID, events, random }: MoveCtx,
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

  if (!G.players[targetPlayerID]) {
    return INVALID_MOVE;
  }

  const cardID = G.iceGrid[slot];
  if (typeof cardID !== "string") {
    return INVALID_MOVE;
  }

  addCardToPlayerZoneWithEffects(G, targetPlayerID, cardID, events);
  refillIceSlotOrEndGame(G, slot, events);
  G.spy = null;
  G.turn.actionCompleted = true;
}

function resolveSwapCardID(G: FrozenGuildState, ref: SwapRef, playerID: string): string | null {
  if (typeof ref === "string") {
    return G.players[playerID]?.zone.includes(ref) ? ref : null;
  }

  if (ref.area !== "player_zone" || ref.playerID !== playerID) {
    return null;
  }

  const player = G.players[playerID];
  if (!player) {
    return null;
  }

  return player.zone[ref.index] ?? null;
}

function swapCardsByLocation(
  { G, ctx, playerID, events, random }: MoveCtx,
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

  if (source.playerID !== playerID && target.playerID !== playerID) {
    return INVALID_MOVE;
  }

  const sourceCard = readCardFromLocation(G, source);
  const targetCard = readCardFromLocation(G, target);

  if (!sourceCard || !targetCard) {
    return INVALID_MOVE;
  }

  writeCardToLocation(G, source, targetCard);
  writeCardToLocation(G, target, sourceCard);

  triggerOrcaResolutionOnReceive(G, source.playerID, targetCard, events);
  if (!G.orcaResolution) {
    triggerOrcaResolutionOnReceive(G, target.playerID, sourceCard, events);
  }

  G.turn.actionCompleted = true;
}

function swapCardsLegacy(
  { G, ctx, playerID, events, random }: MoveCtx,
  firstPlayerID: string,
  firstCardRef: SwapRef,
  secondPlayerID: string,
  secondCardRef: SwapRef
): typeof INVALID_MOVE | void {
  if (hasPendingMandatoryResolution(G)) {
    logInvalidSwap("PENDING_RESOLUTION", {
      orcaResolution: G.orcaResolution,
      pendingStage: G.pendingStage,
      sealBombResolution: G.sealBombResolution
    });
    return INVALID_MOVE;
  }

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
      diceValue: G.dice.value,
      padrinoAction: G.turn.padrinoAction
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

  if (firstPlayerID !== playerID && secondPlayerID !== playerID) {
    logInvalidSwap("CURRENT_PLAYER_NOT_INCLUDED", {
      playerID,
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

  triggerOrcaResolutionOnReceive(G, firstPlayerID, secondCardID, events);
  if (!G.orcaResolution) {
    triggerOrcaResolutionOnReceive(G, secondPlayerID, firstCardID, events);
  }

  G.turn.actionCompleted = true;
}

export function swapCards(
  moveCtx: MoveCtx,
  arg1: SwapLocation | string,
  arg2: SwapLocation | SwapRef,
  arg3?: string,
  arg4?: SwapRef
): typeof INVALID_MOVE | void {
  if (typeof arg1 === "string" && typeof arg3 === "string") {
    return swapCardsLegacy(moveCtx, arg1, arg2 as SwapRef, arg3, arg4 as SwapRef);
  }

  return swapCardsByLocation(moveCtx, arg1 as SwapLocation, arg2 as SwapLocation);
}

function resolveOrcaDestroyFromPendingStage(
  {
    G,
    playerID,
    events
  }: { G: FrozenGuildState; playerID?: string | undefined; events?: MoveCtx["events"] },
  targetCardID: string
): typeof INVALID_MOVE | void {
  const pending = G.pendingStage;
  if (!pending || pending.type !== "ORCA_DESTROY_SELECTION") {
    logInvalidOrca("PENDING_STAGE_NOT_ORCA", {
      reason: "pending stage missing or wrong type",
      playerID,
      pendingStage: G.pendingStage,
      targetCardID
    });
    return INVALID_MOVE;
  }

  if (!playerID || playerID !== pending.playerID) {
    logInvalidOrca("PLAYER_MISMATCH", {
      reason: "resolver is not pending owner",
      playerID,
      pendingPlayerID: pending.playerID,
      pending: pending,
      targetCardID,
      validTargetCardIDs: pending.validTargets,
      zone: pending.playerID ? G.players[pending.playerID]?.zone : undefined
    });
    return INVALID_MOVE;
  }

  if (!pending.validTargets.includes(targetCardID)) {
    logInvalidOrca("TARGET_NOT_VALID", {
      reason: "target not in valid targets",
      playerID,
      pending,
      targetCardID,
      validTargetCardIDs: pending.validTargets,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  const player = G.players[playerID];
  if (!player) {
    logInvalidOrca("PLAYER_NOT_FOUND", {
      reason: "player does not exist",
      playerID,
      pending,
      targetCardID
    });
    return INVALID_MOVE;
  }

  const orcaIndex = player.zone.indexOf(pending.orcaCardID);
  if (orcaIndex === -1) {
    clearPendingStage(G, events);
    logInvalidOrca("ORCA_NOT_IN_ZONE", {
      reason: "orca card missing from zone",
      playerID,
      pending,
      targetCardID,
      zone: player.zone
    });
    return INVALID_MOVE;
  }

  player.zone.splice(orcaIndex, 1);
  G.discardPile.push(pending.orcaCardID);

  if (targetCardID !== pending.orcaCardID) {
    const targetIndex = player.zone.indexOf(targetCardID);
    if (targetIndex === -1) {
      clearPendingStage(G, events);
      logInvalidOrca("TARGET_NOT_IN_ZONE", {
        reason: "target card missing from zone",
        playerID,
        pending,
        targetCardID,
        zone: player.zone
      });
      return INVALID_MOVE;
    }

    player.zone.splice(targetIndex, 1);
    G.discardPile.push(targetCardID);
  }

  G.orcaResolution = null;
  clearPendingStage(G, events);
}

export function resolveOrcaDestroy(
  { G, playerID, events }: MoveCtx,
  targetCardID: string
): typeof INVALID_MOVE | void {
  if (G.pendingStage?.type === "ORCA_DESTROY_SELECTION") {
    return resolveOrcaDestroyFromPendingStage({ G, playerID, events }, targetCardID);
  }

  const pending = G.orcaResolution;
  if (!pending || !playerID || pending.playerID !== playerID) {
    logInvalidOrca("MISSING_OR_WRONG_PENDING", {
      reason: "missing pending or wrong player",
      playerID,
      pending,
      targetCardID,
      validTargetCardIDs: pending?.validTargetCardIDs,
      zone: playerID ? G.players[playerID]?.zone : undefined
    });
    return INVALID_MOVE;
  }

  if (!pending.validTargetCardIDs.includes(targetCardID)) {
    logInvalidOrca("TARGET_NOT_VALID", {
      reason: "target not in validTargetCardIDs",
      playerID,
      pending,
      targetCardID,
      validTargetCardIDs: pending.validTargetCardIDs,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  const removedOrca = removeCardFromPlayerZoneById(G, playerID, pending.orcaCardID);
  const removedTarget = removeCardFromPlayerZoneById(G, playerID, targetCardID);

  if (!removedTarget) {
    logInvalidOrca("TARGET_REMOVE_FAILED", {
      reason: "target card could not be removed",
      playerID,
      pending,
      targetCardID,
      validTargetCardIDs: pending.validTargetCardIDs,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  if (removedOrca) {
    G.discardPile.push(pending.orcaCardID);
  }

  G.discardPile.push(targetCardID);
  G.orcaResolution = null;
  clearPendingStage(G, events);
}

export function resolveSealBombExplosion(
  { G, playerID }: MoveCtx,
  targetCardIDs: string[]
): typeof INVALID_MOVE | void {
  const pending = G.sealBombResolution;
  if (!pending || !playerID || pending.playerID !== playerID) {
    logInvalidSealBomb("MISSING_OR_WRONG_PENDING", {
      reason: "missing pending or wrong player",
      playerID,
      pending,
      targets: targetCardIDs,
      requiredDiscardCount: pending?.requiredDiscardCount,
      validTargetCardIDs: pending?.validTargetCardIDs,
      zone: playerID ? G.players[playerID]?.zone : undefined
    });
    return INVALID_MOVE;
  }

  if (!Array.isArray(targetCardIDs) || targetCardIDs.length !== pending.requiredDiscardCount) {
    logInvalidSealBomb("INVALID_TARGET_COUNT", {
      reason: "target count does not match requiredDiscardCount",
      playerID,
      pending,
      targets: targetCardIDs,
      requiredDiscardCount: pending.requiredDiscardCount,
      validTargetCardIDs: pending.validTargetCardIDs,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  const uniqueTargets = [...new Set(targetCardIDs)];
  if (uniqueTargets.length !== targetCardIDs.length) {
    logInvalidSealBomb("DUPLICATE_TARGETS", {
      reason: "duplicate targets are not allowed",
      playerID,
      pending,
      targets: targetCardIDs,
      requiredDiscardCount: pending.requiredDiscardCount,
      validTargetCardIDs: pending.validTargetCardIDs,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  const invalidTarget = uniqueTargets.some(
    (cardID) => !pending.validTargetCardIDs.includes(cardID)
  );
  if (invalidTarget) {
    logInvalidSealBomb("INVALID_TARGET_CARD", {
      reason: "at least one target is not part of validTargetCardIDs",
      playerID,
      pending,
      targets: targetCardIDs,
      requiredDiscardCount: pending.requiredDiscardCount,
      validTargetCardIDs: pending.validTargetCardIDs,
      zone: G.players[playerID]?.zone
    });
    return INVALID_MOVE;
  }

  for (const targetCardID of uniqueTargets) {
    const removed = removeCardFromPlayerZoneById(G, playerID, targetCardID);
    if (!removed) {
      logInvalidSealBomb("TARGET_REMOVE_FAILED", {
        reason: "could not remove target from zone",
        playerID,
        pending,
        targetCardID,
        targets: targetCardIDs,
        requiredDiscardCount: pending.requiredDiscardCount,
        validTargetCardIDs: pending.validTargetCardIDs,
        zone: G.players[playerID]?.zone
      });
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

export function rollDice({ G, ctx, playerID, random }: MoveCtx): typeof INVALID_MOVE | void {
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

export function endTurn({ G, ctx, playerID, events }: MoveCtx): typeof INVALID_MOVE | void {
  const orca = G.orcaResolution;
  if (orca && isBotPlayerState(G, orca.playerID)) {
    const candidates = [...orca.validTargetCardIDs];
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)]!;
      resolveOrcaDestroy({ G, ctx, playerID: orca.playerID, events }, target);
    }
  }

  const seal = G.sealBombResolution;
  if (seal && isBotPlayerState(G, seal.playerID)) {
    const candidates = [...seal.validTargetCardIDs];
    const selected: string[] = [];
    while (selected.length < seal.requiredDiscardCount && candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)]!;
      selected.push(chosen);
      const selectedIndex = candidates.indexOf(chosen);
      if (selectedIndex >= 0) {
        candidates.splice(selectedIndex, 1);
      }
    }
    if (selected.length > 0) {
      resolveSealBombExplosion({ G, ctx, playerID: seal.playerID }, selected);
    }
  }

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
    if (!hasAnyIceCard(G)) {
      logEndTurnGuard("END_GAME_NO_ICE_CARDS_REQUIRED_FISH", {
        playerID,
        currentPlayer: ctx.currentPlayer,
        dice: G.dice,
        turn: G.turn,
        iceGrid: G.iceGrid,
        deckLength: G.deck.length
      });
      events?.endGame?.({
        reason: "NO_ICE_CARDS_AVAILABLE",
        finalResults: buildFinalResults(G)
      });
      return;
    }

    logEndTurnGuard("BLOCK_END_TURN_PENDING_FISH_ACTION", {
      playerID,
      currentPlayer: ctx.currentPlayer,
      dice: G.dice,
      turn: G.turn,
      iceGrid: G.iceGrid
    });

    return INVALID_MOVE;
  }

  if (requiresSpyAction(G) && !G.turn.actionCompleted) {
    if (!hasAnyIceCard(G)) {
      logEndTurnGuard("END_GAME_NO_ICE_CARDS_REQUIRED_SPY", {
        playerID,
        currentPlayer: ctx.currentPlayer,
        dice: G.dice,
        turn: G.turn,
        iceGrid: G.iceGrid,
        deckLength: G.deck.length
      });
      events?.endGame?.({
        reason: "NO_ICE_CARDS_AVAILABLE",
        finalResults: buildFinalResults(G)
      });
      return;
    }

    logEndTurnGuard("BLOCK_END_TURN_PENDING_SPY_ACTION", {
      playerID,
      currentPlayer: ctx.currentPlayer,
      dice: G.dice,
      turn: G.turn,
      iceGrid: G.iceGrid,
      spy: G.spy
    });

    return INVALID_MOVE;
  }

  if (requiresSwapAction(G) && !G.turn.actionCompleted && !shouldSkipTwoPlayerSwap(G)) {
    return INVALID_MOVE;
  }

  if (playerID && triggerSealBombResolutionIfNeeded(G, playerID)) {
    return;
  }

  if (!hasAnyIceCard(G)) {
    events?.endGame?.({
      reason: "NO_ICE_CARDS_AVAILABLE",
      finalResults: buildFinalResults(G)
    });
    return;
  }

  events?.endTurn?.();
}
