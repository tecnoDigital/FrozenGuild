import type { ReactNode } from "react";
import styles from "./FrozenIceGrid.module.css";

export type BoardSurfaceProps = {
  children: ReactNode;
  ariaLabel?: string;
};

export function BoardSurface({ children, ariaLabel = "Frozen Guild board grid" }: BoardSurfaceProps) {
  return (
    <section className={styles.boardSurface} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
