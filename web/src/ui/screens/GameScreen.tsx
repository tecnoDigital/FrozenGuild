import { Profiler, useEffect, useState } from "react";
import type { FinalResults } from "../../../../shared/game/types.js";
import { GameShell } from "../layout/GameShell.js";
import {
  CenterActionDockContainer,
  LeftStatusRailContainer,
  LocalHandContainer,
  RivalsLedgerContainer,
  useMobileActionFlow,
  RightLedgerRailContainer
} from "./GameScreenContainers.js";
import { BoardContainer } from "../../features/board/ui/BoardContainer.js";
import { useRenderProfiling } from "./useRenderProfiling.js";
import { MobileGameShell } from "../mobile/MobileGameShell.js";
import { FinalResultsOverlay } from "./FinalResultsOverlay.js";

type GameScreenProps = {
  finalResults: FinalResults | null;
  gameOver: boolean;
  onReturnToLobby: () => void;
  onRollDice: () => void;
  onFishFromIce: (slot: number) => void;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  onEndTurn: () => void;
  onSwapCards: (source: { area: "ice_grid"; slot: number } | { area: "player_zone"; playerID: string; index: number }, target: { area: "ice_grid"; slot: number } | { area: "player_zone"; playerID: string; index: number }) => void;
  onResolveOrca: (targetCardID: string) => void;
  onResolveSealBomb: (targetCardIDs: string[]) => void;
  onSpyOnIce: (slots: number[]) => void;
  onSpyGiveCard: (slot: number, targetPlayerID: string) => void;
  onCompleteSpy: () => void;
};

export function GameScreen({ finalResults, gameOver, onReturnToLobby, onRollDice, onFishFromIce, onChoosePadrinoAction, onEndTurn, onSwapCards, onResolveOrca, onResolveSealBomb, onSpyOnIce, onSpyGiveCard, onCompleteSpy }: GameScreenProps) {
  const onRender = useRenderProfiling();
  const flow = useMobileActionFlow();
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 900 : false));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia("(max-width: 899px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const centerBoard = (
    <Profiler id="BoardContainer" onRender={onRender}>
      <BoardContainer onFishFromIce={onFishFromIce} />
    </Profiler>
  );

  const actionsDock = (
    <Profiler id="CenterActionDock" onRender={onRender}>
      <CenterActionDockContainer
        onRollDice={onRollDice}
        onChoosePadrinoAction={onChoosePadrinoAction}
        onEndTurn={onEndTurn}
        onSwapCards={onSwapCards}
        onResolveOrca={onResolveOrca}
        onResolveSealBomb={onResolveSealBomb}
        onSpyOnIce={onSpyOnIce}
        onSpyGiveCard={onSpyGiveCard}
        onCompleteSpy={onCompleteSpy}
      />
    </Profiler>
  );

  const shouldShowResults = gameOver && finalResults?.players.length;

  if (isMobile) {
    return (
      <>
        <MobileGameShell
          flow={flow}
          board={centerBoard}
          summary={
            <Profiler id="LeftStatusRail" onRender={onRender}>
              <LeftStatusRailContainer />
            </Profiler>
          }
          actions={actionsDock}
          hand={
            <Profiler id="LocalHand" onRender={onRender}>
              <LocalHandContainer />
            </Profiler>
          }
          rivals={
            <Profiler id="RivalsLedger" onRender={onRender}>
              <RivalsLedgerContainer />
            </Profiler>
          }
        />
        {shouldShowResults ? (
          <FinalResultsOverlay finalResults={finalResults} onReturnToLobby={onReturnToLobby} />
        ) : null}
      </>
    );
  }

  return (
    <>
      <GameShell
        left={
          <Profiler id="LeftStatusRail" onRender={onRender}>
            <LeftStatusRailContainer />
          </Profiler>
        }
        center={centerBoard}
        actions={actionsDock}
        hand={
          <Profiler id="LocalHand" onRender={onRender}>
            <LocalHandContainer />
          </Profiler>
        }
        right={
          <Profiler id="RightLedgerRail" onRender={onRender}>
            <RightLedgerRailContainer />
          </Profiler>
        }
      />
      {shouldShowResults ? (
        <FinalResultsOverlay finalResults={finalResults} onReturnToLobby={onReturnToLobby} />
      ) : null}
    </>
  );
}
