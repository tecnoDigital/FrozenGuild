import { ALL_CARDS } from "./cards";
import type { CardId } from "./types";

export function createDeck(): CardId[] {
  return ALL_CARDS.map((card) => card.id);
}

export function shuffleDeck(cards: CardId[], randomFn: () => number = Math.random): CardId[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    const current = shuffled[index]!;
    shuffled[index] = shuffled[swapIndex]!;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function drawCard(deck: CardId[]): { cardId: CardId | null; deck: CardId[] } {
  if (deck.length === 0) {
    return { cardId: null, deck };
  }

  const [first, ...rest] = deck;
  return {
    cardId: first ?? null,
    deck: rest
  };
}

export function discardCard(discardPile: CardId[], cardId: CardId): CardId[] {
  return [...discardPile, cardId];
}
