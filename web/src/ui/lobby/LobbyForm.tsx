import { Button } from "../shared/Button.js";
import styles from "./Lobby.module.css";
import { AvatarSelector } from "../../features/lobby/AvatarSelector.js";
import { ColorSelector } from "../../features/lobby/ColorSelector.js";
import { PlayerNameInput } from "../../features/lobby/PlayerNameInput.js";
import { PlayerPreviewCard } from "../../features/lobby/PlayerPreviewCard.js";
import type { LobbyAvatarID, LobbyColorID } from "../../features/lobby/lobbyStore.js";

type LobbyFormProps = {
  playerName: string;
  avatarID?: LobbyAvatarID;
  colorID?: LobbyColorID;
  numPlayers?: number;
  botPlayerIDs?: string[];
  busy?: boolean;
  onPlayerNameChange?: (value: string) => void;
  onAvatarChange?: (avatarID: LobbyAvatarID) => void;
  onColorChange?: (colorID: LobbyColorID) => void;
  onNumPlayersChange?: (value: number) => void;
  onToggleBotPlayerID?: (playerID: string) => void;
  onCreate?: () => void;
};

export function LobbyForm({
  playerName,
  avatarID = "penguin1",
  colorID = "ice",
  numPlayers = 2,
  botPlayerIDs = [],
  busy = false,
  onPlayerNameChange,
  onAvatarChange,
  onColorChange,
  onNumPlayersChange,
  onToggleBotPlayerID,
  onCreate
}: LobbyFormProps) {
  const botCandidates = Array.from({ length: Math.max(0, numPlayers - 1) }, (_, index) => String(index + 1));

  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Crear partida</h3>
      <div className={styles.list}>
        <PlayerNameInput value={playerName} onChange={onPlayerNameChange} />
        <div>
          <strong>Avatar</strong>
          <AvatarSelector value={avatarID} onChange={onAvatarChange} />
        </div>
        <div>
          <strong>Color</strong>
          <ColorSelector value={colorID} onChange={onColorChange} />
        </div>
        <PlayerPreviewCard name={playerName} avatarID={avatarID} colorID={colorID} />
        <label>
          Cantidad de jugadores
          <select value={numPlayers} onChange={(e) => onNumPlayersChange?.(Number(e.target.value))}>
            {[2, 3, 4].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </label>

        <div>
          <strong>Asientos BOT</strong>
          <div className={styles.botRow}>
            {botCandidates.map((id) => {
              const selected = botPlayerIDs.includes(id);
              return (
                <button
                  key={`lobby-bot-${id}`}
                  type="button"
                  className={selected ? styles.botChipActive : styles.botChip}
                  onClick={() => onToggleBotPlayerID?.(id)}
                >
                  {selected ? `BOT ${id} ✓` : `BOT ${id}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.actionRow}>
        <Button className={styles.createBtnSmall} disabled={busy} onClick={onCreate}>
          Crear partida
        </Button>
      </div>
    </section>
  );
}
