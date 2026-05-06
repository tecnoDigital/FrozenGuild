import { PlayerLedgerPanel } from "../players/PlayerLedgerPanel.js";

type RightLedgerRailProps = {
  players: Array<{ id: string; name: string; score: number; cards: number; cardIDs: string[]; isActiveTurn?: boolean; isLocalPlayer?: boolean }>;
  unstablePlayers: Array<{ id: string; name: string; status: "reconnecting" | "absent"; disconnectSeconds: number | null }>;
  clickableCardsByPlayerID?: Record<string, number[]>;
  selectedCardsByPlayerID?: Record<string, number[]>;
  onPlayerCardClick?: (playerID: string, index: number) => void;
};

export function RightLedgerRail({ players, unstablePlayers, clickableCardsByPlayerID, selectedCardsByPlayerID, onPlayerCardClick }: RightLedgerRailProps) {
  const statusByID = new Map(unstablePlayers.map((player) => [player.id, player]));
  const rows = players.map((player) => {
    const unstable = statusByID.get(player.id);
    if (!unstable) {
      return { ...player, disconnectSeconds: null };
    }
    return { ...player, status: unstable.status, disconnectSeconds: unstable.disconnectSeconds };
  });

  return (
    <PlayerLedgerPanel
      players={rows}
      variant="rail"
      {...(clickableCardsByPlayerID ? { clickableCardsByPlayerID } : {})}
      {...(selectedCardsByPlayerID ? { selectedCardsByPlayerID } : {})}
      {...(onPlayerCardClick ? { onPlayerCardClick } : {})}
    />
  );
}
