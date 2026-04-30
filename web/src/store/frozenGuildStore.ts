import { create } from "zustand";
import type { FrozenGuildState } from "../../../shared/game/types.js";

export type FrozenGuildSnapshot = {
  G: FrozenGuildState | null;
  ctx: { currentPlayer: string } | null;
  gameover?: unknown;
  localPlayerID: string | null;
};

export type FrozenGuildUiStore = FrozenGuildSnapshot & {
  setSnapshot: (snapshot: FrozenGuildSnapshot) => void;
};

export const useFrozenGuildStore = create<FrozenGuildUiStore>((set) => ({
  G: null,
  ctx: null,
  gameover: undefined,
  localPlayerID: null,
  setSnapshot: (snapshot) => set(snapshot)
}));
