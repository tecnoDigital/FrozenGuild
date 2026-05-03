import type { CardType } from "../../../shared/game/types.js";
import { getCardById } from "../../../shared/game/cards.js";

const CARD_FALLBACK = "/assets/cards/states/card-fallback.png";

const CARD_ASSET_MAP: Record<CardType, string> = {
  penguin: "/assets/cards/types/penguin-1.png",
  walrus: "/assets/cards/types/walrus.png",
  petrel: "/assets/cards/types/petrel.png",
  sea_elephant: "/assets/cards/types/sea-elephant.png",
  krill: "/assets/cards/types/krill.png",
  orca: "/assets/cards/types/orca.png",
  seal_bomb: "/assets/cards/types/seal-bomb.png"
};

export function getCardAssetByType(type: CardType): string {
  return CARD_ASSET_MAP[type] ?? CARD_FALLBACK;
}

export function getCardBackAsset(): string {
  return "/assets/cards/backs/frozen-dreamcatcher-back.png";
}

export function getCardFallbackAsset(): string {
  return CARD_FALLBACK;
}

export function getCardAssetById(cardID: string): string {
  const card = getCardById(cardID);
  if (!card) {
    return CARD_FALLBACK;
  }
  return getCardAssetByType(card.type);
}
