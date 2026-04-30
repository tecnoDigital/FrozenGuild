import styles from "./Lobby.module.css";

export type AvailableMatchRow = {
  matchID: string;
  availableSeats: string[];
  occupiedSeats: string[];
  totalPlayers: number;
};

type AvailableMatchesPanelProps = {
  rows: AvailableMatchRow[];
  selectedMatchID: string;
  busy?: boolean;
  onSelectMatchID?: (matchID: string) => void;
  onRefresh?: () => void;
};

export function AvailableMatchesPanel({ rows, selectedMatchID, busy = false, onSelectMatchID, onRefresh }: AvailableMatchesPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeaderRow}>
        <h3 style={{ margin: 0 }}>Partidas con asientos disponibles</h3>
        <button type="button" className={styles.inlineButton} onClick={onRefresh} disabled={busy}>Actualizar</button>
      </div>

      <div className={styles.list}>
        {rows.length === 0 ? <p style={{ margin: 0 }}>No hay partidas con asientos libres.</p> : null}
        {rows.map((row) => {
          const selected = row.matchID === selectedMatchID;
          return (
            <article
              key={`available-match-${row.matchID}`}
              className={`${styles.matchRow} ${selected ? styles.matchRowActive : ""}`}
              onClick={() => onSelectMatchID?.(row.matchID)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectMatchID?.(row.matchID);
                }
              }}
            >
              <button type="button" className={styles.matchTitleButton} onClick={() => onSelectMatchID?.(row.matchID)}>
                Match {row.matchID}
              </button>
              <p className={styles.matchMeta}>Ocupados: {row.occupiedSeats.join(", ") || "-"} · Libres: {row.availableSeats.join(", ")}</p>
              <p className={styles.matchMeta}>Capacidad: {row.totalPlayers} jugadores</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
