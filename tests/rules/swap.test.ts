import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { endTurn, rollDice, swapCards } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("swap move", () => {
  it("swaps one card between two different players", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    const first = G.players["0"]!.zone[0]!;
    const second = G.players["1"]!.zone[0]!;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });
    const result = swapCards({ G, ctx, playerID: "0" }, "0", first, "1", second);

    expect(result).toBeUndefined();
    expect(G.players["0"]!.zone[0]).toBe(second);
    expect(G.players["1"]!.zone[0]).toBe(first);
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("blocks swap if action does not match dice", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    const result = swapCards(
      { G, ctx, playerID: "0" },
      "0",
      G.players["0"]!.zone[0]!,
      "1",
      G.players["1"]!.zone[0]!
    );

    expect(result).toBe("INVALID_MOVE");
    expect(G.turn.actionCompleted).toBe(false);
  });

  it("blocks selecting both cards from same player", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    const zone = G.players["0"]!.zone;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });
    const result = swapCards({ G, ctx, playerID: "0" }, "0", zone[0]!, "0", zone[1]!);

    expect(result).toBe("INVALID_MOVE");
  });

  it("supports legacy swap args with player_zone + index", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    const firstBefore = G.players["0"]!.zone[0]!;
    const secondBefore = G.players["1"]!.zone[0]!;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const result = swapCards(
      { G, ctx, playerID: "0" },
      "0",
      { area: "player_zone", playerID: "0", index: 0 },
      "1",
      { area: "player_zone", playerID: "1", index: 0 }
    );

    expect(result).toBeUndefined();
    expect(G.players["0"]!.zone[0]).toBe(secondBefore);
    expect(G.players["1"]!.zone[0]).toBe(firstBefore);
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("blocks legacy swap args when playerID does not match slot owner", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });

    const result = swapCards(
      { G, ctx, playerID: "0" },
      "0",
      { area: "player_zone", playerID: "1", index: 0 },
      "1",
      { area: "player_zone", playerID: "1", index: 0 }
    );

    expect(result).toBe("INVALID_MOVE");
  });

  it("blocks end turn until swap is completed", () => {
    const G = createInitialState(2, () => 0.3);
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

    swapCards(
      { G, ctx, playerID: "0" },
      "0",
      G.players["0"]!.zone[0]!,
      "1",
      G.players["1"]!.zone[0]!
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
    expect(endAfterSwap).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });
});
