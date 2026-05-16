import { DiceDecisionConsole } from "./dice/DiceDecisionConsole.js";

export type DicePanelProps = {
  value: number | null;
  rolled: boolean;
  disabled?: boolean;
  onRoll?: (() => void) | undefined;
};

export function DicePanel({ value, rolled, disabled = false, onRoll }: DicePanelProps) {
  return (
    <div
      data-action-available={disabled ? "false" : "true"}
      aria-disabled={disabled}
    >
      <DiceDecisionConsole
        value={value}
        rolled={rolled}
        disabled={disabled}
        onRoll={onRoll}
      />
    </div>
  );
}
