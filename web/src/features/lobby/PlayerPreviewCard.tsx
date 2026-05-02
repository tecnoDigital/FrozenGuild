import type { LobbyAvatarID, LobbyColorID } from "./lobbyStore";
import { resolveLobbyAvatarSrc, resolveLobbyColorValue } from "./lobbyStore";
import styles from "./LobbyVisual.module.css";

type PlayerPreviewCardProps = {
  name: string;
  avatarID: LobbyAvatarID;
  colorID: LobbyColorID;
};

export function PlayerPreviewCard({ name, avatarID, colorID }: PlayerPreviewCardProps) {
  const colorValue = resolveLobbyColorValue(colorID);
  return (
    <section className={styles.previewCard} data-testid="lobby-player-preview-card">
      <img src={resolveLobbyAvatarSrc(avatarID)} alt="Avatar seleccionado" className={styles.previewAvatar} loading="lazy" />
      <div>
        <p className={styles.previewName}>{name.trim() || "Jugador"}</p>
        <p className={styles.previewMeta}>Color</p>
      </div>
      <span className={styles.previewColor} style={{ background: colorValue }} aria-hidden="true" />
    </section>
  );
}
