import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectDeckCount } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { DeckPanel } from "./DeckPanel";

export function DeckPanelContainer() {
  const remainingCards = useFrozenGuildStore(selectDeckCount);

  return <DeckPanel remainingCards={remainingCards} backImageSrc={assets.cards.back} />;
}
