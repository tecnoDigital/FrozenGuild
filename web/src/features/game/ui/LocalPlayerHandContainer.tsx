import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectLocalPlayerHandView } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { PlayerHand } from "./PlayerHand";

const cardImageByVariant = {
  "penguin-1": assets.cards.fronts.penguin1,
  "penguin-2": assets.cards.fronts.penguin2,
  "penguin-3": assets.cards.fronts.penguin3,
  walrus: assets.cards.fronts.walrus,
  petrel: assets.cards.fronts.petrel,
  "sea-elephant": assets.cards.fronts.seaElephant,
  krill: assets.cards.fronts.krill,
  orca: assets.cards.fronts.orca,
  "seal-bomb": assets.cards.fronts.sealBomb
} as const;

export function LocalPlayerHandContainer() {
  const localHand = useFrozenGuildStore(selectLocalPlayerHandView);

  return (
    <PlayerHand
      playerId={localHand.playerId}
      frameSrc={assets.ui.frames.playerHand}
      cards={localHand.cards.map((card) => ({
        cardType: card.cardType,
        variant: card.variant,
        imageSrc: cardImageByVariant[card.variant],
        alt: `${card.cardType} card`,
        state: "default"
      }))}
    />
  );
}
