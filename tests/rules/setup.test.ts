import { describe, expect, it } from "vitest";
import { CARD_TOTAL } from "../../shared/game/cards";
import { getCardById } from "../../shared/game/cards";
import {
  ICE_GRID_SIZE,
  INITIAL_HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  createInitialState
} from "../../shared/game/setup";

function countVisibleIceCards(iceGrid: Array<string | null>): number {
  return iceGrid.filter((slot) => slot !== null).length;
}

describe("match setup", () => {
  it("creates 3x3 ice grid and players for a local match", () => {
    const state = createInitialState(2, () => 0.4);

    expect(state.version).toBe("stage-15");
    expect(state.iceGrid).toHaveLength(ICE_GRID_SIZE);
    expect(Object.keys(state.players)).toEqual(["0", "1"]);
    expect(state.players["0"]?.name).toBe("Player 1");
    expect(state.players["1"]?.name).toBe("Player 2");
    expect(state.dice).toEqual({ value: null, rolled: false });
    expect(state.turn).toEqual({ actionCompleted: false });
    expect(state.activeTable).toBe(true);
    expect(state.autoResolveQueue).toEqual([]);
    expect(state.players["0"]?.connectionStatus).toBe("connected");
  });

  it("deals initial hand to each player and leaves correct deck size", () => {
    const playerCount = 4;
    const state = createInitialState(playerCount, () => 0.2);
    const expectedDeckSize = CARD_TOTAL - ICE_GRID_SIZE - playerCount * INITIAL_HAND_SIZE;

    expect(state.deck).toHaveLength(expectedDeckSize);

    for (let index = 0; index < playerCount; index += 1) {
      const player = state.players[String(index)];
      expect(player?.zone).toHaveLength(INITIAL_HAND_SIZE);
    }
  });

  it("does not deal red cards in initial hands", () => {
    const state = createInitialState(4, () => 0.77);
    const playerCards = Object.values(state.players).flatMap((player) => player.zone);

    for (const cardId of playerCards) {
      const card = getCardById(cardId);
      expect(card?.type === "orca" || card?.type === "seal_bomb").toBe(false);
    }
  });

  it("does not duplicate cards between deck, ice and player zones", () => {
    const state = createInitialState(4, () => 0.67);
    const iceCards = state.iceGrid.filter((slot): slot is string => slot !== null);
    const playerCards = Object.values(state.players).flatMap((player) => player.zone);
    const allCardIds = [...state.deck, ...iceCards, ...playerCards, ...state.discardPile];

    expect(new Set(allCardIds).size).toBe(allCardIds.length);
  });

  it("supports minimum and maximum player count for MVP", () => {
    const minState = createInitialState(MIN_PLAYERS, () => 0.1);
    const maxState = createInitialState(MAX_PLAYERS, () => 0.1);

    expect(Object.keys(minState.players)).toHaveLength(MIN_PLAYERS);
    expect(Object.keys(maxState.players)).toHaveLength(MAX_PLAYERS);
    expect(countVisibleIceCards(minState.iceGrid)).toBe(ICE_GRID_SIZE);
    expect(countVisibleIceCards(maxState.iceGrid)).toBe(ICE_GRID_SIZE);
  });

  it("rejects player counts outside MVP range", () => {
    expect(() => createInitialState(0)).toThrowError();
    expect(() => createInitialState(5)).toThrowError();
  });
});
