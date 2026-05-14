import { motion } from "framer-motion";
import type { ActionFlowView } from "../../store/selectors.js";
import styles from "./Actions.module.css";
type ActionPanelProps = {
  flow: ActionFlowView;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  orca: {
    validTargetCardIDs: string[];
    selectedCardID: string | null;
    onSelectCardID: (cardID: string) => void;
    onResolve: () => void;
  } | null;
  seal: {
    validTargetCardIDs: string[];
    selectedCardIDs: string[];
    requiredDiscardCount: number;
    onToggleCardID: (cardID: string) => void;
    onResolve: () => void;
  } | null;
};

export function ActionPanel({ flow }: ActionPanelProps) {
  const modeIcon =
    flow.mode === "fish"
      ? "/assets/ui/icons/fish.png"
      : flow.mode === "orca"
        ? "/assets/ui/icons/orca.png"
        : null;

  const modeLabel =
    flow.mode === "fish"
      ? "Pesca"
      : flow.mode === "spy"
        ? "Espionaje"
        : flow.mode === "swap"
          ? "Intercambio"
          : flow.mode === "orca"
            ? "Orca"
            : flow.mode === "seal"
              ? "Foca-Bomba"
              : flow.mode === "padrino"
                ? "Padrino"
                : flow.mode === "done"
                  ? "Fin de accion"
                  : flow.mode === "roll"
                    ? "Dado"
                    : "Espera";

  const interactiveMode = flow.mode !== "waiting" && flow.mode !== "done";

  return (
    <div className={styles.panelBlock}>
      <p className={styles.helperRow}>
        {modeIcon ? <img className={styles.modeIcon} src={modeIcon} alt="" aria-hidden /> : null}
        <motion.span
          className={`${styles.modeChip} ${interactiveMode ? styles.modeChipInteractive : styles.modeChipWaiting}`}
          initial={false}
          animate={{ scale: interactiveMode ? 1.02 : 1, opacity: interactiveMode ? 1 : 0.75 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {modeLabel}
        </motion.span>
        <span>{flow.helperText}</span>
      </p>

    </div>
  );
}
