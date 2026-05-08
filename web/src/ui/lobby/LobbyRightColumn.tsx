import styles from "./LobbyGlass.module.css";

type LobbyRightColumnProps = {
  children: React.ReactNode;
};

export function LobbyRightColumn({ children }: LobbyRightColumnProps) {
  return <section className={`${styles.column} ${styles.rightColumn}`}>{children}</section>;
}
