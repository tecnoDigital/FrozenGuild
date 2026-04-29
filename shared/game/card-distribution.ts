import type { CardType, PenguinFishValue } from "./types.js";

export const PENGUIN_VALUE_DISTRIBUTION: Record<PenguinFishValue, number> = {
  1: 8,
  2: 7,
  3: 3
};

export const PENGUIN_ART_BY_VALUE: Record<PenguinFishValue, string> = {
  1: "assets/cards/penguin-1.png",
  2: "assets/cards/penguin-2.png",
  3: "assets/cards/penguin-3.png"
};

type NonPenguinBlueprint = {
  type: Exclude<CardType, "penguin">;
  count: number;
  image: string;
};

export const NON_PENGUIN_BLUEPRINTS: NonPenguinBlueprint[] = [
  {
    type: "walrus",
    count: 4,
    image: "assets/cards/walrus.png"
  },
  {
    type: "petrel",
    count: 7,
    image: "assets/cards/petrel.png"
  },
  {
    type: "sea_elephant",
    count: 4,
    image: "assets/cards/sea-elephant.png"
  },
  {
    type: "krill",
    count: 7,
    image: "assets/cards/krill.png"
  },
  {
    type: "orca",
    count: 8,
    image: "assets/cards/orca.png"
  },
  {
    type: "seal_bomb",
    count: 5,
    image: "assets/cards/seal-bomb.png"
  }
];
