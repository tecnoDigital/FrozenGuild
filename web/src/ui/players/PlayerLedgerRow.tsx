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
  avatarColorValue?: string | undefined;
  isActiveTurn?: boolean;
  isLocalPlayer?: boolean;
  status?: "reconnecting" | "absent";
  disconnectSeconds?: number | null;
  clickableCardIndexes?: number[];
  selectedCardIndexes?: number[];
  onCardClick?: (playerID: string, index: number) => void;
  layout?: "default" | "hud";
};

export function PlayerLedgerRow({
  id,
  name,
  score,
  cardCount,
  cardIDs,
  avatarSrc,
  avatarColorValue,
  isActiveTurn = false,
  isLocalPlayer = false,
  status,
  disconnectSeconds = null,
  clickableCardIndexes = [],
  selectedCardIndexes = [],
  onCardClick,
  layout = "default"
}: PlayerLedgerRowProps) {
  const avatarFallback = name.trim().charAt(0).toUpperCase() || "?";
  const isHud = layout === "hud";

  const rowClass = isHud
    ? `${styles.hudRow} ${isLocalPlayer ? styles.hudRowLocal : ""} ${isActiveTurn ? styles.hudRowActiveTurn : ""}`
    : `${styles.row} ${isLocalPlayer ? styles.rowLocal : ""} ${isActiveTurn ? styles.rowActiveTurn : ""}`;

  return (
    <motion.article
      className={rowClass}
      data-active-turn={isActiveTurn ? "true" : "false"}
      data-player-ledger-row="true"
      initial={false}
      animate={{ scale: isActiveTurn ? 1.01 : 1, y: isActiveTurn ? -1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {isHud ? (
        <>
          {/* Zone 1: Avatar */}
          <div
            className={`${styles.hudAvatar} ${avatarColorValue && avatarSrc ? styles.hudAvatarFilled : ""}`}
            aria-label={`Avatar de ${name}`}
            data-avatar-fallback={avatarSrc ? "false" : "true"}
            style={avatarColorValue ? ({ "--hud-avatar-color": avatarColorValue } as React.CSSProperties) : undefined}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className={styles.hudAvatarImg} />
            ) : (
              <span className={styles.hudAvatarFallback}>{avatarFallback}</span>
            )}
          </div>

          {/* Zone 2: Info */}
          <div className={styles.hudInfo}>
            <p className={styles.hudName}>{name}</p>
            <div className={styles.hudScore}>
              <img
                src="/assets/ui/icons/fish.png"
                alt=""
                className={styles.hudScoreIcon}
              />
              <span>{score}</span>
            </div>
            {status ? (
              <div className={styles.hudIssue}>
                <ConnectionIssueBadge status={status} />
                {status === "reconnecting" && disconnectSeconds !== null ? (
                  <DisconnectCountdown seconds={disconnectSeconds} />
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Zone 3: Cards */}
          <div className={styles.hudCards}>
            <CompactHand
              cardIDs={cardIDs.slice(0, Math.max(1, cardCount))}
              clickableIndexes={clickableCardIndexes}
              selectedIndexes={selectedCardIndexes}
              size="hud"
              {...(onCardClick ? { onCardClick: (index: number) => onCardClick(id, index) } : {})}
            />
          </div>
        </>
      ) : (
        <>
          <div className={styles.rowIdentity}>
            <div className={styles.avatar} aria-label={`Avatar de ${name}`} data-avatar-fallback={avatarSrc ? "false" : "true"}>
              {avatarSrc ? <img src={avatarSrc} alt="" className={styles.avatarImg} /> : <span>{avatarFallback}</span>}
            </div>
            <div className={styles.identityInfo}>
              <p className={styles.name}>{name}</p>
              <ScoreBadge score={score} />
            </div>
          </div>
          <div className={styles.rowHand}>
            <CompactHand
              cardIDs={cardIDs.slice(0, Math.max(1, cardCount))}
              clickableIndexes={clickableCardIndexes}
              selectedIndexes={selectedCardIndexes}
              {...(onCardClick ? { onCardClick: (index: number) => onCardClick(id, index) } : {})}
            />
          </div>
          {status ? (
            <p className={styles.issue}>
              <ConnectionIssueBadge status={status} /> {status === "reconnecting" && disconnectSeconds !== null ? <DisconnectCountdown seconds={disconnectSeconds} /> : null}
            </p>
          ) : null}
        </>
      )}
    </motion.article>
  );
}
