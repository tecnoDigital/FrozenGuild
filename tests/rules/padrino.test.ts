import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import {
  choosePadrinoAction,
  endTurn,
  fishFromIce,
  resetTurnState,
  rollDice,
  spyOnIce,
  swapCards
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("padrino move", () => {
  it("requires selecting an action when dice is 6", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });

    const endWithoutSelection = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(endWithoutSelection).toBe("INVALID_MOVE");
    expect(endTurnCalls).toBe(0);
  });

  it("allows choosing exactly one padrino action", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });

    const first = choosePadrinoAction({ G, ctx, playerID: "0" }, 5);
    const second = choosePadrinoAction({ G, ctx, playerID: "0" }, 1);

    expect(first).toBeUndefined();
    expect(second).toBe("INVALID_MOVE");
    expect(G.turn.padrinoAction).toBe(5);
  });

  it("reuses fishing validation when choosing actions 1-3", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    choosePadrinoAction({ G, ctx, playerID: "0" }, 2);

    const fishResult = fishFromIce({ G, ctx, playerID: "0" }, 0);

    expect(fishResult).toBeUndefined();
    expect(G.turn.actionCompleted).toBe(true);
  });

  it("reuses spy and swap validations for actions 4 and 5", () => {
    const GSpy = createInitialState(2, () => 0.3);
    const ctxSpy = makeCtx("0");

    rollDice({ G: GSpy, ctx: ctxSpy, playerID: "0", random: { D6: () => 6 } });
    choosePadrinoAction({ G: GSpy, ctx: ctxSpy, playerID: "0" }, 4);
    const spyResult = spyOnIce({ G: GSpy, ctx: ctxSpy, playerID: "0" }, [0]);

    expect(spyResult).toBeUndefined();

    const GSwap = createInitialState(2, () => 0.3);
    const ctxSwap = makeCtx("0");

    rollDice({ G: GSwap, ctx: ctxSwap, playerID: "0", random: { D6: () => 6 } });
    choosePadrinoAction({ G: GSwap, ctx: ctxSwap, playerID: "0" }, 5);
    const swapResult = swapCards(
      { G: GSwap, ctx: ctxSwap, playerID: "0" },
      { area: "player_zone", playerID: "0", index: 0 },
      { area: "player_zone", playerID: "1", index: 0 }
    );

    expect(swapResult).toBeUndefined();
  });

  it("clears selected padrino action on new turn", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    choosePadrinoAction({ G, ctx, playerID: "0" }, 1);

    expect(G.turn.padrinoAction).toBe(1);
    resetTurnState(G);
    expect(G.turn.padrinoAction).toBeNull();
  });
});
