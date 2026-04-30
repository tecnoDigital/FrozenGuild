import { CompactHand } from "./CompactHand.js";
import { ConnectionIssueBadge } from "./ConnectionIssueBadge.js";
import { DisconnectCountdown } from "./DisconnectCountdown.js";
import { ScoreBadge } from "./ScoreBadge.js";
import styles from "./Players.module.css";

type PlayerLedgerRowProps = {
  id: string;
  name: string;
  score: number;
  cardCount: number;
  cardIDs: string[];
  isActiveTurn?: boolean;
  isLocalPlayer?: boolean;
  status?: "reconnecting" | "absent";
  disconnectSeconds?: number | null;
  clickableCardIndexes?: number[];
  selectedCardIndexes?: number[];
  onCardClick?: (playerID: string, index: number) => void;
};

export function PlayerLedgerRow({
  id,
  name,
  score,
  cardCount,
  cardIDs,
  isActiveTurn = false,
  isLocalPlayer = false,
  status,
  disconnectSeconds = null,
  clickableCardIndexes = [],
  selectedCardIndexes = [],
  onCardClick
}: PlayerLedgerRowProps) {
  return (
    <article className={styles.row}>
      <div className={styles.rowHeader}>
        <p className={styles.name}>
          {name}
          {isLocalPlayer ? <span className={styles.metaChip}>Tu</span> : null}
          {isActiveTurn ? <span className={styles.metaChipActive}>Turno</span> : null}
        </p>
        <ScoreBadge score={score} />
      </div>
      <CompactHand
        cardIDs={cardIDs.slice(0, Math.max(1, cardCount))}
        clickableIndexes={clickableCardIndexes}
        selectedIndexes={selectedCardIndexes}
        {...(onCardClick ? { onCardClick: (index: number) => onCardClick(id, index) } : {})}
      />
      {status ? (
        <p className={styles.issue}>
          <ConnectionIssueBadge status={status} /> {status === "reconnecting" && disconnectSeconds !== null ? <DisconnectCountdown seconds={disconnectSeconds} /> : null}
        </p>
      ) : null}
    </article>
  );
}
