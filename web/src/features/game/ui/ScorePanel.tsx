import styles from "./ScorePanel.module.css";
import type { ScorePanelProps } from "./types";

export function ScorePanel({ title, players }: ScorePanelProps) {
  return (
    <section className={styles.panel} aria-label="score-panel">
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {players.map((player) => (
          <li key={player.id} className={styles.row}>
            <span>{player.name}</span>
            <strong>{player.score}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
