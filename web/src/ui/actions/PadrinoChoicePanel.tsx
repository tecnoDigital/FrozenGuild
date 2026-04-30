import { Button } from "../shared/Button.js";
import styles from "./Actions.module.css";

type PadrinoChoicePanelProps = {
  onChoose: (action: 1 | 4 | 5) => void;
};

export function PadrinoChoicePanel({ onChoose }: PadrinoChoicePanelProps) {
  return (
    <div className={styles.actionRow}>
      <Button onClick={() => onChoose(1)}>Pesca</Button>
      <Button onClick={() => onChoose(4)}>Spy</Button>
      <Button onClick={() => onChoose(5)}>Snap</Button>
    </div>
  );
}
