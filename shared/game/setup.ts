import { createDeck, drawCard, shuffleDeck } from "./deck.js";
import { getCardById } from "./cards.js";
import type {
  CardId,
  FrozenGuildState,
  IceGridSlot,
  PlayerID,
  PlayerState
} from "./types.js";

export type SetupData = {
  botPlayerIDs?: string[];
};

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;
export const ICE_GRID_SIZE = 9;
export const INITIAL_HAND_SIZE = 3;

const RED_CARD_TYPES = new Set(["orca", "seal_bomb"]);

function assertPlayerCount(playerCount: number): void {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`Frozen Guild supports ${MIN_PLAYERS}-${MAX_PLAYERS} players in MVP.`);
  }
}

function createPlayers(
  playerCount: number,
  setupData?: SetupData
): Record<PlayerID, PlayerState> {
  const players: Record<PlayerID, PlayerState> = {};
  const botIds = new Set(setupData?.botPlayerIDs ?? []);

  for (let index = 0; index < playerCount; index += 1) {
    const playerID = String(index);
    players[playerID] = {
      name: botIds.has(playerID) ? `BOT ${playerID}` : `Player ${index + 1}`,
      zone: [],
      hasBombAtStart: false,
      connectionStatus: "connected"
    };
  }

  return players;
}

function isRedCard(cardId: CardId): boolean {
  const card = getCardById(cardId);
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }

  return RED_CARD_TYPES.has(card.type);
}

function drawMany(deck: CardId[], amount: number): { drawn: CardId[]; deck: CardId[] } {
  const drawn: CardId[] = [];
  let currentDeck = deck;

  for (let index = 0; index < amount; index += 1) {
    const result = drawCard(currentDeck);
    currentDeck = result.deck;

    if (result.cardId === null) {
      break;
    }

    drawn.push(result.cardId);
  }

  return { drawn, deck: currentDeck };
}

function drawManyNonRed(deck: CardId[], amount: number): { drawn: CardId[]; deck: CardId[] } {
  const drawn: CardId[] = [];
  const keptInDeck: CardId[] = [];

  for (const cardId of deck) {
    if (drawn.length < amount && !isRedCard(cardId)) {
      drawn.push(cardId);
      continue;
    }

    keptInDeck.push(cardId);
  }

  if (drawn.length < amount) {
    throw new Error("Not enough non-red cards to deal initial hands.");
  }

  return {
    drawn,
    deck: keptInDeck
  };
}

export function createInitialState(
  playerCount: number,
  randomFn: () => number = Math.random,
  setupData?: SetupData
): FrozenGuildState {
  assertPlayerCount(playerCount);

  const players = createPlayers(playerCount, setupData);
  let deck = shuffleDeck(createDeck(), randomFn);

  const iceDraw = drawManyNonRed(deck, ICE_GRID_SIZE);
  const iceGrid: IceGridSlot[] = [...iceDraw.drawn];
  deck = iceDraw.deck;

  while (iceGrid.length < ICE_GRID_SIZE) {
    iceGrid.push(null);
  }

  for (let index = 0; index < playerCount; index += 1) {
    const playerID = String(index);
    const player = players[playerID];

    if (!player) {
      throw new Error(`Player ${playerID} was not initialized.`);
    }

    const handDraw = drawManyNonRed(deck, INITIAL_HAND_SIZE);
    deck = handDraw.deck;
    player.zone = handDraw.drawn;
  }

  return {
    version: "stage-14",
    createdAt: Date.now(),
    activeTable: true,
    botActivity: {
      playerID: null,
      startedAt: null,
      completedAt: null
    },
    deck,
    discardPile: [],
    iceGrid,
    players,
    pendingStage: null,
    autoResolveQueue: [],
    dice: {
      value: null,
      rolled: false
    },
    turn: {
      actionCompleted: false,
      padrinoAction: null
    },
    spy: null,
    orcaResolution: null,
    sealBombResolution: null
  };
}
