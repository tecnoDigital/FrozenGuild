import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectActionButtonsView, selectActionFlowView } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { ActionBar } from "./ActionBar";

export function ActionBarContainer() {
  const flow = useFrozenGuildStore(selectActionFlowView);
  const actions = selectActionButtonsView(flow);

  return <ActionBar actions={actions} frameSrc={assets.ui.frames.actionBar} />;
}
