import styles from "./LobbyVisual.module.css";

type PlayerNameInputProps = {
  value: string;
  onChange?: (value: string) => void;
};

export function PlayerNameInput({ value, onChange }: PlayerNameInputProps) {
  return (
    <label className={styles.field} data-testid="lobby-player-name-input">
      Nombre de jugador
      <input value={value} onChange={(event) => onChange?.(event.target.value)} maxLength={24} />
    </label>
  );
}
