import { OpponentRow } from "./OpponentRow";
import styles from "./OpponentPanel.module.css";
import type { OpponentPanelProps } from "./types";

export function OpponentPanel({ title, opponents }: OpponentPanelProps) {
  return (
    <section className={styles.panel} aria-label="opponents">
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {opponents.map((opponent) => (
          <OpponentRow key={opponent.id} {...opponent} />
        ))}
      </div>
    </section>
  );
}
