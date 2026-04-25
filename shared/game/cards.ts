import type { Card, CardId, CardType, PenguinFishValue } from "./types";
import {
  NON_PENGUIN_BLUEPRINTS,
  PENGUIN_ART_BY_VALUE,
  PENGUIN_VALUE_DISTRIBUTION
} from "./card-distribution";

const PENGUIN_VALUES: PenguinFishValue[] = [1, 2, 3];

const NON_PENGUIN_COUNTS = NON_PENGUIN_BLUEPRINTS.reduce(
  (acc, card) => ({
    ...acc,
    [card.type]: card.count
  }),
  {} as Record<Exclude<CardType, "penguin">, number>
);

export const CARD_TYPE_COUNTS: Record<CardType, number> = {
  penguin: PENGUIN_VALUES.reduce(
    (total, value) => total + PENGUIN_VALUE_DISTRIBUTION[value],
    0
  ),
  walrus: NON_PENGUIN_COUNTS.walrus,
  petrel: NON_PENGUIN_COUNTS.petrel,
  sea_elephant: NON_PENGUIN_COUNTS.sea_elephant,
  krill: NON_PENGUIN_COUNTS.krill,
  orca: NON_PENGUIN_COUNTS.orca,
  seal_bomb: NON_PENGUIN_COUNTS.seal_bomb
};

export const CARD_TOTAL = Object.values(CARD_TYPE_COUNTS).reduce((total, count) => total + count, 0);

const CARD_ID_PADDING = 3;

function buildCardId(type: CardType, index: number): string {
  return `${type}-${String(index).padStart(CARD_ID_PADDING, "0")}`;
}

function buildAllCards(): Card[] {
  const cards: Card[] = [];
  let penguinIndex = 1;

  for (const value of PENGUIN_VALUES) {
    const count = PENGUIN_VALUE_DISTRIBUTION[value];

    for (let index = 0; index < count; index += 1) {
      cards.push({
        id: buildCardId("penguin", penguinIndex),
        type: "penguin",
        image: PENGUIN_ART_BY_VALUE[value],
        value
      });

      penguinIndex += 1;
    }
  }

  for (const blueprint of NON_PENGUIN_BLUEPRINTS) {
    for (let index = 0; index < blueprint.count; index += 1) {
      cards.push({
        id: buildCardId(blueprint.type, index + 1),
        type: blueprint.type,
        image: blueprint.image
      });
    }
  }

  return cards;
}

export const ALL_CARDS = buildAllCards();

const CARD_BY_ID_INDEX: Record<string, Card> = Object.fromEntries(
  ALL_CARDS.map((card) => [card.id, card])
);

export function getCardById(cardId: CardId): Card | null {
  return CARD_BY_ID_INDEX[cardId] ?? null;
}
