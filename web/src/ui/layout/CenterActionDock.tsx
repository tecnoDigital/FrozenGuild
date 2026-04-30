import { DicePanel } from "../actions/DicePanel.js";
import { Button } from "../shared/Button.js";

type CenterActionDockProps = {
  rolled: boolean;
  value: number | null;
  disabled: boolean;
  onRoll: () => void;
  showPadrinoOptions: boolean;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
};

export function CenterActionDock({
  rolled,
  value,
  disabled,
  onRoll,
  showPadrinoOptions,
  onChoosePadrinoAction
}: CenterActionDockProps) {
  return (
    <div>
      <DicePanel rolled={rolled} value={value} disabled={disabled} onRoll={onRoll} />
      {showPadrinoOptions ? (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Button onClick={() => onChoosePadrinoAction(1)}>Pesca</Button>
          <Button onClick={() => onChoosePadrinoAction(4)}>Spy</Button>
          <Button onClick={() => onChoosePadrinoAction(5)}>Snap</Button>
        </div>
      ) : null}
    </div>
  );
}
