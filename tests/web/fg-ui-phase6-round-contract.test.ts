import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { GameShell } from "../../web/src/features/game/ui/GameShell";
import { CurrentTurnPanelContainer } from "../../web/src/features/game/ui/CurrentTurnPanelContainer";
import { LocalPlayerHandContainer } from "../../web/src/features/game/ui/LocalPlayerHandContainer";
import { mockGameShell } from "../../web/src/features/game/ui/mockData";
import { OpponentPanelContainer } from "../../web/src/features/game/ui/OpponentPanelContainer";
import { RoundBadgeContainer } from "../../web/src/features/game/ui/RoundBadgeContainer";
import { ScorePanelContainer } from "../../web/src/features/game/ui/ScorePanelContainer";
import {
  selectCurrentTurnView,
  selectLocalPlayerHandView,
  selectOpponentHandCounts,
  selectOpponentIdentities,
  selectPlayersLedger,
  selectRoundBadgeLabel
} from "../../web/src/store/selectors";

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

  it("derives score ledger from snapshot player zones with safe fallback", () => {
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
          "0": { name: "Local Penguin", zone: ["c1", "c2", "c3"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" },
          "1": { name: "Walrus Don", zone: ["c4"], hasBombAtStart: false, hasBombAtEnd: false, connectionStatus: "connected" }
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
      { id: "0", name: "Local Penguin", score: 3, cards: 3, cardIDs: ["c1", "c2", "c3"] },
      { id: "1", name: "Walrus Don", score: 1, cards: 1, cardIDs: ["c4"] }
    ]);
    expect(fallback).toEqual([]);
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
});
