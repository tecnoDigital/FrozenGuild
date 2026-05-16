import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectCurrentTurnView } from "../../../store/selectors";
import { CurrentTurnPanel } from "./CurrentTurnPanel";

export function CurrentTurnPanelContainer() {
  const turnView = useFrozenGuildStore(selectCurrentTurnView);

  return <CurrentTurnPanel currentPlayerName={turnView.currentPlayerName} turnCount={turnView.turnCount} />;
}
