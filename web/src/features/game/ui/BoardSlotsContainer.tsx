import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectBoardSlotsView } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { BoardCardSlot } from "./BoardCardSlot";

const cardImageByVariant = {
  "penguin-1": assets.cards.fronts.penguin1,
  "penguin-2": assets.cards.fronts.penguin2,
  "penguin-3": assets.cards.fronts.penguin3,
  walrus: assets.cards.fronts.walrus,
  petrel: assets.cards.fronts.petrel,
  "sea-elephant": assets.cards.fronts.seaElephant,
  krill: assets.cards.fronts.krill,
  orca: assets.cards.fronts.orca,
  "seal-bomb": assets.cards.fronts.sealBomb
} as const;

export function BoardSlotsContainer() {
  const boardSlots = useFrozenGuildStore(selectBoardSlotsView);

  return (
    <>
      {boardSlots.map((slot) => (
        <BoardCardSlot
          key={slot.slotId}
          slotId={slot.slotId}
          card={
            slot.card
              ? {
                  cardType: slot.card.cardType,
                  variant: slot.card.variant,
                  imageSrc: cardImageByVariant[slot.card.variant],
                  alt: `${slot.card.cardType} card`,
                  state: "default"
                }
              : undefined
          }
        />
      ))}
    </>
  );
}
