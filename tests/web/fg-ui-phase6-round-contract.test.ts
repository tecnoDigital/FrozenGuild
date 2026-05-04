import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { BoardSlotsContainer } from "../../web/src/features/game/ui/BoardSlotsContainer";
import { ActionBarContainer } from "../../web/src/features/game/ui/ActionBarContainer";
import { DicePanelContainer } from "../../web/src/features/game/ui/DicePanelContainer";
import { GameShell } from "../../web/src/features/game/ui/GameShell";
import { CurrentTurnPanelContainer } from "../../web/src/features/game/ui/CurrentTurnPanelContainer";
import { DeckPanelContainer } from "../../web/src/features/game/ui/DeckPanelContainer";
import { LocalPlayerHandContainer } from "../../web/src/features/game/ui/LocalPlayerHandContainer";
import { mockGameShell } from "../../web/src/features/game/ui/mockData";
import { OpponentPanelContainer } from "../../web/src/features/game/ui/OpponentPanelContainer";
import { RoundBadgeContainer } from "../../web/src/features/game/ui/RoundBadgeContainer";
import { ScorePanelContainer } from "../../web/src/features/game/ui/ScorePanelContainer";
import {
  selectCurrentTurnView,
  selectDeckCount,
  selectDiceView,
  selectLocalPlayerHandView,
  selectBoardSlotsView,
  selectActionButtonsView,
  selectActionFlowView,
  selectOpponentHandCounts,
  selectOpponentIdentities,
  selectPlayersLedger,
  selectRoundBadgeLabel
} from "../../web/src/store/selectors";
import { getCardAssetById } from "../../web/src/view-model/assetMap";

function collectElements(node: ReactNode, bucket: unknown[] = []): unknown[] {
  if (!node) return bucket;
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, bucket);
    return bucket;
  }

  if (typeof node === "object" && "props" in node && "type" in node) {
    bucket.push(node);
    const children = (node as { props?: { children?: ReactNode } }).props?.children;
    collectElements(children, bucket);
  }

  return bucket;
}

