import { Button } from "../shared/Button.js";
import styles from "./Lobby.module.css";

type LobbyFormProps = {
  playerName: string;
  matchID: string;
  playerID: string;
  busy?: boolean;
  onPlayerNameChange?: (value: string) => void;
  onMatchIDChange?: (value: string) => void;
  onPlayerIDChange?: (value: string) => void;
  onCreate?: () => void;
  onJoin?: () => void;
};

export function LobbyForm({
  playerName,
  matchID,
  playerID,
  busy = false,
  onPlayerNameChange,
  onMatchIDChange,
  onPlayerIDChange,
  onCreate,
  onJoin
}: LobbyFormProps) {
  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Sala</h3>
      <div className={styles.list}>
        <label>
          Nombre
          <input value={playerName} onChange={(e) => onPlayerNameChange?.(e.target.value)} />
        </label>
        <label>
          Match ID
          <input value={matchID} onChange={(e) => onMatchIDChange?.(e.target.value)} />
        </label>
        <label>
          Player ID
          <input value={playerID} onChange={(e) => onPlayerIDChange?.(e.target.value)} />
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button disabled={busy} onClick={onCreate}>
          Crear sala
        </Button>
        <Button disabled={busy} onClick={onJoin}>
          Romper el hielo
        </Button>
      </div>
    </section>
  );
}
