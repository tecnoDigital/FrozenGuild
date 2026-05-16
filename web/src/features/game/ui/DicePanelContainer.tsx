import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectDiceView } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { DicePanel } from "./DicePanel";

export function DicePanelContainer() {
  const diceView = useFrozenGuildStore(selectDiceView);

  return <DicePanel result={diceView.value ?? 0} maxValue={6} frameSrc={assets.ui.frames.dicePanel} />;
}
