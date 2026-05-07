import { create } from "zustand";
import type { FrozenGuildState } from "../../../shared/game/types.js";

export type FrozenGuildSnapshot = {
  G: FrozenGuildState | null;
  ctx: { currentPlayer: string; turn?: number } | null;
  gameover?: unknown;
  localPlayerID: string | null;
};

export type FrozenGuildUiStore = FrozenGuildSnapshot & {
  spyDraftSlots: number[];
  spyDraftGiftSlot: number | null;
  swapDraftSourceKey: string;
  swapDraftTargetKey: string;
  orcaDraftCardID: string | null;
  setSnapshot: (snapshot: FrozenGuildSnapshot) => void;
  toggleSpyDraftSlot: (slot: number) => void;
  setSpyDraftGiftSlot: (slot: number | null) => void;
  clearSpyDraft: () => void;
  setSwapDraftSourceKey: (key: string) => void;
  setSwapDraftTargetKey: (key: string) => void;
  clearSwapDraft: () => void;
  setOrcaDraftCardID: (cardID: string | null) => void;
};

export const useFrozenGuildStore = create<FrozenGuildUiStore>((set) => ({
  G: null,
  ctx: null,
  gameover: undefined,
  localPlayerID: null,
  spyDraftSlots: [],
  spyDraftGiftSlot: null,
  swapDraftSourceKey: "",
  swapDraftTargetKey: "",
  orcaDraftCardID: null,
  setSnapshot: (snapshot) => set(snapshot),
  toggleSpyDraftSlot: (slot) =>
    set((state) => {
      if (state.spyDraftSlots.includes(slot)) {
        return { spyDraftSlots: state.spyDraftSlots.filter((value) => value !== slot) };
      }
      if (state.spyDraftSlots.length >= 3) {
        return { spyDraftSlots: state.spyDraftSlots };
      }
      return { spyDraftSlots: [...state.spyDraftSlots, slot] };
    }),
  setSpyDraftGiftSlot: (slot) => set({ spyDraftGiftSlot: slot }),
  clearSpyDraft: () => set({ spyDraftSlots: [], spyDraftGiftSlot: null }),
  setSwapDraftSourceKey: (key) => set({ swapDraftSourceKey: key }),
  setSwapDraftTargetKey: (key) => set({ swapDraftTargetKey: key }),
  clearSwapDraft: () => set({ swapDraftSourceKey: "", swapDraftTargetKey: "" }),
  setOrcaDraftCardID: (cardID) => set({ orcaDraftCardID: cardID })
}));
