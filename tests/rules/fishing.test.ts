import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { endTurn, fishFromIce, rollDice } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("fishing move", () => {
  it("fishes a card from El Hielo and refills slot from deck", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    const initialZoneSize = G.players["0"]!.zone.length;
    const initialDeckSize = G.deck.length;
    const slot = 0;
    const cardOnIce = G.iceGrid[slot];

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 2 } });
    const result = fishFromIce({ G, ctx, playerID: "0" }, slot);

    expect(result).toBeUndefined();
    expect(G.players["0"]!.zone).toHaveLength(initialZoneSize + 1);
    expect(G.players["0"]!.zone.at(-1)).toBe(cardOnIce);
    expect(G.iceGrid[slot]).not.toBeNull();
    expect(G.deck).toHaveLength(initialDeckSize - 1);
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("rejects fishing when dice result is not 1-3", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });
    const result = fishFromIce({ G, ctx, playerID: "0" }, 0);

    expect(result).toBe("INVALID_MOVE");
  });

  it("blocks end turn until fishing action is completed for dice 1-3", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 1 } });

    const endBeforeFish = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    const fishResult = fishFromIce({ G, ctx, playerID: "0" }, 0);
    const endAfterFish = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(endBeforeFish).toBe("INVALID_MOVE");
    expect(fishResult).toBeUndefined();
    expect(endAfterFish).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });

  it("ends game when ice slot cannot be refilled", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    let gameOverPayload: unknown;

    G.deck = [];

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 3 } });
    const result = fishFromIce(
      {
        G,
        ctx,
        playerID: "0",
        events: {
          endGame: (arg) => {
            gameOverPayload = arg;
          }
        }
      },
      0
    );

    expect(result).toBeUndefined();
    expect(G.iceGrid[0]).toBeNull();
    expect(gameOverPayload).toMatchObject({ reason: "ICE_CANNOT_REFILL" });
    expect(gameOverPayload).toHaveProperty("scores");
  });
});
