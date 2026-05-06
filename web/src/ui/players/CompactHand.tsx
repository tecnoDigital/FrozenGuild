import { motion } from "framer-motion";
import styles from "./Players.module.css";
import { getCardAssetById } from "../../view-model/assetMap.js";

type CompactHandProps = {
  cardIDs: string[];
  clickableIndexes?: number[];
  selectedIndexes?: number[];
  onCardClick?: (index: number) => void;
  size?: "compact" | "local" | "hud";
};

function getFanRotation(index: number, total: number): number {
  if (total <= 1) return 0;
  const maxAngle = Math.min(8, total * 2.5);
  return -maxAngle + (index / (total - 1)) * (maxAngle * 2);
}

export function CompactHand({ cardIDs, clickableIndexes = [], selectedIndexes = [], onCardClick, size = "compact" }: CompactHandProps) {
  const clickable = new Set(clickableIndexes);
  const selected = new Set(selectedIndexes);
  const isHud = size === "hud";

  return (
    <div
      className={
        isHud
          ? styles.hudHand
          : `${styles.hand} ${size === "local" ? styles.handLocal : ""}`
      }
      aria-label="Cartas visibles del jugador"
    >
      {cardIDs.map((cardID, index) => {
        const canClick = !!onCardClick && clickable.has(index);
        const isSelected = selected.has(index);
        const rotation = isHud ? getFanRotation(index, cardIDs.length) : 0;

        if (isHud) {
          return (
            <button
              key={cardID}
              type="button"
              className={`${styles.hudCardButton} ${canClick ? styles.hudCardClickable : ""} ${isSelected ? styles.hudCardSelected : ""}`}
              onClick={canClick ? () => onCardClick(index) : undefined}
              disabled={!canClick}
              aria-pressed={isSelected}
              aria-label={`${cardID} ${canClick ? "seleccionable" : "bloqueada"}`}
              style={{
                zIndex: cardIDs.length - index,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <motion.div
                layout
                layoutId={`card-${cardID}`}
                className={styles.hudCard}
                title={cardID}
                initial={false}
                animate={{ scale: isSelected ? 1.05 : 1, y: isSelected ? -2 : 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <img className={styles.hudCardImg} src={getCardAssetById(cardID)} alt={cardID} />
              </motion.div>
            </button>
          );
        }

        return (
          <button
            key={cardID}
            type="button"
            className={`${styles.compactCardButton} ${size === "local" ? styles.compactCardButtonLocal : ""} ${canClick ? styles.compactCardClickable : ""} ${isSelected ? styles.compactCardSelected : ""}`}
            onClick={canClick ? () => onCardClick(index) : undefined}
            disabled={!canClick}
            aria-pressed={isSelected}
            aria-label={`${cardID} ${canClick ? "seleccionable" : "bloqueada"}`}
            style={{ zIndex: cardIDs.length - index }}
          >
            <motion.div
              layout
              layoutId={`card-${cardID}`}
              className={`${styles.compactCard} ${size === "local" ? styles.compactCardLocal : ""}`}
              title={cardID}
              initial={false}
              animate={{ scale: isSelected ? 1.05 : 1, y: isSelected ? -1 : 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <img className={styles.compactCardImg} src={getCardAssetById(cardID)} alt={cardID} />
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
