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
};

export function CenterBoardStage({ title, detail, severity = "neutral", mode = "waiting", cards, clickableSlots = [], selectedSlots = [], onSlotClick }: CenterBoardStageProps) {
  return (
    <div>
      <ActionBanner title={title} detail={detail} severity={severity} mode={mode} />
      <div style={{ marginTop: 12 }}>
        <IceGrid cards={cards} clickableSlots={clickableSlots} selectedSlots={selectedSlots} {...(onSlotClick ? { onSlotClick } : {})} />
      </div>
    </div>
  );
}
