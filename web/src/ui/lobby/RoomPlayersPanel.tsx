import styles from "./Lobby.module.css";

type RoomPlayersPanelProps = {
  players: string[];
  numPlayers?: number;
  selectedMatch?: {
    matchID: string;
    availableSeats: string[];
    occupiedPlayers: Array<{ seat: string; name: string; isBot: boolean }>;
    totalPlayers: number;
  } | null;
  selectedBotPlayerIDs?: string[];
};

export function RoomPlayersPanel({ players, numPlayers = 4, selectedMatch = null, selectedBotPlayerIDs = [] }: RoomPlayersPanelProps) {
  const totalSeats = selectedMatch ? selectedMatch.totalPlayers : numPlayers;
  const seats = Array.from({ length: Math.max(1, totalSeats) }, (_, index) => {
    const seat = String(index);
    const fromMatch = selectedMatch?.occupiedPlayers.find((player) => player.seat === seat) ?? null;
    const fallbackName = players[index] ?? null;
    const name = fromMatch?.name ?? fallbackName;
    const isBot = fromMatch ? fromMatch.isBot : selectedBotPlayerIDs.includes(seat) || (name ? name.toUpperCase().startsWith("BOT ") : false);
    return {
      seat,
      name,
      isBot
    };
  });

  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Jugadores de la sala {selectedMatch ? `· ${selectedMatch.matchID}` : ""}</h3>
      <div className={styles.seatGrid} style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, seats.length))}, minmax(0, 1fr))` }}>
        {seats.map((seat) => (
          <article key={`seat-${seat.seat}`} className={styles.seatCard}>
            <div className={styles.seatAvatar}>{seat.name ? seat.name.slice(0, 1).toUpperCase() : "+"}</div>
            <strong>{seat.name ?? "Vacio"}</strong>
            <span className={seat.name ? (seat.isBot ? styles.seatStatusBot : styles.seatStatusHuman) : styles.seatStatusMuted}>
              {seat.name ? (seat.isBot ? "BOT" : "Jugador") : "Invitar"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
