import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { endTurn, resolveOrcaDestroy, rollDice, swapCards } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("orca resolution", () => {
  it("allows recipient to resolve orca even if it is not their turn", () => {
    const G = createInitialState(2, () => 0.3);
    const ctx = makeCtx("0");

    G.players["0"]!.zone = ["orca-001", "penguin-001"];
    G.players["1"]!.zone = ["krill-001", "petrel-001"];

    let endTurnCalls = 0;
    let activePlayersCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 5 } });
    swapCards(
      {
        G,
        ctx,
        playerID: "0",
        events: {
          setActivePlayers: () => {
            activePlayersCalls += 1;
          }
        }
      },
      "0",
      "orca-001",
      "1",
      "krill-001"
    );

    expect(G.pendingStage?.type).toBe("ORCA_DESTROY_SELECTION");
    expect(G.pendingStage?.playerID).toBe("1");

    const endBlocked = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });
    expect(endBlocked).toBe("INVALID_MOVE");

    const resolved = resolveOrcaDestroy(
      {
        G,
        ctx,
        playerID: "1",
        events: {
          setActivePlayers: () => {
            activePlayersCalls += 1;
          }
        }
      },
      "petrel-001"
    );

    expect(resolved).toBeUndefined();
    expect(G.pendingStage).toBeNull();
    expect(G.players["1"]!.zone.includes("orca-001")).toBe(false);
    expect(G.players["1"]!.zone.includes("petrel-001")).toBe(false);
    expect(G.discardPile).toEqual(expect.arrayContaining(["orca-001", "petrel-001"]));
    expect(activePlayersCalls).toBeGreaterThan(0);

    const endOk = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      }
    });

    expect(endOk).toBeUndefined();
    expect(endTurnCalls).toBe(1);
  });
});
