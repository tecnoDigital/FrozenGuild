import type { PropsWithChildren } from "react";
import styles from "./Shared.module.css";

type PanelProps = PropsWithChildren<{ title?: string; variant?: "default" | "ghost" }>;

export function Panel({ title, children, variant = "default" }: PanelProps) {
  const className = variant === "ghost" ? styles.panelGhost : styles.panel;
  return (
    <section className={className}>
      {title ? <h3 className={styles.panelTitle}>{title}</h3> : null}
      {children}
    </section>
  );
}
