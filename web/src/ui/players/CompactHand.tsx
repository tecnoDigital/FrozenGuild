import { motion } from "framer-motion";
import styles from "./Players.module.css";
import { getCardAssetById } from "../../view-model/assetMap.js";

type CompactHandProps = {
  cardIDs: string[];
  clickableIndexes?: number[];
  selectedIndexes?: number[];
  onCardClick?: (index: number) => void;
  size?: "compact" | "local";
};

export function CompactHand({ cardIDs, clickableIndexes = [], selectedIndexes = [], onCardClick, size = "compact" }: CompactHandProps) {
  const clickable = new Set(clickableIndexes);
  const selected = new Set(selectedIndexes);

  return (
    <div className={`${styles.hand} ${size === "local" ? styles.handLocal : ""}`} aria-label="Cartas visibles del jugador">
      {cardIDs.map((cardID, index) => {
        const canClick = !!onCardClick && clickable.has(index);
        const isSelected = selected.has(index);
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
