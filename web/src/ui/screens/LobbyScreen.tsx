import { ExpeditionPreview } from "../lobby/ExpeditionPreview.js";
import { FeaturedCardPreview } from "../lobby/FeaturedCardPreview.js";
import { LobbyBackground } from "../lobby/LobbyBackground.js";
import { LobbyForm } from "../lobby/LobbyForm.js";
import { LobbyHero } from "../lobby/LobbyHero.js";
import styles from "../lobby/Lobby.module.css";
import { RoomPlayersPanel } from "../lobby/RoomPlayersPanel.js";
import { AvailableMatchesPanel } from "../lobby/AvailableMatchesPanel.js";

type LobbyScreenProps = {
  playerName: string;
  numPlayers: number;
  selectedBotPlayerIDs: string[];
  players: string[];
  availableMatches: Array<{
    matchID: string;
    availableSeats: string[];
    occupiedSeats: string[];
    occupiedPlayers: Array<{ seat: string; name: string; isBot: boolean }>;
    totalPlayers: number;
  }>;
  selectedJoinMatchID: string;
  busy?: boolean;
  onPlayerNameChange?: (value: string) => void;
  onNumPlayersChange?: (value: number) => void;
  onToggleBotPlayerID?: (playerID: string) => void;
  onSelectJoinMatchID?: (matchID: string) => void;
  onRefreshMatches?: () => void;
  onCreate?: () => void;
  onJoin?: () => void;
};

export function LobbyScreen(props: LobbyScreenProps) {
  const selectedMatch = props.availableMatches.find((match) => match.matchID === props.selectedJoinMatchID) ?? null;
  const joinableMatches = props.availableMatches.filter((match) => match.availableSeats.length > 0);

  return (
    <main className={styles.screen}>
      <LobbyBackground />
      <section className={styles.lobbyFrame}>
        <LobbyHero />
        <div className={styles.primaryColumn}>
          <LobbyForm {...props} />
          <RoomPlayersPanel
            players={props.players}
            numPlayers={props.numPlayers}
            selectedMatch={selectedMatch}
            selectedBotPlayerIDs={props.selectedBotPlayerIDs}
          />
          <AvailableMatchesPanel
            rows={joinableMatches}
            selectedMatchID={props.selectedJoinMatchID}
            {...(props.busy !== undefined ? { busy: props.busy } : {})}
            {...(props.onSelectJoinMatchID ? { onSelectMatchID: props.onSelectJoinMatchID } : {})}
            {...(props.onRefreshMatches ? { onRefresh: props.onRefreshMatches } : {})}
          />
        </div>
        <div className={styles.secondaryColumn}>
          <ExpeditionPreview
            cards={[
              { id: "penguin-001", label: "Pinguino", image: "/src/assets/cards/penguin-1.png" },
              { id: "orca-001", label: "Orca", image: "/src/assets/cards/orca.png" },
              { id: "walrus-001", label: "Morsa", image: "/src/assets/cards/walrus.png" }
            ]}
          />
          <FeaturedCardPreview
            id="featured-orca"
            label="Orca"
            image="/src/assets/cards/orca.png"
            detail="Destruye una carta propia para continuar."
          />
        </div>
        <button type="button" className={styles.ctaBreakIce} onClick={props.onJoin} disabled={props.busy || !props.selectedJoinMatchID}>
          Unirse a la partida
        </button>
      </section>
    </main>
  );
}
