import { CardVisual } from "./CardVisual";
import styles from "./BoardCardSlot.module.css";
import type { BoardCardSlotProps } from "./types";

export function BoardCardSlot({ slotId, card, highlighted = false }: BoardCardSlotProps) {
  return (
    <section className={`${styles.slot} ${highlighted ? styles.highlighted : ""}`} aria-label={slotId}>
      {card ? <CardVisual {...card} /> : <div className={styles.empty} aria-hidden="true" />}
    </section>
  );
}
