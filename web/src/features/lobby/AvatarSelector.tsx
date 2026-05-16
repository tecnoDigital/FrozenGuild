import type { LobbyAvatarID } from "./lobbyStore";
import { lobbyAvatarOptions } from "./lobbyStore";
import styles from "./LobbyVisual.module.css";

type AvatarSelectorProps = {
  value: LobbyAvatarID;
  onChange?: (id: LobbyAvatarID) => void;
};

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  return (
    <div className={styles.optionGrid} data-testid="lobby-avatar-selector">
      {lobbyAvatarOptions.map((avatar) => {
        const selected = avatar.id === value;
        return (
          <button
            key={avatar.id}
            type="button"
            className={selected ? styles.optionCardSelected : styles.optionCard}
            onClick={() => onChange?.(avatar.id)}
            title={avatar.label}
          >
            <img src={avatar.src} alt={avatar.label} className={styles.optionAvatar} loading="lazy" />
            <span>{avatar.label}</span>
          </button>
        );
      })}
    </div>
  );
}
