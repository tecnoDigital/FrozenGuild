import { useEffect, useMemo, useState } from "react";
import type { SwapLocation } from "../../../../shared/game/types.js";
import { resolvePlayerColorValue } from "../../../../shared/game/playerColors.js";
import { useFrozenGuildStore } from "../../store/frozenGuildStore.js";
import {
  selectIsMyTurn,
  selectActionFlowView,
  selectCanChoosePadrino,
  selectGameOverOverlayView,
  selectOrcaResolutionView,
  selectSealBombResolutionView,
  selectSpyResolutionView,
  selectDeckCount,
  selectDiscardCount,
  selectPlayersLedger,
  selectUnstablePlayers
} from "../../store/selectors.js";
import { FrozenTurnBanner } from "../layout/FrozenTurnBanner.js";
import { CenterActionDock } from "../layout/CenterActionDock.js";
import { LeftStatusRail } from "../layout/LeftStatusRail.js";
import { RightLedgerRail } from "../layout/RightLedgerRail.js";
import { LocalPlayerHandPanel } from "../players/LocalPlayerHandPanel.js";
import {
  resolveLobbyAvatarSrc,
  type LobbyAvatarID,
  selectLobbyAvatar,
  useLobbyProfileStore
} from "../../features/lobby/lobbyStore.js";
import { assets } from "../../ui/assets.js";
import botAvatarSrc from "../../assets/avatars/avatar-bot.png";

type LedgerAvatarPlayer = {
  name: string;
  avatarId?: string;
};

function isBotLedgerPlayer(player: LedgerAvatarPlayer) {
  return player.name.trim().toUpperCase().startsWith("BOT ");
}

function resolveLedgerAvatarSrc(player: LedgerAvatarPlayer, isLocal: boolean, localAvatarSrc: string) {
  if (isBotLedgerPlayer(player)) {
    return botAvatarSrc;
  }

  if (isLocal) {
    return localAvatarSrc;
  }

  return resolveLobbyAvatarSrc(player.avatarId as LobbyAvatarID);
}

export function LeftStatusRailContainer() {
  const deckCount = useFrozenGuildStore(selectDeckCount);
  const discardCount = useFrozenGuildStore(selectDiscardCount);

  return <LeftStatusRail deckCount={deckCount} discardCount={discardCount} cardBackSrc={assets.cards.back} />;
}

export function useMobileActionFlow() {
  return useFrozenGuildStore(selectActionFlowView);
}

