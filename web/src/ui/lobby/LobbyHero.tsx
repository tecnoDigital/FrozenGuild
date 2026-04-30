import styles from "./Lobby.module.css";

type LobbyHeroProps = {
  title?: string;
  claim?: string;
};

export function LobbyHero({ title = "Frozen Guild", claim = "Rompe el hielo. Controla la mesa." }: LobbyHeroProps) {
  return (
    <header className={styles.hero}>
      <span className={styles.heroBadge}>Lobby unico</span>
      <h1 className={styles.heroTitle}>Rompe el hielo sin leer testamento.</h1>
      <p className={styles.heroClaim}>Introduce tu nombre, crea o unete a una sala y echa un vistazo a las cartas de la expedicion.</p>
      <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>{title} · {claim}</p>
    </header>
  );
}
