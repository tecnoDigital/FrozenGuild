import styles from "./OpponentRow.module.css";
import type { OpponentRowProps } from "./types";

export function OpponentRow({ name, score, avatarSrc, handCount, isCurrentTurn = false }: OpponentRowProps) {
  return (
    <article className={`${styles.row} ${isCurrentTurn ? styles.active : ""}`}>
      <img className={styles.avatar} src={avatarSrc} alt={`${name} avatar`} loading="lazy" />
      <div className={styles.meta}>
        <p className={styles.name}>{name}</p>
        <p className={styles.details}>Score {score} · Hand {handCount}</p>
      </div>
      {isCurrentTurn ? <span className={styles.turnTag}>TURN</span> : null}
    </article>
  );
}
