import { useMemo } from "react";
import styles from "./FrozenTurnBanner.module.css";

type FrozenTurnBannerProps = {
  round?: number;
  isMyTurn?: boolean;
};

export function FrozenTurnBanner({ round = 1, isMyTurn = false }: FrozenTurnBannerProps) {
  const label = useMemo(() => (isMyTurn ? "TU TURNO" : `RONDA ${round}`), [isMyTurn, round]);

  return (
    <div className={`${styles.roundBanner} ${isMyTurn ? styles.roundBannerActive : ""}`.trim()} aria-live="polite">
      <span className={styles.roundIcon}>❄</span>
      <span className={styles.roundChevron}>〉</span>
      <span className={styles.roundText} key={label}>{label}</span>
      <span className={styles.roundChevron}>〈</span>
      <span className={styles.roundIcon}>❄</span>
    </div>
  );
}
