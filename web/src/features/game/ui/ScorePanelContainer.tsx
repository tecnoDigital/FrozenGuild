import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectPlayersLedger } from "../../../store/selectors";
import { assets } from "../../../ui/assets";
import { ScorePanel } from "./ScorePanel";

export function ScorePanelContainer() {
  const playersLedger = useFrozenGuildStore(selectPlayersLedger);

  return (
    <ScorePanel
      title="Score"
      players={playersLedger.map((player) => ({
        id: player.id,
        name: player.name,
        score: player.score,
        avatarSrc: assets.characters.avatars.penguin1
      }))}
    />
  );
}
