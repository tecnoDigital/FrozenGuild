import { motion, AnimatePresence } from "framer-motion";
import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";

type DicePanelProps = {
  value: number | null;
  rolled: boolean;
  disabled?: boolean;
  onRoll?: () => void;
};

export function DicePanel({ value, rolled, disabled = false, onRoll }: DicePanelProps) {
  const actionAvailable = !disabled;

  return (
    <div className={`${styles.dice} ${actionAvailable ? styles.diceAvailable : styles.diceDisabled}`} data-action-available={actionAvailable ? "true" : "false"} aria-disabled={!actionAvailable}>
      <img className={styles.diceIcon} src="/assets/ui/icons/dice.png" alt="Dado" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.strong
          key={rolled ? `rolled-${value}` : "idle"}
          className={rolled ? styles.diceValueRolled : styles.diceValueIdle}
          initial={{ opacity: 0.7, y: 3, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0.65, y: -2, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-live="polite"
        >
          Dado: {rolled ? value : "-"}
        </motion.strong>
      </AnimatePresence>
      <Button disabled={disabled} onClick={onRoll}>
        Lanzar dado
      </Button>
    </div>
  );
}
