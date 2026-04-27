import type { FrozenGuildState, PlayerID } from "./types";

const HIDDEN_CARD = { hidden: true } as const;
const HIDDEN_DECK_CARD = "hidden";

export function buildPlayerView(
  G: FrozenGuildState,
  playerID?: PlayerID | null
): FrozenGuildState {
  const revealedSlots = new Set(
    G.spy && G.spy.playerID === playerID ? G.spy.revealedSlots : []
  );

  return {
    ...G,
    deck: G.deck.map(() => HIDDEN_DECK_CARD),
    iceGrid: G.iceGrid.map((slot, index) => {
      if (slot === null) {
        return null;
      }

      if (revealedSlots.has(index)) {
        return slot;
      }

      return HIDDEN_CARD;
    }) as FrozenGuildState["iceGrid"],
    spy: G.spy && G.spy.playerID === playerID ? G.spy : null,
    orcaResolution:
      G.orcaResolution && G.orcaResolution.playerID === playerID ? G.orcaResolution : null,
    sealBombResolution:
      G.sealBombResolution && G.sealBombResolution.playerID === playerID
        ? G.sealBombResolution
        : null
  };
}
