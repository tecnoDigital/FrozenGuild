import { useEffect, useRef, useState } from "react";
import styles from "./LobbyGlass.module.css";
import type { LobbyAvatarID, LobbyColorID } from "../../features/lobby/lobbyStore.js";
import { lobbyAvatarOptions, lobbyColorOptions, resolveLobbyAvatarSrc } from "../../features/lobby/lobbyStore.js";

const AVATAR_PAGE_SIZE = 6;
const NAME_DEBOUNCE_MS = 120;

type PlayerProfilePanelProps = {
  playerName: string;
  avatarID: LobbyAvatarID;
  colorID: LobbyColorID;
  onPlayerNameChange?: ((value: string) => void) | undefined;
  onAvatarChange?: ((avatarID: LobbyAvatarID) => void) | undefined;
  onColorChange?: ((colorID: LobbyColorID) => void) | undefined;
};

export function PlayerProfilePanel({
  playerName,
  avatarID,
  colorID,
  onPlayerNameChange,
  onAvatarChange,
  onColorChange,
}: PlayerProfilePanelProps) {
  const [avatarPage, setAvatarPage] = useState(0);
  const [localName, setLocalName] = useState(playerName);
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedAvatar = lobbyAvatarOptions.find((avatar) => avatar.id === avatarID) ?? lobbyAvatarOptions[0];
  const selectedColor = lobbyColorOptions.find((color) => color.id === colorID) ?? lobbyColorOptions[0];
  const previewName = localName.trim() || "Nickname";
  const totalAvatarPages = Math.max(1, Math.ceil(lobbyAvatarOptions.length / AVATAR_PAGE_SIZE));
  const start = avatarPage * AVATAR_PAGE_SIZE;
  const visibleAvatars = lobbyAvatarOptions.slice(start, start + AVATAR_PAGE_SIZE);

  useEffect(() => {
    setLocalName(playerName);
    if (nameTimerRef.current) {
      clearTimeout(nameTimerRef.current);
      nameTimerRef.current = null;
    }
  }, [playerName]);

  useEffect(() => {
    return () => {
      if (nameTimerRef.current) {
        clearTimeout(nameTimerRef.current);
      }
    };
  }, []);

  const handleNameChange = (value: string) => {
    setLocalName(value);
    if (nameTimerRef.current) {
      clearTimeout(nameTimerRef.current);
    }
    nameTimerRef.current = setTimeout(() => {
      onPlayerNameChange?.(value);
    }, NAME_DEBOUNCE_MS);
  };

  return (
    <section className={`${styles.section} ${styles.profileSection}`} aria-label="Player Profile">
      <div className={styles.profileCompact}>
        <div
          className={styles.avatarCard}
          aria-label={`Selected avatar preview for ${previewName}`}
          style={{ ["--lobby-color" as string]: selectedColor?.value ?? "#63ece3" }}
        >
          <span className={styles.avatarGlow} aria-hidden="true" />
          <img
            className={styles.avatarImage}
            src={selectedAvatar?.src ?? resolveLobbyAvatarSrc(avatarID)}
            alt=""
            draggable={false}
          />
          <span className={styles.avatarName}>{previewName}</span>
        </div>
        <div className={styles.fieldStackCompact}>
          <div>
            <label htmlFor="playerName" className={styles.fieldLabel}>
              Nickname
            </label>
            <input
              id="playerName"
              className={styles.textInput}
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              autoComplete="off"
              maxLength={24}
            />
          </div>
          <div>
            <div className={styles.inlineLabelRow}>
              <span className={styles.fieldLabel}>Character</span>
            </div>

            <div className={styles.avatarRail} role="group" aria-label="Character selector">
              {visibleAvatars.map((avatar) => {
                const active = avatar.id === avatarID;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`${styles.avatarDot} ${active ? styles.avatarDotActive : ""}`}
                    onClick={() => onAvatarChange?.(avatar.id)}
                    aria-pressed={active}
                    title={avatar.label}
                  >
                    <img src={avatar.src} alt="" draggable={false} />
                  </button>
                );
              })}
              <button
                type="button"
                className={styles.avatarPagerDot}
                onClick={() => setAvatarPage((prev) => (prev + 1) % totalAvatarPages)}
                aria-label="Next avatar page"
                title="Next avatars"
                disabled={totalAvatarPages <= 1}
              >
                <span aria-hidden="true">&rsaquo;</span>
              </button>
            </div>
          </div>
          <div>
            <span className={styles.fieldLabel}>Color bar</span>
            <div className={styles.colorBar} role="group" aria-label="Color selector">
              {lobbyColorOptions.map((color) => {
                const active = color.id === colorID;
                return (
                  <button
                    key={color.id}
                    type="button"
                    className={`${styles.colorBarSwatch} ${active ? styles.colorBarSwatchActive : ""}`}
                    onClick={() => onColorChange?.(color.id)}
                    aria-pressed={active}
                    title={color.label}
                    style={{ ["--lobby-color" as string]: color.value }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
