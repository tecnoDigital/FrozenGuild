import type { CardType } from "../../../shared/game/types.js";

const CARD_FALLBACK = "/src/assets/placeholder.png";

const CARD_ASSET_MAP: Record<CardType, string> = {
  penguin: "/src/assets/cards/penguin-1.png",
  walrus: "/src/assets/cards/walrus.png",
  petrel: "/src/assets/cards/petrel.png",
  sea_elephant: "/src/assets/cards/sea-elephant.png",
  krill: "/src/assets/cards/krill.png",
  orca: "/src/assets/cards/orca.png",
  seal_bomb: "/src/assets/cards/seal_bomb.png"
};

export function getCardAssetByType(type: CardType): string {
  return CARD_ASSET_MAP[type] ?? CARD_FALLBACK;
}

export function getCardBackAsset(): string {
  return "/src/assets/cards/Reverso.png";
}

export function getCardFallbackAsset(): string {
  return CARD_FALLBACK;
}
