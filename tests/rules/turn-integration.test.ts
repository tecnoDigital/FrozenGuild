import { Client } from "boardgame.io/client";
import { describe, expect, it } from "vitest";
import { FrozenGuild } from "../../shared/game/FrozenGuild";

describe("turn integration with boardgame.io", () => {
  it("advances turn from player 0 to 1 and resets dice on new turn", () => {
    const client = Client({
      game: FrozenGuild,
      numPlayers: 2,
      playerID: "0"
    });

    client.start();

    const initialState = client.getState();
    expect(initialState?.ctx.currentPlayer).toBe("0");
    expect(initialState?.G.dice).toEqual({ value: null, rolled: false });

    client.moves.rollDice();

    const afterRoll = client.getState();
    expect(afterRoll?.G.dice.rolled).toBe(true);
    expect(afterRoll?.G.dice.value).not.toBeNull();

    if (afterRoll?.G.dice.value !== null && afterRoll.G.dice.value >= 1 && afterRoll.G.dice.value <= 3) {
      client.moves.fishFromIce(0);
    }

    if (afterRoll?.G.dice.value === 5) {
      const first = afterRoll.G.players["0"]?.zone[0];
      const second = afterRoll.G.players["1"]?.zone[0];

      if (first && second) {
        client.moves.swapCards("0", first, "1", second);
      }
    }

    client.moves.endTurn();

    const afterEndTurn = client.getState();
    expect(afterEndTurn?.ctx.currentPlayer).toBe("1");
    expect(afterEndTurn?.G.dice).toEqual({ value: null, rolled: false });
  });
});
