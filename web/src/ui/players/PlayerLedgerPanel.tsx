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
  variant?: "default" | "rail";
};

export function PlayerLedgerPanel({
  players,
  clickableCardsByPlayerID = {},
  selectedCardsByPlayerID = {},
  onPlayerCardClick,
  variant = "default"
}: PlayerLedgerPanelProps) {
  const panelClass = variant === "rail" ? styles.panelRail : styles.panel;
  const rowLayout = variant === "rail" ? "hud" : "default";
  return (
    <Panel title="Ledger de jugadores" variant={variant === "rail" ? "ghost" : "default"}>
      <div className={panelClass}>
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
            layout={rowLayout}
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
