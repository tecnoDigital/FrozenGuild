import styles from "./RoundBadge.module.css";
import type { RoundBadgeProps } from "./types";

export function RoundBadge({ roundLabel, subtitle }: RoundBadgeProps) {
  return (
    <header className={styles.badge}>
      <p className={styles.round}>{roundLabel}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </header>
  );
}
