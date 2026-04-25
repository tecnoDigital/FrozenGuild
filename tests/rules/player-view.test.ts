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
});
