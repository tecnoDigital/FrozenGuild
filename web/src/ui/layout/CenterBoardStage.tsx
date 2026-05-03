import { ActionBanner } from "../actions/ActionBanner.js";
import { IceGrid } from "../board/IceGrid.js";
import type { IceGridCardView } from "../../view-model/iceGridView.js";

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

export function CenterBoardStage({ title, detail, severity = "neutral", mode = "waiting", cards, clickableSlots = [], selectedSlots = [], onSlotClick, gameOverOverlay = null }: CenterBoardStageProps) {
  return (
    <div>
      <ActionBanner title={title} detail={detail} severity={severity} mode={mode} />
      <div style={{ marginTop: 12, position: "relative" }}>
        <IceGrid cards={cards} clickableSlots={clickableSlots} selectedSlots={selectedSlots} {...(onSlotClick ? { onSlotClick } : {})} />
        {gameOverOverlay ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(7, 16, 32, 0.72)",
              borderRadius: 12,
              pointerEvents: "none",
              textAlign: "center",
              padding: 16
            }}
          >
            <div
              style={{
                background: "rgba(12, 22, 40, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: 12,
                padding: "14px 16px",
                maxWidth: 320
              }}
            >
              <strong style={{ display: "block", fontSize: 16 }}>{gameOverOverlay.title}</strong>
              <span style={{ display: "block", marginTop: 6, opacity: 0.92 }}>{gameOverOverlay.detail}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
