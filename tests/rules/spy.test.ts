import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { completeSpy, endTurn, rollDice, spyGiveCard, spyOnIce } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("spy move", () => {
  it("allows active player to reveal 1-3 unique ice slots on dice 4", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    const result = spyOnIce({ G, ctx, playerID: "0" }, [0, 1, 2]);

    expect(result).toBeUndefined();
    expect(G.spy).toEqual({ playerID: "0", revealedSlots: [0, 1, 2] });
    expect(G.turn.actionCompleted).toBe(false);
  });

  it("rejects invalid spy selection", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });

    const duplicateSlots = spyOnIce({ G, ctx, playerID: "0" }, [0, 0]);
    const tooManySlots = spyOnIce({ G, ctx, playerID: "0" }, [0, 1, 2, 3]);

    expect(duplicateSlots).toBe("INVALID_MOVE");
    expect(tooManySlots).toBe("INVALID_MOVE");
  });

  it("lets player finish espionage without gifting", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    spyOnIce({ G, ctx, playerID: "0" }, [0]);

    const complete = completeSpy({ G, ctx, playerID: "0" });

    expect(complete).toBeUndefined();
    expect(G.spy).toBeNull();
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("gifts a revealed card to rival and refills the slot", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    const initialDeckSize = G.deck.length;
    const targetZoneSize = G.players["1"]!.zone.length;
    const slot = 0;
    const cardOnIce = G.iceGrid[slot];

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    spyOnIce({ G, ctx, playerID: "0" }, [slot]);

    const gift = spyGiveCard({ G, ctx, playerID: "0" }, slot, "1");

    expect(gift).toBeUndefined();
    expect(G.players["1"]!.zone).toHaveLength(targetZoneSize + 1);
    expect(G.players["1"]!.zone.at(-1)).toBe(cardOnIce);
    expect(G.iceGrid[slot]).not.toBeNull();
    expect(G.deck).toHaveLength(initialDeckSize - 1);
    expect(G.spy).toBeNull();
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("blocks end turn while espionage action is pending", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });

    const endWithoutSpy = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    spyOnIce({ G, ctx, playerID: "0" }, [0]);

    const endWithSpyOpen = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    completeSpy({ G, ctx, playerID: "0" });

    const endAfterComplete = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(endWithoutSpy).toBe("INVALID_MOVE");
    expect(endWithSpyOpen).toBe("INVALID_MOVE");
    expect(endAfterComplete).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });

  it("ends game instead of deadlocking when no ice cards exist for spy", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    let gameOverPayload: unknown;
    let endTurnCalls = 0;

    G.iceGrid = G.iceGrid.map(() => null);

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    const result = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endGame: (arg) => {
          gameOverPayload = arg;
        },
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(result).toBeUndefined();
    expect(endTurnCalls).toBe(0);
    expect(gameOverPayload).toMatchObject({ reason: "NO_ICE_CARDS_AVAILABLE" });
    expect(gameOverPayload).toHaveProperty("scores");
  });
});
