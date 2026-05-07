import type { CSSProperties, PointerEvent } from "react";
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
  "--fg-stage-parallax-x"?: string;
  "--fg-stage-parallax-y"?: string;
};

function handleBoardPointerMove(event: PointerEvent<HTMLDivElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;

  event.currentTarget.style.setProperty("--fg-stage-parallax-x", `${(x * 10).toFixed(2)}px`);
  event.currentTarget.style.setProperty("--fg-stage-parallax-y", `${(y * 8).toFixed(2)}px`);
}

function handleBoardPointerLeave(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty("--fg-stage-parallax-x", "0px");
  event.currentTarget.style.setProperty("--fg-stage-parallax-y", "0px");
}

export function CenterBoardStage({ title, detail, severity = "neutral", mode = "waiting", cards, clickableSlots = [], selectedSlots = [], onSlotClick, gameOverOverlay = null }: CenterBoardStageProps) {
  void title;
  void detail;
  void severity;
  void mode;

  const boardStyle: BoardStageStyle = {
    "--fg-board-backdrop": `url(${assets.backgrounds.iceTableCenter})`,
    "--fg-stage-parallax-x": "0px",
    "--fg-stage-parallax-y": "0px"
  };

  return (
    <div className={styles.stage}>
      <div className={styles.boardFrame} style={boardStyle} onPointerMove={handleBoardPointerMove} onPointerLeave={handleBoardPointerLeave}>
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
