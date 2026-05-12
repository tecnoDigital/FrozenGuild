import type { ReactNode } from "react";
import styles from "./FrozenIceGrid.module.css";

export type FrostCardProps = {
  index: number;
  ariaLabel: string;
  onClick?: (() => void) | undefined;
  disabled?: boolean;
  selected?: boolean;
  clickable?: boolean;
  children?: ReactNode;
};

export function FrostCard({
  index,
  ariaLabel,
  onClick,
  disabled = false,
  selected = false,
  clickable = false,
  children
}: FrostCardProps) {
  return (
    <button
      className={styles.frostCard}
      type="button"
      aria-label={ariaLabel}
      data-slot-index={index}
      data-selected={selected ? "true" : undefined}
      data-clickable={clickable ? "true" : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.cardInner}>{children}</span>
    </button>
  );
}
