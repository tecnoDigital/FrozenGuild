import { ActionBanner } from "../actions/ActionBanner.js";
import { IceGrid } from "../board/IceGrid.js";
import type { IceGridCardView } from "../../view-model/iceGridView.js";

type CenterBoardStageProps = {
  title: string;
  detail: string;
  cards: IceGridCardView[];
};

export function CenterBoardStage({ title, detail, cards }: CenterBoardStageProps) {
  return (
    <div>
      <ActionBanner title={title} detail={detail} />
      <div style={{ marginTop: 12 }}>
        <IceGrid cards={cards} />
      </div>
    </div>
  );
}
