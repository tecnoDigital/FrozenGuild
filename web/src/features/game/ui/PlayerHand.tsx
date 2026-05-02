import { CardVisual } from "./CardVisual";
import styles from "./PlayerHand.module.css";
import type { PlayerHandProps } from "./types";

export function PlayerHand({ playerId, cards, frameSrc }: PlayerHandProps) {
  return (
    <section className={styles.hand} aria-label={`${playerId}-hand`}>
      {frameSrc ? <img className={styles.frame} src={frameSrc} alt="" aria-hidden="true" /> : null}
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <div key={`${card.variant}-${index}`} className={styles.cardSlot}>
            <CardVisual {...card} />
          </div>
        ))}
      </div>
    </section>
  );
}
