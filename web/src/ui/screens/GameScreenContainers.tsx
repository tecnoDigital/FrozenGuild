import { useFrozenGuildStore } from "../../store/frozenGuildStore.js";
import {
  selectCanChoosePadrino,
  selectCurrentTurnLabel,
  selectDeckCount,
  selectDiscardCount,
  selectLocalPlayerName,
  selectTableActive,
  selectActionBannerView,
  selectPlayersLedger,
  selectUnstablePlayers
} from "../../store/selectors.js";
import { selectIceGridCardsView } from "../../view-model/iceGridView.js";
import { CenterActionDock } from "../layout/CenterActionDock.js";
import { CenterBoardStage } from "../layout/CenterBoardStage.js";
import { LeftStatusRail } from "../layout/LeftStatusRail.js";
import { RightLedgerRail } from "../layout/RightLedgerRail.js";

export function LeftStatusRailContainer() {
  const playerName = useFrozenGuildStore(selectLocalPlayerName);
  const turnLabel = useFrozenGuildStore(selectCurrentTurnLabel);
  const deckCount = useFrozenGuildStore(selectDeckCount);
  const discardCount = useFrozenGuildStore(selectDiscardCount);
  const tableActive = useFrozenGuildStore(selectTableActive);

  return (
    <LeftStatusRail
      playerName={playerName}
      turnLabel={turnLabel}
      deckCount={deckCount}
      discardCount={discardCount}
      tableStatus={tableActive ? "activa" : "pausada"}
    />
  );
}

export function CenterBoardStageContainer() {
  const actionView = useFrozenGuildStore(selectActionBannerView);
  const iceCards = useFrozenGuildStore(selectIceGridCardsView);

  return <CenterBoardStage title={actionView.title} detail={actionView.detail} cards={iceCards} />;
}

type CenterActionDockContainerProps = {
  onRollDice: () => void;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
};

export function CenterActionDockContainer({ onRollDice, onChoosePadrinoAction }: CenterActionDockContainerProps) {
  const diceRolled = useFrozenGuildStore((state) => !!state.G?.dice.rolled);
  const diceValue = useFrozenGuildStore((state) => state.G?.dice.value ?? null);
  const diceDisabled = useFrozenGuildStore((state) => {
    if (!state.ctx || !state.localPlayerID) {
      return true;
    }
    return state.ctx.currentPlayer !== state.localPlayerID;
  });
  const canChoosePadrino = useFrozenGuildStore(selectCanChoosePadrino);

  return (
    <CenterActionDock
      rolled={diceRolled}
      value={diceValue}
      disabled={diceDisabled}
      onRoll={onRollDice}
      showPadrinoOptions={canChoosePadrino}
      onChoosePadrinoAction={onChoosePadrinoAction}
    />
  );
}

export function RightLedgerRailContainer() {
  const players = useFrozenGuildStore(selectPlayersLedger);
  const unstablePlayers = useFrozenGuildStore(selectUnstablePlayers);

  return <RightLedgerRail players={players} unstablePlayers={unstablePlayers} />;
}
