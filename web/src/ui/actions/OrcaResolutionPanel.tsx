import { Button } from "../shared/Button.js";
import styles from "./Actions.module.css";

type OrcaResolutionPanelProps = {
  validTargetCardIDs: string[];
  selectedCardID: string | null;
  onSelectCardID: (cardID: string) => void;
  onResolve: () => void;
};

export function OrcaResolutionPanel({ validTargetCardIDs, selectedCardID, onSelectCardID, onResolve }: OrcaResolutionPanelProps) {
  return (
    <div className={styles.panelBlock}>
      <strong>Orca pendiente</strong>
      <p className={styles.helper}>Debes destruir una carta propia para continuar.</p>
      <div className={styles.choiceList}>
        {validTargetCardIDs.map((cardID) => (
          <button
            key={cardID}
            type="button"
            className={`${styles.choiceButton} ${selectedCardID === cardID ? styles.choiceButtonSelected : ""}`.trim()}
            onClick={() => onSelectCardID(cardID)}
          >
            {cardID}
          </button>
        ))}
      </div>
      <Button disabled={!selectedCardID} onClick={onResolve}>Resolver Orca</Button>
    </div>
  );
}
