import styles from "./CurrentTurnPanel.module.css";
import type { CurrentTurnPanelProps } from "./types";

export function CurrentTurnPanel({ currentPlayerName, turnCount }: CurrentTurnPanelProps) {
  return (
    <section className={styles.panel} aria-label="turn-panel">
      <p className={styles.label}>Current Turn</p>
      <p className={styles.player}>{currentPlayerName}</p>
      <p className={styles.turn}>Turn {turnCount}</p>
    </section>
  );
}
