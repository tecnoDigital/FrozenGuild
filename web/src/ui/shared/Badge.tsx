import type { PropsWithChildren } from "react";
import styles from "./Shared.module.css";

export function Badge({ children }: PropsWithChildren) {
  return <span className={styles.badge}>{children}</span>;
}
