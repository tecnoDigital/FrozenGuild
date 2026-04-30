import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";

type SealExplosionPanelProps = {
  validTargetCardIDs: string[];
  selectedCardIDs: string[];
  requiredDiscardCount: number;
  onToggleCardID: (cardID: string) => void;
  onResolve: () => void;
};

export function SealExplosionPanel({
  validTargetCardIDs,
  selectedCardIDs,
  requiredDiscardCount,
  onToggleCardID,
  onResolve
}: SealExplosionPanelProps) {
  const canResolve = selectedCardIDs.length === requiredDiscardCount;

  return (
    <div className={styles.panelBlock}>
      <strong>Foca-Bomba pendiente</strong>
      <p className={styles.helper}>Selecciona {requiredDiscardCount} carta(s) para descartar.</p>
      <div className={styles.choiceList}>
        {validTargetCardIDs.map((cardID) => {
          const selected = selectedCardIDs.includes(cardID);
          return (
            <button
              key={cardID}
              type="button"
              className={`${styles.choiceButton} ${selected ? styles.choiceButtonSelected : ""}`.trim()}
              onClick={() => onToggleCardID(cardID)}
            >
              {cardID}
            </button>
          );
        })}
      </div>
      <Button disabled={!canResolve} onClick={onResolve}>Resolver Foca-Bomba</Button>
    </div>
  );
}
