import { Client } from "boardgame.io/client";
import { Local } from "boardgame.io/multiplayer";
import { describe, expect, it } from "vitest";
import { FrozenGuild } from "../../shared/game/FrozenGuild";

function nextTick() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("multiplayer base sync", () => {
  it("synchronizes turn flow between two clients on same match", async () => {
    const player0 = Client({
      game: FrozenGuild,
      multiplayer: Local(),
      matchID: "sync-match",
      playerID: "0"
    });

    const player1 = Client({
      game: FrozenGuild,
      multiplayer: Local(),
      matchID: "sync-match",
      playerID: "1"
    });

    player0.start();
    player1.start();

    await nextTick();

    const initial0 = player0.getState();
    const initial1 = player1.getState();
    expect(initial0?.ctx.currentPlayer).toBe("0");
    expect(initial1?.ctx.currentPlayer).toBe("0");

    player0.moves.rollDice();
    await nextTick();

    const afterRoll0 = player0.getState();
    const afterRoll1 = player1.getState();
    expect(afterRoll0?.G.dice.rolled).toBe(true);
    expect(afterRoll1?.G.dice.rolled).toBe(true);
    expect(afterRoll0?.G.dice.value).toBe(afterRoll1?.G.dice.value);

    const diceValue = afterRoll0?.G.dice.value;
    if (diceValue !== null && diceValue !== undefined && diceValue >= 1 && diceValue <= 3) {
      player0.moves.fishFromIce(0);
      await nextTick();
    } else if (diceValue === 4) {
      player0.moves.spyOnIce([0]);
      await nextTick();
      player0.moves.completeSpy();
      await nextTick();
    } else if (diceValue === 5) {
      player0.moves.swapCards(
        { area: "player_zone", playerID: "0", index: 0 },
        { area: "player_zone", playerID: "1", index: 0 }
      );
      await nextTick();
    } else if (diceValue === 6) {
      player0.moves.choosePadrinoAction(1);
      await nextTick();
      player0.moves.fishFromIce(0);
      await nextTick();
    }

    player0.moves.endTurn();
    await nextTick();

    const afterEnd0 = player0.getState();
    const afterEnd1 = player1.getState();
    expect(afterEnd0?.ctx.currentPlayer).toBe("1");
    expect(afterEnd1?.ctx.currentPlayer).toBe("1");
    expect(afterEnd1?.G.dice).toEqual({ value: null, rolled: false });

    player0.stop();
    player1.stop();
  });
});
