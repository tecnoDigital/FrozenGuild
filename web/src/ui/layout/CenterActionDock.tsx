import { DicePanel } from "../actions/DicePanel.js";
import { ActionPanel } from "../actions/ActionPanel.js";
import type { ActionFlowView } from "../../store/selectors.js";
import type { SwapLocation } from "../../../../shared/game/types.js";

type CenterActionDockProps = {
  rolled: boolean;
  value: number | null;
  disabled: boolean;
  onRoll: () => void;
  flow: ActionFlowView;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  onEndTurn: () => void;
  swap: {
    source: SwapLocation | null;
    target: SwapLocation | null;
    canConfirm: boolean;
    helperText: string;
    sourceKey: string;
    targetKey: string;
    options: Array<{ key: string; label: string; location: SwapLocation }>;
    onSourceKeyChange: (key: string) => void;
    onTargetKeyChange: (key: string) => void;
    onConfirm: () => void;
    onClearSelection: () => void;
  };
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
  spy: {
    active: boolean;
    selectedSlots: number[];
    availableSlots: number[];
    revealedSlots: number[];
    selectedGiftSlot: number | null;
    targetPlayerID: string;
    targetPlayerIDs: string[];
    onToggleSlot: (slot: number) => void;
    onSelectGiftSlot: (slot: number) => void;
    onTargetPlayerChange: (playerID: string) => void;
    onConfirmSpy: () => void;
    onGiveCard: () => void;
    onCompleteSpy: () => void;
  } | null;
};

export function CenterActionDock({
  rolled,
  value,
  disabled,
  onRoll,
  flow,
  onChoosePadrinoAction,
  onEndTurn,
  swap,
  orca,
  seal,
  spy
}: CenterActionDockProps) {
  return (
    <div>
      <DicePanel rolled={rolled} value={value} disabled={disabled} onRoll={onRoll} />
      <ActionPanel
        flow={flow}
        onChoosePadrinoAction={onChoosePadrinoAction}
        onEndTurn={onEndTurn}
        swap={swap}
        orca={orca}
        seal={seal}
        spy={spy}
      />
    </div>
  );
}
