import styles from "./LobbyGlass.module.css";
import { SeatPreview, type SeatData } from "./SeatPreview.js";

type RoomPreviewPanelProps = {
  mode: "create" | "join";
  previewTitle: string;
  previewId: string;
  numPlayers: number;
  botCount: number;
  waitingSeats: number;
  seats: SeatData[];
  selectedMatch: {
    matchID: string;
    availableSeats: string[];
    occupiedSeats: string[];
    occupiedPlayers: Array<{ seat: string; name: string; isBot: boolean }>;
    totalPlayers: number;
  } | null;
  onRandomize?: (() => void) | undefined;
};

export function RoomPreviewPanel({
  mode,
  previewTitle,
  previewId,
  numPlayers,
  botCount,
  waitingSeats,
  seats,
  selectedMatch,
  onRandomize,
}: RoomPreviewPanelProps) {
  const isCreate = mode === "create";
  const botText = `${botCount} ${botCount === 1 ? "bot" : "bots"}`;
  const waitingText = `${waitingSeats} ${waitingSeats === 1 ? "waiting seat" : "waiting seats"}`;

  const hostName = selectedMatch
    ? (selectedMatch.occupiedPlayers.find((p) => !p.isBot)?.name ??
      selectedMatch.occupiedPlayers[0]?.name ??
      "Unknown")
    : "";
  const selectedPlayersText = selectedMatch
    ? `${selectedMatch.occupiedSeats.length}/${selectedMatch.totalPlayers}`
    : "0/0";

  return (
    <section className={styles.roomPreview}>
      <div className={styles.previewHeader}>
        <div>
          <h2 className={styles.modeFade}>{previewTitle}</h2>
          <div
            key={isCreate ? "create-room-summary" : `join-room-summary-${selectedMatch?.matchID ?? "empty"}`}
            className={`${styles.roomHeaderStatus} ${styles.modeFade}`}
            aria-label={isCreate ? "Create room summary" : "Selected room summary"}
          >
            {isCreate ? (
              <>
                <span className={styles.roomHeaderId}>{`ID: ${previewId}`}</span>
                <span>{`1 human`}</span>
                <span>{botText}</span>
                <span>{waitingText}</span>
                <strong>{`1/${numPlayers}`}</strong>
              </>
            ) : selectedMatch ? (
              <>
                <span className={styles.roomHeaderId}>{`ID: ${selectedMatch.matchID}`}</span>
                <span>{`Host: ${hostName}`}</span>
                <span>{`${selectedMatch.availableSeats.length} open`}</span>
                <strong>{selectedPlayersText}</strong>
              </>
            ) : (
              <>
                <span className={styles.roomHeaderId}>ID: —</span>
                <span>Select a room</span>
                <strong>{selectedPlayersText}</strong>
              </>
            )}
          </div>
        </div>
        {isCreate ? (
          <button type="button" className={styles.ghostBtn} onClick={onRandomize}>
            Randomize
          </button>
        ) : null}
      </div>

      <SeatPreview seats={seats} />
    </section>
  );
}
