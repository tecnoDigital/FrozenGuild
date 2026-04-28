import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import {
  DISCONNECT_GRACE_MS,
  markPlayerDisconnected,
  markPlayerReconnected,
  processAutoResolve,
  rollDice
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("disconnect and absence", () => {
  it("marks player reconnecting and queues TURN_SKIP", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    const result = markPlayerDisconnected({ G, ctx, playerID: "0" }, 1_000);

    expect(result).toBeUndefined();
    expect(G.players["0"]?.connectionStatus).toBe("reconnecting");
    expect(G.players["0"]?.disconnectStartedAt).toBe(1_000);
    expect(G.autoResolveQueue).toHaveLength(1);
    expect(G.autoResolveQueue[0]).toMatchObject({
      playerID: "0",
      stageType: "TURN_SKIP",
      resolveAfterMs: DISCONNECT_GRACE_MS
    });
  });

  it("restores connected and clears queue on reconnect", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    markPlayerDisconnected({ G, ctx, playerID: "0" }, 1_000);
    const result = markPlayerReconnected({ G, ctx, playerID: "0" });

    expect(result).toBeUndefined();
    expect(G.players["0"]?.connectionStatus).toBe("connected");
    expect(G.players["0"]?.disconnectStartedAt).toBeUndefined();
    expect(G.autoResolveQueue).toHaveLength(0);
  });

  it("marks player absent after 30s", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    markPlayerDisconnected({ G, ctx, playerID: "0" }, 1_000);
    processAutoResolve({ G, ctx }, 1_000 + DISCONNECT_GRACE_MS);

    expect(G.players["0"]?.connectionStatus).toBe("absent");
    expect(G.autoResolveQueue).toHaveLength(0);
  });

  it("auto-skips absent active player turn", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");
    let endTurnCalls = 0;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    markPlayerDisconnected({ G, ctx, playerID: "0" }, 10);

    processAutoResolve(
      {
        G,
        ctx,
        events: {
          endTurn: () => {
            endTurnCalls += 1;
          }
        }
      },
      10 + DISCONNECT_GRACE_MS
    );

    expect(G.players["0"]?.connectionStatus).toBe("absent");
    expect(endTurnCalls).toBe(1);
  });
});
