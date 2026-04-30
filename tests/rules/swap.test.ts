import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { endTurn, rollDice, swapCards } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("swap move", () => {
  it("swaps between two different players for dice 5", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");

    const player0CardBefore = G.players["0"]!.zone[0];
    const player1CardBefore = G.players["1"]!.zone[0];

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const result = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "1", index: 0 }
    );

    expect(result).toBeUndefined();
    expect(G.players["0"]!.zone[0]).toBe(player1CardBefore);
    expect(G.players["1"]!.zone[0]).toBe(player0CardBefore);
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("swaps between two players preserving index order", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");

    const player0Card = G.players["0"]!.zone[1];
    const player1Card = G.players["1"]!.zone[2];

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const result = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 1 },
      { area: "player_zone", playerID: "1", index: 2 }
    );

    expect(result).toBeUndefined();
    expect(G.players["0"]!.zone[1]).toBe(player1Card);
    expect(G.players["1"]!.zone[2]).toBe(player0Card);
  });

  it("rejects swap if source/target are invalid, same card, or not between players", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const sameLocation = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "0", index: 0 }
    );

    const invalidIndex = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "1", index: 99 }
    );

    const samePlayerSwap = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "0", index: 1 }
    );

    const withIceGrid = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "ice_grid", slot: 0 }
    );

    expect(sameLocation).toBe("INVALID_MOVE");
    expect(invalidIndex).toBe("INVALID_MOVE");
    expect(samePlayerSwap).toBe("INVALID_MOVE");
    expect(withIceGrid).toBe("INVALID_MOVE");
  });

  it("blocks end turn until swap action is completed", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const endBeforeSwap = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    const swapResult = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "1", index: 0 }
    );

    const endAfterSwap = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(endBeforeSwap).toBe("INVALID_MOVE");
    expect(swapResult).toBeUndefined();
    expect(endAfterSwap).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });

  it("requires current player to be part of swap pair", () => {
    const G = createInitialState(3, () => 0.2);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const invalid = swapCards(
      { G, ctx, playerID: "0" },
      { area: "player_zone", playerID: "1", index: 0 },
      { area: "player_zone", playerID: "2", index: 0 }
    );

    expect(invalid).toBe("INVALID_MOVE");
  });
});
