import type { LobbyColorID } from "./lobbyStore";
import { lobbyColorOptions } from "./lobbyStore";
import styles from "./LobbyVisual.module.css";

type ColorSelectorProps = {
  value: LobbyColorID;
  onChange?: (id: LobbyColorID) => void;
};

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div className={styles.colorGrid} data-testid="lobby-color-selector">
      {lobbyColorOptions.map((color) => {
        const selected = color.id === value;
        return (
          <button
            key={color.id}
            type="button"
            className={selected ? styles.colorSwatchSelected : styles.colorSwatch}
            onClick={() => onChange?.(color.id)}
            title={`${color.label} ${color.value}`}
            style={{ ["--lobby-color" as string]: color.value }}
          >
            <span className={styles.colorDot} />
            <span>{color.label}</span>
          </button>
        );
      })}
    </div>
  );
}
