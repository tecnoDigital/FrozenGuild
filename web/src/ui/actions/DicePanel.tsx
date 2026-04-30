import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";

type DicePanelProps = {
  value: number | null;
  rolled: boolean;
  disabled?: boolean;
  onRoll?: () => void;
};

export function DicePanel({ value, rolled, disabled = false, onRoll }: DicePanelProps) {
  return (
    <div className={styles.dice}>
      <strong>Dado: {rolled ? value : "-"}</strong>
      <Button disabled={disabled} onClick={onRoll}>
        Lanzar dado
      </Button>
    </div>
  );
}
