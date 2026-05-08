import styles from "./LobbyGlass.module.css";

type LobbyLeftColumnProps = {
  children: React.ReactNode;
};

export function LobbyLeftColumn({ children }: LobbyLeftColumnProps) {
  return <aside className={`${styles.column} ${styles.leftColumn}`}>{children}</aside>;
}
