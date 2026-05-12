import type { BoardCardView } from "../../../view-model/boardView.js";
import styles from "./FrozenIceGrid.module.css";
import { FrostCard } from "./FrostCard.js";

export type FrozenIceGridProps = {
  cards: BoardCardView[];
  clickableSlots?: number[];
  selectedSlots?: number[];
  onSlotClick?: (slot: number) => void;
};

export function FrozenIceGrid({
  cards,
  clickableSlots = [],
  selectedSlots = [],
  onSlotClick
}: FrozenIceGridProps) {
  const clickableSet = new Set(clickableSlots);
  const selectedSet = new Set(selectedSlots);

  return (
    <div className={styles.iceGrid}>
      {cards.map((card, index) => {
        const isClickable = clickableSet.has(index);
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
            onClick={isClickable ? () => { onSlotClick?.(index); } : undefined}
            disabled={!isClickable || isEmpty}
            selected={isSelected}
            clickable={isClickable}
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
