import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { endTurn, resetTurnState, rollDice } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("basic turn", () => {
  it("allows only active player to roll dice", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    const result = rollDice({
      G,
      ctx,
      playerID: "1",
      random: {
        D6: () => 4
      }
    });

    expect(result).toBe("INVALID_MOVE");
    expect(G.dice).toEqual({ value: null, rolled: false });
  });

  it("allows one dice roll per turn", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    const first = rollDice({
      G,
      ctx,
      playerID: "0",
      random: {
        D6: () => 6
      }
    });

    const second = rollDice({
      G,
      ctx,
      playerID: "0",
      random: {
        D6: () => 2
      }
    });

    expect(first).toBeUndefined();
    expect(second).toBe("INVALID_MOVE");
    expect(G.dice).toEqual({ value: 6, rolled: true });
  });

  it("blocks end turn if dice was not rolled", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    const result = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(result).toBe("INVALID_MOVE");
    expect(endTurnCalls).toBe(0);
  });

  it("ends turn only for active player after rolling", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({
      G,
      ctx,
      playerID: "0",
      random: {
        D6: () => 6
      }
    });

    const invalidEnd = endTurn({
      G,
      ctx,
      playerID: "1",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    const validEnd = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(invalidEnd).toBe("INVALID_MOVE");
    expect(validEnd).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });

  it("resets dice state at turn begin", () => {
    const G = createInitialState(2, () => 0.4);
    G.dice.value = 5;
    G.dice.rolled = true;
    G.turn.actionCompleted = true;

    resetTurnState(G);

    expect(G.dice).toEqual({ value: null, rolled: false });
    expect(G.turn).toEqual({ actionCompleted: false });
  });
});
