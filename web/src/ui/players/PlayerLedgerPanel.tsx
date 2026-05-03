import { Panel } from "../shared/Panel.js";
import { PlayerLedgerRow } from "./PlayerLedgerRow.js";
import styles from "./Players.module.css";

type PlayerLedgerPanelProps = {
  players: Array<{
    id: string;
    name: string;
    score: number;
    cards: number;
    cardIDs: string[];
    avatarSrc?: string;
    isActiveTurn?: boolean;
    isLocalPlayer?: boolean;
    status?: "reconnecting" | "absent";
    disconnectSeconds?: number | null;
  }>;
  clickableCardsByPlayerID?: Record<string, number[]>;
  selectedCardsByPlayerID?: Record<string, number[]>;
  onPlayerCardClick?: (playerID: string, index: number) => void;
};

export function PlayerLedgerPanel({ players, clickableCardsByPlayerID = {}, selectedCardsByPlayerID = {}, onPlayerCardClick }: PlayerLedgerPanelProps) {
  return (
    <Panel title="Ledger de jugadores">
      <div className={styles.panel}>
        {players.map((player) => (
          <PlayerLedgerRow
            key={player.id}
            id={player.id}
            name={player.name}
            score={player.score}
            cardCount={player.cards}
            cardIDs={player.cardIDs}
            isActiveTurn={!!player.isActiveTurn}
            isLocalPlayer={!!player.isLocalPlayer}
            clickableCardIndexes={clickableCardsByPlayerID[player.id] ?? []}
            selectedCardIndexes={selectedCardsByPlayerID[player.id] ?? []}
            {...(player.avatarSrc ? { avatarSrc: player.avatarSrc } : {})}
            {...(onPlayerCardClick ? { onCardClick: onPlayerCardClick } : {})}
            {...(player.status ? { status: player.status } : {})}
            {...(player.disconnectSeconds !== undefined ? { disconnectSeconds: player.disconnectSeconds } : {})}
          />
        ))}
      </div>
    </Panel>
  );
}
