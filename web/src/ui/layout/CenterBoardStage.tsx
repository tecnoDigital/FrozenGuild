import type { CSSProperties } from "react";
import { IceGrid } from "../board/IceGrid.js";
import type { IceGridCardView } from "../../view-model/iceGridView.js";
import { assets } from "../assets.js";
import styles from "./CenterBoardStage.module.css";

type CenterBoardStageProps = {
  title: string;
  detail: string;
  severity?: "neutral" | "your-turn" | "blocked" | "danger" | "success";
  mode?: "waiting" | "roll" | "fish" | "spy" | "swap" | "padrino" | "orca" | "seal" | "done";
  cards: IceGridCardView[];
  clickableSlots?: number[];
  selectedSlots?: number[];
  onSlotClick?: (slot: number) => void;
  gameOverOverlay?: {
    title: string;
    detail: string;
  } | null;
};

type BoardStageStyle = CSSProperties & {
  "--fg-board-backdrop": string;
};

export function CenterBoardStage({ title, detail, severity = "neutral", mode = "waiting", cards, clickableSlots = [], selectedSlots = [], onSlotClick, gameOverOverlay = null }: CenterBoardStageProps) {
  void title;
  void detail;
  void severity;
  void mode;

  const boardStyle: BoardStageStyle = {
    "--fg-board-backdrop": `url(${assets.backgrounds.iceTableCenter})`
  };

  return (
    <div className={styles.stage}>
      <div className={styles.boardFrame} style={boardStyle}>
        <div className={styles.boardBackdrop} aria-hidden="true" />
        <IceGrid cards={cards} clickableSlots={clickableSlots} selectedSlots={selectedSlots} {...(onSlotClick ? { onSlotClick } : {})} />
        {gameOverOverlay ? (
          <div className={styles.localOverlay}>
            <div className={styles.localOverlayCard}>
              <strong className={styles.localOverlayTitle}>{gameOverOverlay.title}</strong>
              <span className={styles.localOverlayDetail}>{gameOverOverlay.detail}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
