import styles from "./Lobby.module.css";

type LobbyHeroProps = {
  title?: string;
  claim?: string;
};

export function LobbyHero({ title = "Frozen Guild", claim = "Rompe el hielo. Controla la mesa." }: LobbyHeroProps) {
  return (
    <header className={styles.hero}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{claim}</p>
    </header>
  );
}
