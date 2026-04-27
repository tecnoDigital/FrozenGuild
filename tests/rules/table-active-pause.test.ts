import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import {
  DISCONNECT_GRACE_MS,
  markPlayerDisconnected,
  processAutoResolve,
  setTableActive
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("table active / pause", () => {
  it("pauses table with setTableActive", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    const result = setTableActive({ G, ctx, playerID: "0" }, false);

    expect(result).toBeUndefined();
    expect(G.activeTable).toBe(false);
  });

  it("does not auto-resolve while table is paused", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    setTableActive({ G, ctx, playerID: "0" }, false);
    markPlayerDisconnected({ G, ctx, playerID: "0" }, 1000);

    processAutoResolve({ G, ctx }, 1000 + DISCONNECT_GRACE_MS + 5000);

    expect(G.players["0"]?.connectionStatus).toBe("reconnecting");
    expect(G.autoResolveQueue).toHaveLength(1);
  });

  it("resumes timers when table is active again", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");

    setTableActive({ G, ctx, playerID: "0" }, false);
    markPlayerDisconnected({ G, ctx, playerID: "0" }, 1000);

    processAutoResolve({ G, ctx }, 1000 + DISCONNECT_GRACE_MS + 5000);
    expect(G.players["0"]?.connectionStatus).toBe("reconnecting");

    setTableActive({ G, ctx, playerID: "0" }, true);
    processAutoResolve({ G, ctx }, 1000 + DISCONNECT_GRACE_MS + 5000);

    expect(G.players["0"]?.connectionStatus).toBe("absent");
    expect(G.autoResolveQueue).toHaveLength(0);
  });
});
