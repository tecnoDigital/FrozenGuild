import { getCardById } from "../../../shared/game/cards.js";
import type { FrozenGuildUiStore } from "../store/frozenGuildStore.js";
import { selectIceGrid } from "../store/selectors.js";
import { getCardAssetByType, getCardBackAsset, getCardFallbackAsset } from "./assetMap.js";

export type BoardCardView = {
  id: string;
  label: string;
  image: string;
  hidden: boolean;
  empty: boolean;
};

export function makeBoardView(state: FrozenGuildUiStore): BoardCardView[] {
  const slots = selectIceGrid(state);

  return Array.from({ length: 9 }).map((_, index) => {
    const slot = slots[index] ?? null;

    if (!slot) {
      return {
        id: `ice-empty-${index}`,
        label: `Slot ${index}`,
        image: getCardFallbackAsset(),
        hidden: false,
        empty: true
      };
    }

    if (typeof slot === "object" && "hidden" in slot) {
      return {
        id: `ice-hidden-${index}`,
        label: `Slot ${index}`,
        image: getCardBackAsset(),
        hidden: true,
        empty: false
      };
    }

    const card = getCardById(slot);
    const label = card ? `${card.type}${card.value ? ` ${card.value}` : ""}` : slot;
    const image = card ? getCardAssetByType(card.type) : getCardFallbackAsset();

    return {
      id: slot,
      label,
      image,
      hidden: false,
      empty: false
    };
  });
}

const EMPTY_BOARD_VIEW: BoardCardView[] = [];
type IceGridSlots = NonNullable<FrozenGuildUiStore["G"]>["iceGrid"];

let lastIceGridRef: IceGridSlots | null | undefined;
let lastBoardView: BoardCardView[] = EMPTY_BOARD_VIEW;

export function selectBoardCardsView(state: FrozenGuildUiStore): BoardCardView[] {
  if (!state.G) {
    lastIceGridRef = null;
    lastBoardView = EMPTY_BOARD_VIEW;
    return lastBoardView;
  }

  if (state.G.iceGrid === lastIceGridRef) {
    return lastBoardView;
  }

  lastIceGridRef = state.G.iceGrid;
  lastBoardView = makeBoardView(state);
  return lastBoardView;
}
