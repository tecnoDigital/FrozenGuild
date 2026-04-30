import styles from "./Lobby.module.css";

type RoomPlayersPanelProps = {
  players: string[];
};

export function RoomPlayersPanel({ players }: RoomPlayersPanelProps) {
  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Jugadores en sala</h3>
      <div className={styles.list}>
        {players.length === 0 ? <p style={{ margin: 0 }}>Sin jugadores aun.</p> : null}
        {players.map((player) => (
          <span key={player}>{player}</span>
        ))}
      </div>
    </section>
  );
}
