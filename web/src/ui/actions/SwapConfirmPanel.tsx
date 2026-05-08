import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";
import type { SwapLocation } from "../../../../shared/game/types.js";

type SwapOption = {
  key: string;
  label: string;
  location: SwapLocation;
};

type SwapConfirmPanelProps = {
  sourceLabel: string;
  targetLabel: string;
  canConfirm: boolean;
  helperText: string;
  sourceOptions: SwapOption[];
  targetOptions: SwapOption[];
  sourceKey: string;
  targetKey: string;
  onSourceKeyChange: (key: string) => void;
  onTargetKeyChange: (key: string) => void;
  onConfirm: () => void;
  onClearSelection: () => void;
};

export function SwapConfirmPanel({
  sourceLabel,
  targetLabel,
  canConfirm,
  helperText,
  sourceOptions,
  targetOptions,
  sourceKey,
  targetKey,
  onSourceKeyChange,
  onTargetKeyChange,
  onConfirm,
  onClearSelection
}: SwapConfirmPanelProps) {
  const usingVisualSelection = !!sourceKey || !!targetKey;

  return (
    <div className={styles.panelBlock}>
      <p className={styles.helper}>{helperText}</p>
      <p className={styles.helper}>Tambien puedes seleccionar cartas directo en el tablero y el ledger.</p>
      <label className={styles.helper} style={{ opacity: usingVisualSelection ? 0.72 : 1 }}>
        Origen
        <select className={styles.select} value={sourceKey} onChange={(event) => onSourceKeyChange(event.target.value)}>
          <option value="">Selecciona origen</option>
          {sourceOptions.map((option) => (
            <option key={`source-${option.key}`} value={option.key}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className={styles.helper} style={{ opacity: usingVisualSelection ? 0.72 : 1 }}>
        Destino
        <select className={styles.select} value={targetKey} onChange={(event) => onTargetKeyChange(event.target.value)}>
          <option value="">Selecciona destino</option>
          {targetOptions.map((option) => (
            <option key={`target-${option.key}`} value={option.key}>{option.label}</option>
          ))}
        </select>
      </label>
      <p className={styles.helper}>Origen: {sourceLabel}</p>
      <p className={styles.helper}>Destino: {targetLabel}</p>
      <div className={styles.actionRow}>
        <Button disabled={!canConfirm} onClick={onConfirm}>Confirmar intercambio</Button>
        <Button onClick={onClearSelection}>Limpiar seleccion</Button>
      </div>
    </div>
  );
}
