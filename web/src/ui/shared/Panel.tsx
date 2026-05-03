import type { PropsWithChildren } from "react";
import styles from "./Shared.module.css";

type PanelProps = PropsWithChildren<{ title?: string }>;

export function Panel({ title, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      {title ? <h3 className={styles.panelTitle}>{title}</h3> : null}
      {children}
    </section>
  );
}
