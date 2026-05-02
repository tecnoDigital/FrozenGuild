import styles from "./DicePanel.module.css";
import type { DicePanelProps } from "./types";

export function DicePanel({ result, maxValue, frameSrc }: DicePanelProps) {
  return (
    <section className={styles.panel} aria-label="dice-panel">
      {frameSrc ? <img className={styles.frame} src={frameSrc} alt="" aria-hidden="true" /> : null}
      <p className={styles.label}>Dice</p>
      <p className={styles.value}>
        {result}/{maxValue}
      </p>
    </section>
  );
}
