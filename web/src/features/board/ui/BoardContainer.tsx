import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFrozenGuildStore } from "../../../store/frozenGuildStore.js";
import {
  selectActionBannerView,
  selectActionFlowView,
  selectSpyResolutionView,
  selectGameOverOverlayView
} from "../../../store/selectors.js";
import { selectBoardCardsView } from "../../../view-model/boardView.js";
import { BoardSurface } from "./BoardSurface.js";
import { FrozenIceGrid } from "./FrozenIceGrid.js";
import styles from "./FrozenIceGrid.module.css";

export type BoardContainerProps = {
  onFishFromIce: (slot: number) => void;
  overlayBanner?: ReactNode;
};

export function BoardContainer({ onFishFromIce, overlayBanner }: BoardContainerProps) {
  const actionView = useFrozenGuildStore(selectActionBannerView);
  const flow = useFrozenGuildStore(selectActionFlowView);
  const iceCards = useFrozenGuildStore(selectBoardCardsView);
  const spy = useFrozenGuildStore(selectSpyResolutionView);
  const gameOverOverlay = useFrozenGuildStore(selectGameOverOverlayView);
  const spyDraftSlots = useFrozenGuildStore((state) => state.spyDraftSlots);
  const spyDraftGiftSlot = useFrozenGuildStore((state) => state.spyDraftGiftSlot);
  const toggleSpyDraftSlot = useFrozenGuildStore((state) => state.toggleSpyDraftSlot);
  const setSpyDraftGiftSlot = useFrozenGuildStore((state) => state.setSpyDraftGiftSlot);
  const swapSourceKey = useFrozenGuildStore((state) => state.swapDraftSourceKey);
  const swapTargetKey = useFrozenGuildStore((state) => state.swapDraftTargetKey);
  const setSwapSourceKey = useFrozenGuildStore((state) => state.setSwapDraftSourceKey);
  const setSwapTargetKey = useFrozenGuildStore((state) => state.setSwapDraftTargetKey);
  const [pendingFishSlot, setPendingFishSlot] = useState<number | null>(null);

  const canFish = useFrozenGuildStore((state) => {
    if (!state.G || !state.ctx || !state.localPlayerID) return false;
    if (state.gameover !== undefined) return false;
    const isMyTurn = state.ctx.currentPlayer === state.localPlayerID;
    if (!isMyTurn || state.G.turn.actionCompleted) return false;
    const effectiveValue = state.G.dice.value === 6 ? state.G.turn.padrinoAction : state.G.dice.value;
    return state.G.dice.rolled && effectiveValue !== null && effectiveValue >= 1 && effectiveValue <= 3;
  });

  useEffect(() => {
    if (!canFish) {
      setPendingFishSlot(null);
      return;
    }
    if (pendingFishSlot === null) {
      return;
    }
    const pendingCard = iceCards[pendingFishSlot];
    if (!pendingCard || pendingCard.empty) {
      setPendingFishSlot(null);
    }
  }, [canFish, pendingFishSlot, iceCards]);

  const selectableSlots = (() => {
    if (canFish) {
      return iceCards.map((card, index) => (card.empty ? -1 : index)).filter((slot) => slot >= 0 && slot !== pendingFishSlot);
    }
    if (flow.mode === "spy" && spy) {
      return spy.active ? spy.revealedSlots : spy.availableSlots;
    }
    return [];
  })();

  const selectedSlots = (() => {
    if (flow.mode === "swap") {
      return [swapSourceKey, swapTargetKey]
        .filter((value) => value.startsWith("ice:"))
        .map((value) => Number(value.split(":")[1]))
        .filter((value) => Number.isInteger(value) && value >= 0);
    }
    if (flow.mode === "spy" && spy) {
      return spy.active ? (spyDraftGiftSlot !== null ? [spyDraftGiftSlot] : []) : spyDraftSlots;
    }
    return [];
  })();

  const handleSlotClick = (slot: number) => {
    if (canFish) {
      if (pendingFishSlot !== null) {
        return;
      }
      setPendingFishSlot(slot);
      onFishFromIce(slot);
      return;
    }
    if (flow.mode === "swap") {
      const nextKey = `ice:${slot}`;
      if (!swapSourceKey) {
        setSwapSourceKey(nextKey);
        return;
      }
      if (!swapTargetKey) {
        setSwapTargetKey(nextKey);
        return;
      }
      setSwapSourceKey(nextKey);
      setSwapTargetKey("");
      return;
    }
    if (flow.mode === "spy" && spy) {
      if (!spy.active && spy.availableSlots.includes(slot)) {
        toggleSpyDraftSlot(slot);
        return;
      }
      if (spy.active && spy.revealedSlots.includes(slot)) {
        setSpyDraftGiftSlot(slot);
      }
    }
  };

  return (
    <BoardSurface aria-label={actionView.title || "Frozen Guild board grid"}>
      {overlayBanner ? <div className={styles.turnBannerOverlay}>{overlayBanner}</div> : null}
      <FrozenIceGrid
        cards={iceCards}
        selectableSlots={selectableSlots}
        selectedSlots={selectedSlots}
        onSlotClick={handleSlotClick}
      />
      {gameOverOverlay ? (
        <div className={styles.gameOverOverlay} role="dialog" aria-label="Game over">
          <div className={styles.gameOverOverlayCard}>
            <strong className={styles.gameOverOverlayTitle}>{gameOverOverlay.title}</strong>
            <span className={styles.gameOverOverlayDetail}>{gameOverOverlay.detail}</span>
          </div>
        </div>
      ) : null}
    </BoardSurface>
  );
}
