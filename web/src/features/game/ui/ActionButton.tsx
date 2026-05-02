import styles from "./ActionButton.module.css";
import type { ActionButtonProps } from "./types";

export function ActionButton({ id, label, iconSrc, disabled = false }: ActionButtonProps) {
  return (
    <button type="button" className={styles.button} data-action-id={id} disabled={disabled}>
      {iconSrc ? (
        <img className={styles.icon} src={iconSrc} alt="" aria-hidden="true" />
      ) : (
        <span className={styles.fallbackIcon} aria-hidden="true">
          ✶
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
