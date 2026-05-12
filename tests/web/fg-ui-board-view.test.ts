import { describe, expect, it } from "vitest";
import { makeBoardView, selectBoardCardsView } from "../../web/src/view-model/boardView";
import type { FrozenGuildUiStore } from "../../web/src/store/frozenGuildStore";

function createStore(partial: Partial<FrozenGuildUiStore> & { G?: FrozenGuildUiStore["G"] }): FrozenGuildUiStore {
  return {
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
    clearSwapDraft: () => undefined,
    ...partial
  } as FrozenGuildUiStore;
}

describe("fg board view model", () => {
  it("returns 9 empty slots when G is null", () => {
    const view = makeBoardView(createStore({ G: null }));
    expect(view).toHaveLength(9);
    expect(view.every((card) => card.empty)).toBe(true);
    expect(view[0]?.image).toBe("/assets/cards/states/card-fallback.png");
  });

  it("marks hidden slots correctly", () => {
    const store = createStore({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: [null, { hidden: true }, null, null, null, null, null, null, null],
        players: {},
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      }
    });
    const view = makeBoardView(store);
    expect(view[0]?.empty).toBe(true);
    expect(view[1]?.hidden).toBe(true);
    expect(view[1]?.image).toBe("/assets/cards/backs/frozen-dreamcatcher-back.png");
  });

  it("resolves known card IDs to labels and images", () => {
    const store = createStore({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid: ["penguin-001", "walrus-001", null, null, null, null, null, null, null],
        players: {},
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      }
    });
    const view = makeBoardView(store);
    expect(view[0]?.label).toBe("penguin 1");
    expect(view[0]?.image).toBe("/assets/cards/types/penguin-1.png");
    expect(view[0]?.empty).toBe(false);
    expect(view[0]?.hidden).toBe(false);
    expect(view[1]?.label).toBe("walrus");
    expect(view[1]?.image).toBe("/assets/cards/types/walrus.png");
  });

  it("memoizes results when iceGrid reference is stable", () => {
    const iceGrid: (string | { hidden: true } | null)[] = ["penguin-001", null, null, null, null, null, null, null, null];
    const store = createStore({
      G: {
        version: "v",
        createdAt: 0,
        activeTable: true,
        botActivity: { playerID: null, startedAt: null, completedAt: null },
        botIDs: [],
        deck: [],
        discardPile: [],
        iceGrid,
        players: {},
        pendingStage: null,
        autoResolveQueue: [],
        dice: { value: null, rolled: false },
        turn: { actionCompleted: false, padrinoAction: null },
        spy: null,
        orcaResolution: null,
        sealBombResolution: null
      }
    });
    const first = selectBoardCardsView(store);
    const second = selectBoardCardsView(store);
    expect(first).toBe(second);
  });

  it("returns empty array from selector when G is null", () => {
    const store = createStore({ G: null });
    const view = selectBoardCardsView(store);
    expect(view).toEqual([]);
  });
});
