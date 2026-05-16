import styles from "./LobbyGlass.module.css";

type LobbyShellProps = {
  children: React.ReactNode;
};

export function LobbyShell({ children }: LobbyShellProps) {
  return (
    <main className={styles.lobbyPage} aria-label="Frozen Guild Lobby">
      <section className={styles.shell} aria-label="Lobby shell">
        {children}
      </section>
    </main>
  );
}