describe("fg phase 6 round connection contract", () => {
  it("mounts round badge through a Zustand container boundary instead of static mock round props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(RoundBadgeContainer)).toBe(true);
  });

  it("derives round label from game snapshot turn with safe fallback", () => {
    const activeRound = selectRoundBadgeLabel({
      G: null,
      ctx: { currentPlayer: "0", turn: 7 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallbackRound = selectRoundBadgeLabel({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(activeRound).toBe("Round 7");
    expect(fallbackRound).toBe("Round -");
  });

  it("mounts opponents through a Zustand container boundary instead of static mock opponent props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(OpponentPanelContainer)).toBe(true);
  });

  it("derives player identities from game snapshot with local-player filtering and safe fallback", () => {
    const opponents = selectOpponentIdentities({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallback = selectOpponentIdentities({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(opponents).toEqual([{ id: "1", name: "Walrus Don" }]);
    expect(fallback).toEqual([]);
  });

  it("mounts current turn through a Zustand container boundary instead of static mock turn props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(CurrentTurnPanelContainer)).toBe(true);
  });

  it("derives current-turn identity and round from snapshot state with safe fallback", () => {
    const turnView = selectCurrentTurnView({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "1", turn: 6 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallbackView = selectCurrentTurnView({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(turnView).toEqual({ currentPlayerName: "Walrus Don", turnCount: 6, currentPlayerID: "1" });
    expect(fallbackView).toEqual({ currentPlayerName: "Player -", turnCount: 0, currentPlayerID: null });
  });

  it("mounts score panel through a Zustand container boundary instead of static mock score props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(ScorePanelContainer)).toBe(true);
  });

  it("derives score ledger from penguin values in snapshot player zones with safe fallback", () => {
    const ledger = selectPlayersLedger({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: ["penguin-001", "penguin-009", "penguin-016", "walrus-001"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: ["walrus-002"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallback = selectPlayersLedger({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(ledger).toEqual([
      { id: "0", name: "Local Penguin", score: 6, cards: 4, cardIDs: ["penguin-001", "penguin-009", "penguin-016", "walrus-001"] },
      { id: "1", name: "Walrus Don", score: 0, cards: 1, cardIDs: ["walrus-002"] }
    ]);
    expect(fallback).toEqual([]);
  });

  it("maps each penguin value to its own card asset", () => {
    expect(getCardAssetById("penguin-001")).toBe("/assets/cards/types/penguin-1.png");
    expect(getCardAssetById("penguin-009")).toBe("/assets/cards/types/penguin-2.png");
    expect(getCardAssetById("penguin-016")).toBe("/assets/cards/types/penguin-3.png");
  });

  it("mounts local hand through a Zustand container boundary instead of static mock hand props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(LocalPlayerHandContainer)).toBe(true);
  });

  it("derives local hand visible cards from snapshot local player zone with safe fallback", () => {
    const hand = selectLocalPlayerHandView({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: ["penguin-001", "seal_bomb-001", "orca-001"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: ["walrus-001"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallback = selectLocalPlayerHandView({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(hand.playerId).toBe("0");
    expect(hand.cards).toHaveLength(3);
    expect(hand.cards.map((card) => card.variant)).toEqual(["penguin-1", "seal-bomb", "orca"]);
    expect(fallback).toEqual({ playerId: "local", cards: [] });
  });

  it("derives opponent hand counts from snapshot opponent zones with safe fallback", () => {
    const counts = selectOpponentHandCounts({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: ["penguin-001"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: ["walrus-001", "orca-001"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "2": { name: "Petrel", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallback = selectOpponentHandCounts({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(counts).toEqual([{ id: "1", handCount: 2 }, { id: "2", handCount: 0 }]);
    expect(fallback).toEqual([]);
  });

  it("mounts deck panel through a Zustand container boundary instead of static mock deck props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(DeckPanelContainer)).toBe(true);
  });

  it("derives deck count from snapshot deck length with safe fallback", () => {
    const activeCount = selectDeckCount({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: ["penguin-001", "penguin-002", "orca-001"],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallbackCount = selectDeckCount({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(activeCount).toBe(3);
    expect(fallbackCount).toBe(0);
  });

  it("mounts 3x3 board through a Zustand container boundary instead of static mock board props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(BoardSlotsContainer)).toBe(true);
  });

  it("derives board slots from snapshot iceGrid card IDs only with safe fallback", () => {
    const board = selectBoardSlotsView({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: ["penguin-001", "walrus-001", "petrel-001", "sea_elephant-001", null, "krill-001", "orca-001", "seal_bomb-001", "penguin-002"],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 1 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallback = selectBoardSlotsView({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(board).toHaveLength(9);
    expect(board.map((slot) => slot.slotId)).toEqual([
      "slot-1",
      "slot-2",
      "slot-3",
      "slot-4",
      "slot-5",
      "slot-6",
      "slot-7",
      "slot-8",
      "slot-9"
    ]);
    expect(board[0]?.card?.variant).toBe("penguin-1");
    expect(board[3]?.card?.variant).toBe("sea-elephant");
    expect(board[7]?.card?.variant).toBe("seal-bomb");
    expect(board[4]?.card).toBeUndefined();
    expect(fallback).toEqual([]);
  });

  it("mounts dice through a Zustand container boundary instead of static mock dice props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(DicePanelContainer)).toBe(true);
  });

  it("derives dice result view from snapshot dice state with safe fallback", () => {
    const activeDice = selectDiceView({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: 5, rolled: true },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 4 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const fallbackDice = selectDiceView({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    expect(activeDice).toEqual({ rolled: true, value: 5, disabled: false });
    expect(fallbackDice).toEqual({ rolled: false, value: null, disabled: true });
  });

  it("mounts current and available actions through a Zustand container boundary instead of static mock action props", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));

    expect(nodeTypes.has(ActionBarContainer)).toBe(true);
  });

  it("derives action flow and available/current action buttons from snapshot state with safe fallback", () => {
    const actionFlow = selectActionFlowView({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [],
        players: {
          "0": { name: "Local Penguin", zone: [], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
        },
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      },
      ctx: { currentPlayer: "0", turn: 4 },
      gameover: undefined,
      localPlayerID: "0",
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    });

    const actionButtons = selectActionButtonsView(actionFlow);
    const fallbackButtons = selectActionButtonsView(selectActionFlowView({
      G: null,
      ctx: null,
      gameover: undefined,
      localPlayerID: null,
      spyDraftSlots: [],
      spyDraftGiftSlot: null,
      swapDraftSourceKey: "",
      swapDraftTargetKey: "",
      setSnapshot: () => undefined,
      toggleSpyDraftSlot: () => undefined,
      setSpyDraftGiftSlot: () => undefined,
      clearSpyDraft: () => undefined,
      setSwapDraftSourceKey: () => undefined,
      setSwapDraftTargetKey: () => undefined,
      clearSwapDraft: () => undefined
    }));

    expect(actionFlow).toMatchObject({ mode: "roll", canRoll: true, isMyTurn: true });
    expect(actionButtons).toEqual([
      { id: "roll", label: "Roll Dice", disabled: false },
      { id: "end-turn", label: "End Turn", disabled: true }
    ]);
    expect(fallbackButtons).toEqual([
      { id: "roll", label: "Roll Dice", disabled: true },
      { id: "end-turn", label: "End Turn", disabled: true }
    ]);
  });
});
