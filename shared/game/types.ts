export type CardType =
  | "penguin"
  | "walrus"
  | "petrel"
  | "sea_elephant"
  | "krill"
  | "orca"
  | "seal_bomb";

export type CardId = string;
export type PlayerID = string;

export type PenguinFishValue = 1 | 2 | 3;

export type Card = {
  id: CardId;
  type: CardType;
  image: string;
  value?: PenguinFishValue;
};

export type IceGridSlot = CardId | null;

export type PlayerState = {
  name: string;
  zone: CardId[];
  hasBombAtStart: boolean;
};

export type FrozenGuildState = {
  version: string;
  createdAt: number;
  deck: CardId[];
  discardPile: CardId[];
  iceGrid: IceGridSlot[];
  players: Record<PlayerID, PlayerState>;
};
