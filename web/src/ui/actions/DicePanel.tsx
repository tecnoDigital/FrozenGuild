import { DiceDecisionConsole } from "./dice/DiceDecisionConsole.js";

export type DicePanelProps = {
  value: number | null;
  rolled: boolean;
  disabled?: boolean;
  onRoll?: (() => void) | undefined;
};

export function DicePanel({ value, rolled, disabled = false, onRoll }: DicePanelProps) {
  return (
    <DiceDecisionConsole
      value={value}
      rolled={rolled}
      disabled={disabled}
      onRoll={onRoll}
    />
  );
}
