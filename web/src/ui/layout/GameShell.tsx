import styles from "./GameShell.module.css";
import type { ReactNode } from "react";

type GameShellProps = {
  left: ReactNode;
  center: ReactNode;
  actions: ReactNode;
  right: ReactNode;
};

export function GameShell({ left, center, actions, right }: GameShellProps) {
  return (
    <section className={styles.gameShell}>
      <aside className={styles.left}>{left}</aside>
      <section className={styles.center}>{center}</section>
      <section className={styles.actions}>{actions}</section>
      <aside className={styles.right}>{right}</aside>
    </section>
  );
}
