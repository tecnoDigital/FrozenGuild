import { CompactHand } from "./CompactHand.js";
import styles from "./Players.module.css";

type LocalPlayerHandPanelProps = {
  playerName: string;
  score: number;
  cardIDs: string[];
  clickableCardIndexes?: number[];
  selectedCardIndexes?: number[];
  onCardClick?: (index: number) => void;
};

export function LocalPlayerHandPanel({
  playerName,
  score,
  cardIDs,
  clickableCardIndexes = [],
  selectedCardIndexes = [],
  onCardClick
}: LocalPlayerHandPanelProps) {
  return (
    <section className={styles.localHandFrame} data-local-hand-frame="true" aria-label="Tu mano">
      <header className={styles.localHandHeader}>
        <p className={styles.localHandTitle}>TU MANO</p>
        <p className={styles.localHandMeta}>
          <span>{playerName}</span>
          <span aria-label="Puntaje local">{score} pts</span>
        </p>
      </header>
      <CompactHand
        cardIDs={cardIDs}
        clickableIndexes={clickableCardIndexes}
        selectedIndexes={selectedCardIndexes}
        {...(onCardClick ? { onCardClick } : {})}
        size="local"
      />
    </section>
  );
}
