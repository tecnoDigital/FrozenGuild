import type { FrozenGuildState } from "./types";

const HIDDEN_CARD = { hidden: true } as const;
const HIDDEN_DECK_CARD = "hidden";

export function buildPlayerView(G: FrozenGuildState): FrozenGuildState {
  return {
    ...G,
    deck: G.deck.map(() => HIDDEN_DECK_CARD),
    iceGrid: G.iceGrid.map((slot) => (slot === null ? null : HIDDEN_CARD)) as FrozenGuildState["iceGrid"]
  };
}
