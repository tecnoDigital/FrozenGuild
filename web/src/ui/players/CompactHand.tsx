import { motion } from "framer-motion";
import styles from "./Players.module.css";
import { getCardAssetById } from "../../view-model/assetMap.js";

type CompactHandProps = {
  cardIDs: string[];
  clickableIndexes?: number[];
  selectedIndexes?: number[];
  onCardClick?: (index: number) => void;
};

export function CompactHand({ cardIDs, clickableIndexes = [], selectedIndexes = [], onCardClick }: CompactHandProps) {
  const clickable = new Set(clickableIndexes);
  const selected = new Set(selectedIndexes);

  return (
    <div className={styles.hand}>
      {cardIDs.map((cardID, index) => {
        const canClick = !!onCardClick && clickable.has(index);
        const isSelected = selected.has(index);
        return (
          <button
            key={cardID}
            type="button"
            className={`${styles.compactCardButton} ${isSelected ? styles.compactCardSelected : ""}`}
            onClick={canClick ? () => onCardClick(index) : undefined}
            disabled={!canClick}
          >
            <motion.div layout layoutId={`card-${cardID}`} className={styles.compactCard} title={cardID}>
              <img className={styles.compactCardImg} src={getCardAssetById(cardID)} alt={cardID} />
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