export function TurnBannerContainer() {
  const round = useFrozenGuildStore((state) => state.ctx?.turn ?? 1);
  const isMyTurn = useFrozenGuildStore(selectIsMyTurn);

  return <FrozenTurnBanner round={round} isMyTurn={isMyTurn} />;
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
  const playersMap = useFrozenGuildStore((state) => state.G?.players ?? null);
  const swapOptions = useMemo(() => {
    if (!playersMap) {
      return [] as Array<{ key: string; label: string; location: SwapLocation }>;
    }

    const options: Array<{ key: string; label: string; location: SwapLocation }> = [];

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
  }, [playersMap]);
  const swapSourceOptions = useMemo(
    () => swapOptions.filter((item) => item.location.area === "player_zone" && item.location.playerID === localPlayerID),
    [localPlayerID, swapOptions]
  );
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
  const orcaTarget = useFrozenGuildStore((state) => state.orcaDraftCardID);
  const setOrcaTarget = useFrozenGuildStore((state) => state.setOrcaDraftCardID);
  const sealTargets = useFrozenGuildStore((state) => state.sealDraftCardIDs);
  const toggleSealDraftCardID = useFrozenGuildStore((state) => state.toggleSealDraftCardID);
  const clearSealDraft = useFrozenGuildStore((state) => state.clearSealDraft);
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
      clearSealDraft();
    }
    if (flow.mode !== "spy") {
      clearSpyDraft();
    }
  }, [clearSealDraft, clearSpyDraft, clearSwapDraft, flow.mode, setOrcaTarget]);

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

  const swapCanConfirm = !!(
    swapSource
    && swapTarget
    && swapSource.area === "player_zone"
    && swapTarget.area === "player_zone"
    && swapSource.playerID === localPlayerID
    && swapTarget.playerID !== localPlayerID
  );
  const swapHelperText = swapCanConfirm
    ? "Listo para confirmar intercambio."
    : "Selecciona una carta de tu mano como origen y otra de un rival como destino.";

  const onToggleSealTarget = (cardID: string) => {
    toggleSealDraftCardID(cardID, seal?.requiredDiscardCount ?? 1);
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
        onConfirm: () => {
          if (swapCanConfirm && swapSource && swapTarget) {
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
            clearSealDraft();
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
  const lobbyAvatar = useLobbyProfileStore(selectLobbyAvatar);
  const lobbyAvatarSrc = resolveLobbyAvatarSrc(lobbyAvatar);
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
    setSwapTargetKey(nextKey);
  };

  return (
    <RightLedgerRail
      players={rivals.map((player) => ({
        ...player,
        avatarSrc: resolveLedgerAvatarSrc(player, false, lobbyAvatarSrc),
        avatarColorValue: resolvePlayerColorValue(player.colorId),
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
  const orca = useFrozenGuildStore(selectOrcaResolutionView);
  const seal = useFrozenGuildStore(selectSealBombResolutionView);
  const orcaTarget = useFrozenGuildStore((state) => state.orcaDraftCardID);
  const setOrcaTarget = useFrozenGuildStore((state) => state.setOrcaDraftCardID);
  const sealTargets = useFrozenGuildStore((state) => state.sealDraftCardIDs);
  const toggleSealDraftCardID = useFrozenGuildStore((state) => state.toggleSealDraftCardID);
  const swapSourceKey = useFrozenGuildStore((state) => state.swapDraftSourceKey);
  const swapTargetKey = useFrozenGuildStore((state) => state.swapDraftTargetKey);
  const setSwapSourceKey = useFrozenGuildStore((state) => state.setSwapDraftSourceKey);
  const setSwapTargetKey = useFrozenGuildStore((state) => state.setSwapDraftTargetKey);

  const local = players.find((player) => player.id === localPlayerID) ?? null;

  if (!local) {
    return <p>Sin mano local.</p>;
  }

  const clickableCardIndexes =
    flow.mode === "swap"
      ? local.cardIDs.map((_, index) => index)
      : flow.mode === "orca" && orca
        ? local.cardIDs
            .map((cardID, index) => (orca.validTargetCardIDs.includes(cardID) ? index : -1))
            .filter((index) => index >= 0)
        : flow.mode === "seal" && seal
          ? local.cardIDs
              .map((cardID, index) => (seal.validTargetCardIDs.includes(cardID) ? index : -1))
              .filter((index) => index >= 0)
        : [];

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

  if (flow.mode === "orca" && orcaTarget) {
    const selectedIndex = local.cardIDs.findIndex((cardID) => cardID === orcaTarget);
    if (selectedIndex >= 0) {
      selectedCardIndexes.push(selectedIndex);
    }
  }

  if (flow.mode === "seal") {
    sealTargets.forEach((cardID) => {
      const selectedIndex = local.cardIDs.findIndex((localCardID) => localCardID === cardID);
      if (selectedIndex >= 0) {
        selectedCardIndexes.push(selectedIndex);
      }
    });
  }

  const onLocalCardClick = (index: number) => {
    if (flow.mode === "swap") {
      const nextKey = `player:${local.id}:${index}`;
      setSwapSourceKey(nextKey);
      return;
    }

    if (flow.mode === "orca" && orca) {
      const cardID = local.cardIDs[index];
      if (!cardID || !orca.validTargetCardIDs.includes(cardID)) {
        return;
      }
      setOrcaTarget(orcaTarget === cardID ? null : cardID);
      return;
    }

    if (flow.mode === "seal" && seal) {
      const cardID = local.cardIDs[index];
      if (!cardID || !seal.validTargetCardIDs.includes(cardID)) {
        return;
      }
      toggleSealDraftCardID(cardID, seal.requiredDiscardCount);
    }
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

export function RivalsLedgerContainer() {
  const players = useFrozenGuildStore(selectPlayersLedger);
  const unstablePlayers = useFrozenGuildStore(selectUnstablePlayers);
  const localPlayerID = useFrozenGuildStore((state) => state.localPlayerID);
  const currentTurnPlayerID = useFrozenGuildStore((state) => state.ctx?.currentPlayer ?? null);
  const lobbyAvatar = useLobbyProfileStore(selectLobbyAvatar);
  const lobbyAvatarSrc = resolveLobbyAvatarSrc(lobbyAvatar);

  return (
    <RightLedgerRail
      players={players.map((player) => {
        const isLocal = player.id === localPlayerID;
        const avatarSrc = resolveLedgerAvatarSrc(player, isLocal, lobbyAvatarSrc);
        return {
          ...player,
          isActiveTurn: currentTurnPlayerID === player.id,
          isLocalPlayer: isLocal,
          avatarSrc,
          avatarColorValue: resolvePlayerColorValue(player.colorId)
        };
      })}
      unstablePlayers={unstablePlayers}
    />
  );
}
