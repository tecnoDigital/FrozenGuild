import styles from "./DeckPanel.module.css";
import type { DeckPanelProps } from "./types";

export function DeckPanel({ remainingCards, backImageSrc }: DeckPanelProps) {
  return (
    <section className={styles.panel} aria-label="deck-panel">
      <img className={styles.back} src={backImageSrc} alt="Deck card back" loading="lazy" />
      <p className={styles.count}>{remainingCards} cards left</p>
    </section>
  );
}
