import { ExpeditionPreview } from "../lobby/ExpeditionPreview.js";
import { FeaturedCardPreview } from "../lobby/FeaturedCardPreview.js";
import { LobbyBackground } from "../lobby/LobbyBackground.js";
import { LobbyForm } from "../lobby/LobbyForm.js";
import { LobbyHero } from "../lobby/LobbyHero.js";
import styles from "../lobby/Lobby.module.css";
import { RoomPlayersPanel } from "../lobby/RoomPlayersPanel.js";

type LobbyScreenProps = {
  playerName: string;
  matchID: string;
  playerID: string;
  players: string[];
  busy?: boolean;
  onPlayerNameChange?: (value: string) => void;
  onMatchIDChange?: (value: string) => void;
  onPlayerIDChange?: (value: string) => void;
  onCreate?: () => void;
  onJoin?: () => void;
};

export function LobbyScreen(props: LobbyScreenProps) {
  return (
    <main className={styles.screen}>
      <LobbyBackground />
      <LobbyHero />
      <section className={styles.grid}>
        <div style={{ display: "grid", gap: 16 }}>
          <LobbyForm {...props} />
          <RoomPlayersPanel players={props.players} />
        </div>
        <div style={{ display: "grid", gap: 16 }}>
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
      </section>
    </main>
  );
}
