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

  return (
    <section className={styles.roomPreview}>
      <div className={styles.previewHeader}>
        <div>
          <h2 className={isCreate ? styles.modeFade : undefined}>{previewTitle}</h2>
          <p className={styles.roomId}>
            {isCreate ? `Room preview · ${previewId}` : `Selected room · ${selectedMatch?.matchID ?? ""}`}
          </p>
        </div>
        {isCreate ? (
          <button type="button" className={styles.ghostBtn} onClick={onRandomize}>
            Randomize
          </button>
        ) : null}
      </div>

      <div className={styles.roomStatusPanel} style={{ display: isCreate ? "flex" : "none" }}>
        <div>
          <span className={styles.roomStatusLabel}>Room status</span>
          <strong>Creating</strong> · {`1 human · ${botText} · ${waitingText}`}
        </div>
        <div className={styles.roomStatusMetric}>{`1/${numPlayers}`}</div>
      </div>

      <div
        className={`${styles.joinReadonlyPanel} ${!isCreate ? styles.joinReadonlyPanelActive : ""}`}
      >
        <span className={styles.roomStatusLabel}>Selected room</span>
        <strong>
          {selectedMatch
            ? `${previewTitle} · ${selectedMatch.matchID}`
            : "No room selected"}
        </strong>
        <br />
        <span>
          {selectedMatch
            ? `${selectedMatch.occupiedSeats.length}/${selectedMatch.totalPlayers} players · Host: ${hostName} · Configuration locked by room owner.`
            : "Pick a room on the right to see its configuration."}
        </span>
      </div>

      <SeatPreview seats={seats} />
    </section>
  );
}
