import styles from "./LobbyGlass.module.css";
import { deriveRoomName } from "./roomPresentation.js";
type AvailableRoomRow = {
  matchID: string;
  availableSeats: string[];
  occupiedSeats: string[];
  occupiedPlayers?: Array<{ seat: string; name: string; isBot: boolean }>;
  totalPlayers: number;
};

type AvailableRoomsPanelProps = {
  active: boolean;
  rows: AvailableRoomRow[];
  selectedMatchID: string;
  busy?: boolean | undefined;
  onSelectMatchID?: ((matchID: string) => void) | undefined;
  onBackToExpedition?: (() => void) | undefined;
  onCreateFromEmpty?: (() => void) | undefined;
};

function deriveHostName(match: AvailableRoomRow): string {
  return match.occupiedPlayers?.find((player) => !player.isBot)?.name
    ?? match.occupiedPlayers?.[0]?.name
    ?? (match.occupiedSeats[0] ? `Seat ${match.occupiedSeats[0]}` : "Unknown");
}

export function AvailableRoomsPanel({
  active,
  rows,
  selectedMatchID,
  busy,
  onSelectMatchID,
  onBackToExpedition,
  onCreateFromEmpty,
}: AvailableRoomsPanelProps) {
  const selectedMatch = rows.find((r) => r.matchID === selectedMatchID) ?? null;

  return (
    <div className={`${styles.roomsPanel} ${active ? styles.roomsPanelActive : ""}`}>
      <div className={styles.roomsHead}>
        <div>
          <div className={styles.eyebrow}>Open Tables</div>
          <h2>Available Rooms</h2>
          <p>
            Pick a waiting table. The left side locks to that room so the join action is explicit.
          </p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={onBackToExpedition}>
          Back to Expedition
        </button>
      </div>

      <div className={styles.selectedNote}>
        {selectedMatch
          ? `${deriveRoomName(selectedMatch.matchID)} selected. Host: ${deriveHostName(selectedMatch)}. Players: ${selectedMatch.occupiedSeats.length}/${selectedMatch.totalPlayers}. Ready to join from the left column.`
          : "No room selected yet. Choose a room to update the left preview."}
      </div>

      <div className={styles.roomList} style={{ display: rows.length > 0 ? "grid" : "none" }}>
        {rows.map((row) => {
          const selected = row.matchID === selectedMatchID;
          return (
            <article
              key={`room-${row.matchID}`}
              className={`${styles.roomCard} ${selected ? styles.roomCardSelected : ""}`}
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
              <div className={styles.roomMain}>
                <h3>
                  {deriveRoomName(row.matchID)}
                  <span className={styles.statusTag}>WAITING</span>
                </h3>
                <div className={styles.roomMeta}>
                  <span>Match ID: {row.matchID}</span>
                  <span>Host: {deriveHostName(row)}</span>
                  <span>Rules: MVP</span>
                </div>
              </div>
              <div className={styles.roomSide}>
                <div className={styles.playersBubble}>
                  {row.occupiedSeats.length}/{row.totalPlayers}
                </div>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMatchID?.(row.matchID);
                  }}
                >
                  Select
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className={`${styles.emptyRooms} ${rows.length === 0 ? styles.emptyRoomsActive : ""}`}>
        <h3>No rooms available</h3>
        <p>Create a new match instead, or refresh when another player opens a table.</p>
        <button type="button" className={styles.secondaryBtn} onClick={onCreateFromEmpty} disabled={busy}>
          Create Match
        </button>
      </div>
    </div>
  );
}
