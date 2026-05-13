import type { BoardCardView } from "../../../view-model/boardView.js";
import styles from "./FrozenIceGrid.module.css";
import { FrostCard } from "./FrostCard.js";

export type FrozenIceGridProps = {
  cards: BoardCardView[];
  selectableSlots?: number[];
  /** @deprecated use selectableSlots instead */
  clickableSlots?: number[];
  selectedSlots?: number[];
  onSlotClick?: (slot: number) => void;
};

export function FrozenIceGrid({
  cards,
  selectableSlots,
  clickableSlots = [],
  selectedSlots = [],
  onSlotClick
}: FrozenIceGridProps) {
  const selectableSet = new Set(selectableSlots ?? clickableSlots);
  const selectedSet = new Set(selectedSlots);

  return (
    <div className={styles.iceGrid}>
      {cards.map((card, index) => {
        const isSelectable = selectableSet.has(index) && !card.empty;
        const isSelected = selectedSet.has(index);
        const isEmpty = card.empty;

        return (
          <FrostCard
            key={card.id}
            index={index}
            ariaLabel={
              isEmpty
                ? `Empty slot ${index + 1}`
                : card.hidden
                  ? `Hidden card at slot ${index + 1}`
                  : `${card.label} at slot ${index + 1}`
            }
            onClick={isSelectable ? () => { onSlotClick?.(index); } : undefined}
            disabled={!isSelectable}
            selected={isSelected}
            selectable={isSelectable}
          >
            {!isEmpty && (
              <img
                src={card.image}
                alt={card.hidden ? "Carta oculta" : card.label}
                className={styles.cardImage}
              />
            )}
          </FrostCard>
        );
      })}
    </div>
  );
}
