import { describe, expect, it } from "vitest";
import {
  CARD_TOTAL,
  CARD_TYPE_COUNTS,
  getCardById
} from "../../shared/game/cards";
import {
  PENGUIN_ART_BY_VALUE,
  PENGUIN_VALUE_DISTRIBUTION
} from "../../shared/game/card-distribution";
import { createDeck, discardCard, drawCard, shuffleDeck } from "../../shared/game/deck";

describe("deck model", () => {
  it("creates full deck with expected total", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(CARD_TOTAL);
  });

  it("creates unique card ids", () => {
    const deck = createDeck();
    const ids = new Set(deck);
    expect(ids.size).toBe(deck.length);
  });

  it("keeps exact card count per type", () => {
    const deck = createDeck();
    for (const type of Object.keys(CARD_TYPE_COUNTS)) {
      const count = deck.filter((cardId) => getCardById(cardId)?.type === type).length;
      expect(count).toBe(CARD_TYPE_COUNTS[type as keyof typeof CARD_TYPE_COUNTS]);
    }
  });

  it("assigns values only to penguins", () => {
    const cards = createDeck().map((cardId) => getCardById(cardId));
    const penguins = cards.filter((card) => card?.type === "penguin");
    const nonPenguins = cards.filter((card) => card?.type !== "penguin");

    for (const card of penguins) {
      expect(card?.value === 1 || card?.value === 2 || card?.value === 3).toBe(true);
    }

    for (const card of nonPenguins) {
      expect(card?.value).toBeUndefined();
    }
  });

  it("keeps exactly 3 penguins with value 3", () => {
    const cards = createDeck().map((cardId) => getCardById(cardId));
    const penguinValueThree = cards.filter((card) => card?.type === "penguin" && card.value === 3);
    expect(penguinValueThree).toHaveLength(3);
    expect(PENGUIN_VALUE_DISTRIBUTION[3]).toBe(3);
  });

  it("uses independent art for each penguin value", () => {
    const cards = createDeck().map((cardId) => getCardById(cardId));

    for (const value of [1, 2, 3] as const) {
      const sample = cards.find((card) => card?.type === "penguin" && card.value === value);
      expect(sample?.image).toBe(PENGUIN_ART_BY_VALUE[value]);
    }

    expect(PENGUIN_ART_BY_VALUE[1]).not.toBe(PENGUIN_ART_BY_VALUE[2]);
    expect(PENGUIN_ART_BY_VALUE[2]).not.toBe(PENGUIN_ART_BY_VALUE[3]);
    expect(PENGUIN_ART_BY_VALUE[1]).not.toBe(PENGUIN_ART_BY_VALUE[3]);
  });
});

describe("deck helpers", () => {
  it("shuffles deck deterministically when random fn is provided", () => {
    const baseDeck = createDeck();
    let randomCursor = 0;
    const randomSeries = [0.22, 0.95, 0.11, 0.34, 0.71, 0.43, 0.02, 0.57];

    const shuffled = shuffleDeck(baseDeck, () => {
      const value = randomSeries[randomCursor % randomSeries.length];
      randomCursor += 1;
      return value;
    });

    expect(shuffled).toHaveLength(baseDeck.length);
    expect([...shuffled].sort()).toEqual([...baseDeck].sort());
    expect(shuffled).not.toEqual(baseDeck);
  });

  it("draws top card and returns remaining deck", () => {
    const deck = createDeck();
    const result = drawCard(deck);

    expect(result.cardId).not.toBeNull();
    expect(result.cardId).toBe(deck[0] ?? null);
    expect(result.deck).toHaveLength(deck.length - 1);
  });

  it("returns null when drawing from empty deck", () => {
    const result = drawCard([]);
    expect(result.cardId).toBeNull();
    expect(result.deck).toEqual([]);
  });

  it("adds discarded card at the end of discard pile", () => {
    const deck = createDeck();
    const firstDiscard = discardCard([], deck[0]!);
    const secondDiscard = discardCard(firstDiscard, deck[1]!);

    expect(firstDiscard).toEqual([deck[0]]);
    expect(secondDiscard).toEqual([deck[0], deck[1]]);
  });
});
