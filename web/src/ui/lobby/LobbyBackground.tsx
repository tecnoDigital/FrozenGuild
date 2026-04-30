import styles from "./Lobby.module.css";
import type { CSSProperties } from "react";
import lobbyBackground from "../../assets/Lobby-background.png";

export function LobbyBackground() {
  return <div className={styles.bg} style={{ "--lobby-bg-image": `url(${lobbyBackground})` } as CSSProperties} aria-hidden />;
}
