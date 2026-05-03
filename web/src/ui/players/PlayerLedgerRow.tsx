import { motion } from "framer-motion";
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
  avatarSrc?: string;
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
  avatarSrc,
  isActiveTurn = false,
  isLocalPlayer = false,
  status,
  disconnectSeconds = null,
  clickableCardIndexes = [],
  selectedCardIndexes = [],
  onCardClick
}: PlayerLedgerRowProps) {
  const avatarFallback = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <motion.article
      className={`${styles.row} ${isLocalPlayer ? styles.rowLocal : ""} ${isActiveTurn ? styles.rowActiveTurn : ""}`}
      data-active-turn={isActiveTurn ? "true" : "false"}
      data-player-ledger-row="true"
      initial={false}
      animate={{ scale: isActiveTurn ? 1.01 : 1, y: isActiveTurn ? -1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={styles.rowMain}>
        <div className={styles.avatar} aria-label={`Avatar de ${name}`} data-avatar-fallback={avatarSrc ? "false" : "true"}>
          {avatarSrc ? <img src={avatarSrc} alt="" className={styles.avatarImg} /> : <span>{avatarFallback}</span>}
        </div>
        <div className={styles.rowHeader}>
          <div className={styles.identityBlock}>
            <p className={styles.name}>{name}</p>
            <div className={styles.metaRow}>
              {isLocalPlayer ? <span className={styles.metaChip}>Tu</span> : null}
              {isActiveTurn ? <span className={styles.metaChipActive}>Turno actual</span> : <span className={styles.metaChipMuted}>En espera</span>}
            </div>
          </div>
          <ScoreBadge score={score} />
        </div>
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
    </motion.article>
  );
}
