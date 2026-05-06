import { useEffect, useMemo, useState } from "react";
import type { SwapLocation } from "../../../../shared/game/types.js";
import { useFrozenGuildStore } from "../../store/frozenGuildStore.js";
import {
  selectActionFlowView,
  selectCanChoosePadrino,
  selectCurrentTurnLabel,
  selectDeckCount,
  selectDiscardCount,
  selectGameOverOverlayView,
  selectLocalPlayerName,
  selectOrcaResolutionView,
  selectSealBombResolutionView,
  selectSpyResolutionView,
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
import { LocalPlayerHandPanel } from "../players/LocalPlayerHandPanel.js";
import {
  resolveLobbyAvatarSrc,
  resolveLobbyColorValue,
  selectLobbyAvatar,
  selectLobbyColor,
  useLobbyProfileStore
} from "../../features/lobby/lobbyStore.js";
import { assets } from "../../ui/assets.js";

export function LeftStatusRailContainer() {
  const playerName = useFrozenGuildStore(selectLocalPlayerName);
  const turnLabel = useFrozenGuildStore(selectCurrentTurnLabel);
  const deckCount = useFrozenGuildStore(selectDeckCount);
  const discardCount = useFrozenGuildStore(selectDiscardCount);
  const tableActive = useFrozenGuildStore(selectTableActive);
  const lobbyAvatar = useLobbyProfileStore(selectLobbyAvatar);
  const lobbyColor = useLobbyProfileStore(selectLobbyColor);

  return (
    <LeftStatusRail
      playerName={playerName}
      playerAvatarSrc={resolveLobbyAvatarSrc(lobbyAvatar)}
      playerColorValue={resolveLobbyColorValue(lobbyColor)}
      turnLabel={turnLabel}
      deckCount={deckCount}
      discardCount={discardCount}
      tableStatus={tableActive ? "activa" : "pausada"}
    />
  );
}

export function CenterBoardStageContainer({ onFishFromIce }: { onFishFromIce: (slot: number) => void }) {
  const actionView = useFrozenGuildStore(selectActionBannerView);
  const flow = useFrozenGuildStore(selectActionFlowView);
  const iceCards = useFrozenGuildStore(selectIceGridCardsView);
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
const canFish = useFrozenGuildStore((state) => {
    if (!state.G || !state.ctx || !state.localPlayerID) return false;
    if (state.gameover !== undefined) return false;
    const isMyTurn = state.ctx.currentPlayer === state.localPlayerID;
    if (!isMyTurn || state.G.turn.actionCompleted) return false;
    const effectiveValue = state.G.dice.value === 6 ? state.G.turn.padrinoAction : state.G.dice.value;
    return state.G.dice.rolled && effectiveValue !== null && effectiveValue >= 1 && effectiveValue <= 3;
  });

  return (
    <CenterBoardStage
      title={actionView.title}
      detail={actionView.detail}
      severity={actionView.severity}
      mode={flow.mode}
      cards={iceCards}
      clickableSlots={
        canFish
          ? iceCards.map((card, index) => (card.empty ? -1 : index)).filter((slot) => slot >= 0)
          : flow.mode === "swap"
            ? iceCards.map((card, index) => (card.empty ? -1 : index)).filter((slot) => slot >= 0)
          : flow.mode === "spy" && spy
            ? (spy.active ? spy.revealedSlots : spy.availableSlots)
            : []
      }
      selectedSlots={
        flow.mode === "swap"
          ? [swapSourceKey, swapTargetKey]
              .filter((value) => value.startsWith("ice:"))
              .map((value) => Number(value.split(":")[1]))
              .filter((value) => Number.isInteger(value) && value >= 0)
          : flow.mode === "spy" && spy
          ? (spy.active ? (spyDraftGiftSlot !== null ? [spyDraftGiftSlot] : []) : spyDraftSlots)
          : []
      }
      onSlotClick={(slot) => {
        if (canFish) {
          onFishFromIce(slot);
          return;
        }
        if (flow.mode === "swap") {
          const slotKey = `ice:${slot}`;
          if (!swapSourceKey || swapSourceKey === slotKey) {
            setSwapSourceKey(slotKey);
            if (swapTargetKey === slotKey) {
              setSwapTargetKey("");
            }
            return;
          }
          if (!swapTargetKey || swapTargetKey === slotKey) {
            setSwapTargetKey(slotKey);
            return;
          }
          setSwapSourceKey(slotKey);
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
      }}
      gameOverOverlay={gameOverOverlay}
    />
  );
}

export function useMobileActionFlow() {
  return useFrozenGuildStore(selectActionFlowView);
}

type CenterActionDockContainerProps = {
  onRollDice: () => void;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  onEndTurn: () => void;
  onSwapCards: (source: SwapLocation, target: SwapLocation) => void;
  onResolveOrca: (targetCardID: string) => void;
  onResolveSealBomb: (targetCardIDs: string[]) => void;
  onSpyOnIce: (slots: number[]) => void;
  onSpyGiveCard: (slot: number, targetPlayerID: string) => void;
  onCompleteSpy: () => void;
};

export function CenterActionDockContainer({
  onRollDice,
  onChoosePadrinoAction,
  onEndTurn,
  onSwapCards,
  onResolveOrca,
  onResolveSealBomb,
  onSpyOnIce,
  onSpyGiveCard,
  onCompleteSpy
}: CenterActionDockContainerProps) {
  const flow = useFrozenGuildStore(selectActionFlowView);
  const diceRolled = useFrozenGuildStore((state) => !!state.G?.dice.rolled);
  const diceValue = useFrozenGuildStore((state) => state.G?.dice.value ?? null);
  const diceDisabled = !flow.canRoll;
  const canChoosePadrino = useFrozenGuildStore(selectCanChoosePadrino);
  const localPlayerID = useFrozenGuildStore((state) => state.localPlayerID);
  const iceGrid = useFrozenGuildStore((state) => state.G?.iceGrid ?? null);
  const playersMap = useFrozenGuildStore((state) => state.G?.players ?? null);
  const swapOptions = useMemo(() => {
    if (!iceGrid || !playersMap) {
      return [] as Array<{ key: string; label: string; location: SwapLocation }>;
    }

    const options: Array<{ key: string; label: string; location: SwapLocation }> = [];

    iceGrid.forEach((slot, index) => {
      if (typeof slot === "string") {
        options.push({ key: `ice:${index}`, label: `Hielo ${index + 1}`, location: { area: "ice_grid", slot: index } });
      }
    });

    Object.entries(playersMap).forEach(([playerID, player]) => {
      player.zone.forEach((cardID, index) => {
        options.push({
          key: `player:${playerID}:${index}`,
          label: `${player.name} · ${cardID}`,
          location: { area: "player_zone", playerID, index }
        });
      });
    });

    return options;
  }, [iceGrid, playersMap]);
  const orca = useFrozenGuildStore(selectOrcaResolutionView);
  const seal = useFrozenGuildStore(selectSealBombResolutionView);
  const spy = useFrozenGuildStore(selectSpyResolutionView);

  const [swapSource, setSwapSource] = useState<SwapLocation | null>(null);
  const [swapTarget, setSwapTarget] = useState<SwapLocation | null>(null);
  const swapSourceKey = useFrozenGuildStore((state) => state.swapDraftSourceKey);
  const swapTargetKey = useFrozenGuildStore((state) => state.swapDraftTargetKey);
  const setSwapSourceKey = useFrozenGuildStore((state) => state.setSwapDraftSourceKey);
  const setSwapTargetKey = useFrozenGuildStore((state) => state.setSwapDraftTargetKey);
  const clearSwapDraft = useFrozenGuildStore((state) => state.clearSwapDraft);
  const [orcaTarget, setOrcaTarget] = useState<string | null>(null);
  const [sealTargets, setSealTargets] = useState<string[]>([]);
  const spySlots = useFrozenGuildStore((state) => state.spyDraftSlots);
  const spyGiftSlot = useFrozenGuildStore((state) => state.spyDraftGiftSlot);
  const toggleSpyDraftSlot = useFrozenGuildStore((state) => state.toggleSpyDraftSlot);
  const setSpyDraftGiftSlot = useFrozenGuildStore((state) => state.setSpyDraftGiftSlot);
  const clearSpyDraft = useFrozenGuildStore((state) => state.clearSpyDraft);
  const [spyGiftTarget, setSpyGiftTarget] = useState("");

  useEffect(() => {
    if (flow.mode !== "swap") {
      setSwapSource(null);
      setSwapTarget(null);
      clearSwapDraft();
    }
    if (flow.mode !== "orca") {
      setOrcaTarget(null);
    }
    if (flow.mode !== "seal") {
      setSealTargets([]);
    }
    if (flow.mode !== "spy") {
      clearSpyDraft();
    }
  }, [clearSpyDraft, clearSwapDraft, flow.mode]);

  useEffect(() => {
    if (!spy || spy.targetPlayerIDs.length === 0) {
      setSpyGiftTarget("");
      return;
    }
    if (!spy.targetPlayerIDs.includes(spyGiftTarget)) {
      const first = spy.targetPlayerIDs[0];
      if (first) {
        setSpyGiftTarget(first);
      }
    }
  }, [spy, spyGiftTarget]);

  useEffect(() => {
    if (!swapSourceKey) {
      setSwapSource(null);
      return;
    }
    const option = swapOptions.find((item) => item.key === swapSourceKey);
    setSwapSource(option ? option.location : null);
  }, [swapOptions, swapSourceKey]);

  useEffect(() => {
    if (!swapTargetKey) {
      setSwapTarget(null);
      return;
    }
    const option = swapOptions.find((item) => item.key === swapTargetKey);
    setSwapTarget(option ? option.location : null);
  }, [swapOptions, swapTargetKey]);

  useEffect(() => {
    if (!swapSourceKey && swapOptions.length > 0 && flow.mode === "swap") {
      const best = swapOptions.find((item) => item.key.startsWith(`player:${localPlayerID}:`)) ?? swapOptions[0];
      if (best) {
        setSwapSourceKey(best.key);
      }
    }
  }, [flow.mode, localPlayerID, swapOptions, swapSourceKey]);

  const swapCanConfirm = !!(swapSource && swapTarget);
  const swapHelperText = swapCanConfirm
    ? "Listo para confirmar intercambio."
    : "Selecciona origen y destino para intercambiar.";

  const onToggleSealTarget = (cardID: string) => {
    setSealTargets((current) => {
      if (current.includes(cardID)) {
        return current.filter((value) => value !== cardID);
      }
      return [...current, cardID];
    });
  };

  return (
    <CenterActionDock
      rolled={diceRolled}
      value={diceValue}
      disabled={diceDisabled}
      onRoll={onRollDice}
      flow={flow}
      onChoosePadrinoAction={onChoosePadrinoAction}
      onEndTurn={onEndTurn}
      swap={{
        source: swapSource,
        target: swapTarget,
        canConfirm: swapCanConfirm,
        helperText: canChoosePadrino ? "" : swapHelperText,
        sourceKey: swapSourceKey,
        targetKey: swapTargetKey,
        options: swapOptions,
        onSourceKeyChange: setSwapSourceKey,
        onTargetKeyChange: setSwapTargetKey,
        onConfirm: () => {
          if (swapSource && swapTarget) {
            onSwapCards(swapSource, swapTarget);
            setSwapSource(null);
            setSwapTarget(null);
            clearSwapDraft();
          }
        },
        onClearSelection: () => {
          setSwapSource(null);
          setSwapTarget(null);
          clearSwapDraft();
        }
      }}
      orca={orca ? {
        validTargetCardIDs: orca.validTargetCardIDs,
        selectedCardID: orcaTarget,
        onSelectCardID: setOrcaTarget,
        onResolve: () => {
          const state = useFrozenGuildStore.getState();
          const pending = state.G?.orcaResolution;
          const localPlayerID = state.localPlayerID;

          if (
            orcaTarget
            && pending
            && !!localPlayerID
            && pending.playerID === localPlayerID
            && pending.validTargetCardIDs.includes(orcaTarget)
          ) {
            onResolveOrca(orcaTarget);
            setOrcaTarget(null);
          }
        }
      } : null}
      seal={seal ? {
        validTargetCardIDs: seal.validTargetCardIDs,
        selectedCardIDs: sealTargets,
        requiredDiscardCount: seal.requiredDiscardCount,
        onToggleCardID: onToggleSealTarget,
        onResolve: () => {
          const state = useFrozenGuildStore.getState();
          const pending = state.G?.sealBombResolution;
          const localPlayerID = state.localPlayerID;
          const isValidSelection =
            !!pending
            && !!localPlayerID
            && pending.playerID === localPlayerID
            && sealTargets.length === pending.requiredDiscardCount
            && new Set(sealTargets).size === sealTargets.length
            && sealTargets.every((cardID) => pending.validTargetCardIDs.includes(cardID));

          if (isValidSelection) {
            onResolveSealBomb(sealTargets);
            setSealTargets([]);
          }
        }
      } : null}
      spy={spy ? {
        active: spy.active,
        selectedSlots: spySlots,
        availableSlots: spy.availableSlots,
        revealedSlots: spy.revealedSlots,
        selectedGiftSlot: spyGiftSlot,
        targetPlayerID: spyGiftTarget,
        targetPlayerIDs: spy.targetPlayerIDs,
        onToggleSlot: toggleSpyDraftSlot,
        onSelectGiftSlot: setSpyDraftGiftSlot,
        onTargetPlayerChange: setSpyGiftTarget,
        onConfirmSpy: () => {
          if (spySlots.length > 0) {
            onSpyOnIce(spySlots);
            clearSpyDraft();
          }
        },
        onGiveCard: () => {
          if (spyGiftSlot !== null && spyGiftTarget) {
            onSpyGiveCard(spyGiftSlot, spyGiftTarget);
            setSpyDraftGiftSlot(null);
          }
        },
        onCompleteSpy: () => {
          onCompleteSpy();
          setSpyDraftGiftSlot(null);
        }
      } : null}
    />
  );
}

export function RightLedgerRailContainer() {
  const players = useFrozenGuildStore(selectPlayersLedger);
  const unstablePlayers = useFrozenGuildStore(selectUnstablePlayers);
  const localPlayerID = useFrozenGuildStore((state) => state.localPlayerID);
  const currentTurnPlayerID = useFrozenGuildStore((state) => state.ctx?.currentPlayer ?? null);
  const flow = useFrozenGuildStore(selectActionFlowView);
  const swapSourceKey = useFrozenGuildStore((state) => state.swapDraftSourceKey);
  const swapTargetKey = useFrozenGuildStore((state) => state.swapDraftTargetKey);
  const setSwapSourceKey = useFrozenGuildStore((state) => state.setSwapDraftSourceKey);
  const setSwapTargetKey = useFrozenGuildStore((state) => state.setSwapDraftTargetKey);

  const clickableCardsByPlayerID: Record<string, number[]> = {};
  const selectedCardsByPlayerID: Record<string, number[]> = {};

  const rivals = players.filter((player) => player.id !== localPlayerID);

  if (flow.mode === "swap") {
    rivals.forEach((player) => {
      clickableCardsByPlayerID[player.id] = player.cardIDs.map((_, index) => index);
    });

    [swapSourceKey, swapTargetKey].forEach((value) => {
      if (!value.startsWith("player:")) {
        return;
      }
      const [, playerID, indexRaw] = value.split(":");
      const index = Number(indexRaw);
      if (!playerID || !Number.isInteger(index) || index < 0) {
        return;
      }
      selectedCardsByPlayerID[playerID] = [...(selectedCardsByPlayerID[playerID] ?? []), index];
    });
  }

  const onPlayerCardClick = (playerID: string, index: number) => {
    if (flow.mode !== "swap") {
      return;
    }
    const nextKey = `player:${playerID}:${index}`;
    if (!swapSourceKey || swapSourceKey === nextKey) {
      setSwapSourceKey(nextKey);
      if (swapTargetKey === nextKey) {
        setSwapTargetKey("");
      }
      return;
    }
    if (!swapTargetKey || swapTargetKey === nextKey) {
      setSwapTargetKey(nextKey);
      return;
    }
    setSwapSourceKey(nextKey);
    setSwapTargetKey("");
  };

  return (
    <RightLedgerRail
      players={rivals.map((player) => ({
        ...player,
        isLocalPlayer: false,
        isActiveTurn: currentTurnPlayerID === player.id
      }))}
      unstablePlayers={unstablePlayers.filter((player) => player.id !== localPlayerID)}
      clickableCardsByPlayerID={clickableCardsByPlayerID}
      selectedCardsByPlayerID={selectedCardsByPlayerID}
      onPlayerCardClick={onPlayerCardClick}
    />
  );
}

export function LocalHandContainer() {
  const players = useFrozenGuildStore(selectPlayersLedger);
  const localPlayerID = useFrozenGuildStore((state) => state.localPlayerID);
  const flow = useFrozenGuildStore(selectActionFlowView);
  const swapSourceKey = useFrozenGuildStore((state) => state.swapDraftSourceKey);
  const swapTargetKey = useFrozenGuildStore((state) => state.swapDraftTargetKey);
  const setSwapSourceKey = useFrozenGuildStore((state) => state.setSwapDraftSourceKey);
  const setSwapTargetKey = useFrozenGuildStore((state) => state.setSwapDraftTargetKey);

  const local = players.find((player) => player.id === localPlayerID) ?? null;

  if (!local) {
    return <p>Sin mano local.</p>;
  }

  const clickableCardIndexes = flow.mode === "swap" ? local.cardIDs.map((_, index) => index) : [];
  const selectedCardIndexes: number[] = [];

  [swapSourceKey, swapTargetKey].forEach((value) => {
    if (!value.startsWith(`player:${local.id}:`)) {
      return;
    }
    const index = Number(value.split(":")[2]);
    if (Number.isInteger(index) && index >= 0) {
      selectedCardIndexes.push(index);
    }
  });

  const onLocalCardClick = (index: number) => {
    if (flow.mode !== "swap") {
      return;
    }
    const nextKey = `player:${local.id}:${index}`;
    if (!swapSourceKey || swapSourceKey === nextKey) {
      setSwapSourceKey(nextKey);
      if (swapTargetKey === nextKey) {
        setSwapTargetKey("");
      }
      return;
    }
    if (!swapTargetKey || swapTargetKey === nextKey) {
      setSwapTargetKey(nextKey);
      return;
    }
    setSwapSourceKey(nextKey);
    setSwapTargetKey("");
  };

  return (
    <LocalPlayerHandPanel
      playerName={local.name}
      score={local.score}
      cardIDs={local.cardIDs}
      clickableCardIndexes={clickableCardIndexes}
      selectedCardIndexes={selectedCardIndexes}
      onCardClick={onLocalCardClick}
    />
  );
}

const ledgerAvatarFallbacks = [
  assets.characters.avatars.penguin2,
  assets.characters.avatars.walrus,
  assets.characters.avatars.petrel,
  assets.characters.avatars.seaElephant,
  assets.characters.avatars.orca,
  assets.characters.avatars.sealBomb
];

export function RivalsLedgerContainer() {
  const players = useFrozenGuildStore(selectPlayersLedger);
  const unstablePlayers = useFrozenGuildStore(selectUnstablePlayers);
  const localPlayerID = useFrozenGuildStore((state) => state.localPlayerID);
  const currentTurnPlayerID = useFrozenGuildStore((state) => state.ctx?.currentPlayer ?? null);
  const lobbyAvatar = useLobbyProfileStore(selectLobbyAvatar);
  const lobbyAvatarSrc = resolveLobbyAvatarSrc(lobbyAvatar);

  let fallbackIndex = 0;

  return (
    <RightLedgerRail
      players={players.map((player) => {
        const isLocal = player.id === localPlayerID;
        const avatarSrc = isLocal
          ? lobbyAvatarSrc
          : (ledgerAvatarFallbacks[fallbackIndex % ledgerAvatarFallbacks.length] ?? assets.characters.avatars.penguin2);
        if (!isLocal) {
          fallbackIndex += 1;
        }
        return {
          ...player,
          isActiveTurn: currentTurnPlayerID === player.id,
          isLocalPlayer: isLocal,
          avatarSrc
        };
      })}
      unstablePlayers={unstablePlayers}
    />
  );
}
