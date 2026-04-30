import { Profiler } from "react";
import { GameShell } from "../layout/GameShell.js";
import {
  CenterActionDockContainer,
  CenterBoardStageContainer,
  LeftStatusRailContainer,
  RightLedgerRailContainer
} from "./GameScreenContainers.js";
import { useRenderProfiling } from "./useRenderProfiling.js";

type GameScreenProps = {
  onRollDice: () => void;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
};

export function GameScreen({ onRollDice, onChoosePadrinoAction }: GameScreenProps) {
  const onRender = useRenderProfiling();

  return (
    <GameShell
      left={
        <Profiler id="LeftStatusRail" onRender={onRender}>
          <LeftStatusRailContainer />
        </Profiler>
      }
      center={
        <Profiler id="CenterBoardStage" onRender={onRender}>
          <CenterBoardStageContainer />
        </Profiler>
      }
      actions={
        <Profiler id="CenterActionDock" onRender={onRender}>
          <CenterActionDockContainer
            onRollDice={onRollDice}
            onChoosePadrinoAction={onChoosePadrinoAction}
          />
        </Profiler>
      }
      right={
        <Profiler id="RightLedgerRail" onRender={onRender}>
          <RightLedgerRailContainer />
        </Profiler>
      }
    />
  );
}
