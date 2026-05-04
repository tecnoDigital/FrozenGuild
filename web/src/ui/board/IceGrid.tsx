import type { IceGridCardView } from "../../view-model/iceGridView.js";
import styles from "./IceGrid.module.css";
import { IceSlot } from "./IceSlot.js";
import type { CardInteractionState } from "./Card.js";

type IceGridProps = {
  cards: IceGridCardView[];
  clickableSlots?: number[];
  selectedSlots?: number[];
  onSlotClick?: (slot: number) => void;
};

function getInteractionState(
  index: number,
  clickable: Set<number>,
  selected: Set<number>
): CardInteractionState {
  if (selected.has(index)) return "selected";
  if (clickable.has(index)) return "selectable";
  return "idle";
}

export function IceGrid({ cards, clickableSlots = [], selectedSlots = [], onSlotClick }: IceGridProps) {
  const clickable = new Set(clickableSlots);
  const selected = new Set(selectedSlots);

  return (
    <div className={styles.grid}>
      {cards.map((card, index) => (
        <IceSlot
          key={`${card.id}-${index}`}
          cardId={card.id}
          label={card.label}
          hidden={card.hidden}
          image={card.image}
          empty={card.empty}
          interactionState={getInteractionState(index, clickable, selected)}
          {...(onSlotClick && clickable.has(index) ? { onClick: () => onSlotClick(index) } : {})}
        />
      ))}
    </div>
  );
}
