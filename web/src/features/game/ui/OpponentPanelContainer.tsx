import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectCurrentTurnView, selectOpponentHandCounts, selectOpponentIdentities, selectPlayersLedger } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { OpponentPanel } from "./OpponentPanel";

const avatarFallbacks = [
  assets.characters.avatars.penguin2,
  assets.characters.avatars.walrus,
  assets.characters.avatars.petrel,
  assets.characters.avatars.seaElephant,
  assets.characters.avatars.orca,
  assets.characters.avatars.sealBomb
];

export function OpponentPanelContainer() {
  const identities = useFrozenGuildStore(selectOpponentIdentities);
  const handCounts = useFrozenGuildStore(selectOpponentHandCounts);
  const currentTurn = useFrozenGuildStore(selectCurrentTurnView);
  const playersLedger = useFrozenGuildStore(selectPlayersLedger);
  const scoresById = new Map(playersLedger.map((player) => [player.id, player.score]));
  const handCountById = new Map(handCounts.map((player) => [player.id, player.handCount]));

  return (
    <OpponentPanel
      title="Opponents"
      opponents={identities.map((player, index) => ({
        id: player.id,
        name: player.name,
        avatarSrc: avatarFallbacks[index % avatarFallbacks.length] ?? assets.characters.avatars.penguin2,
        score: scoresById.get(player.id) ?? 0,
        handCount: handCountById.get(player.id) ?? 0,
        isCurrentTurn: player.id === currentTurn.currentPlayerID
      }))}
    />
  );
}
