import { Client } from "boardgame.io/client";
import { describe, expect, it } from "vitest";
import { FrozenGuild } from "../../shared/game/FrozenGuild";
import { buildPlayerView } from "../../shared/game/playerView";
import { createInitialState } from "../../shared/game/setup";

describe("playerView security", () => {
  it("hides real card ids from El Hielo and deck", () => {
    const state = createInitialState(2, () => 0.4);
    const view = buildPlayerView(state);

    for (const slot of view.iceGrid) {
      if (slot !== null) {
        expect(slot).toEqual({ hidden: true });
      }
    }

    for (const deckItem of view.deck) {
      expect(deckItem).toBe("hidden");
    }
  });

  it("applies playerView in boardgame client state", () => {
    const client = Client({
      game: FrozenGuild,
      numPlayers: 2,
      playerID: "0"
    });

    client.start();
    const state = client.getState();

    expect(state).not.toBeNull();
    if (!state) {
      return;
    }

    for (const slot of state.G.iceGrid) {
      if (slot !== null) {
        expect(slot).toEqual({ hidden: true });
      }
    }

    expect(state.G.deck.every((cardId) => cardId === "hidden")).toBe(true);

    client.stop();
  });

  it("reveals only selected spy slots to spying player", () => {
    const state = createInitialState(2, () => 0.4);
    const firstCard = state.iceGrid[0];
    const secondCard = state.iceGrid[1];

    state.spy = {
      playerID: "0",
      revealedSlots: [0]
    };

    const spyPlayerView = buildPlayerView(state, "0");
    const rivalView = buildPlayerView(state, "1");

    expect(spyPlayerView.iceGrid[0]).toBe(firstCard);
    expect(spyPlayerView.iceGrid[1]).toEqual({ hidden: true });
    expect(spyPlayerView.spy).toEqual({ playerID: "0", revealedSlots: [0] });

    expect(rivalView.iceGrid[0]).toEqual({ hidden: true });
    expect(rivalView.iceGrid[1]).toEqual({ hidden: true });
    expect(rivalView.spy).toBeNull();

    expect(secondCard).not.toBeNull();
  });

  it("reveals orca resolution targets only to affected player", () => {
    const state = createInitialState(2, () => 0.4);
    const targetCard = state.players["0"]?.zone[0];
    const orcaCard = state.players["0"]?.zone[1];

    if (!targetCard || !orcaCard) {
      throw new Error("Expected cards in player zone for test.");
    }

    state.orcaResolution = {
      playerID: "0",
      orcaCardID: orcaCard,
      validTargetCardIDs: [targetCard]
    };

    const affectedView = buildPlayerView(state, "0");
    const rivalView = buildPlayerView(state, "1");

    expect(affectedView.orcaResolution).toEqual(state.orcaResolution);
    expect(rivalView.orcaResolution).toBeNull();
  });
});
