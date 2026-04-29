import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../../shared/game/setup";

describe("basic bot", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("auto-plays full turn for configured bot player", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(2, () => 0.3);
    G.players["0"]!.name = "BOT 0";
    let endTurnCalls = 0;

    FrozenGuild.turn?.onBegin?.({
      G,
      ctx: { currentPlayer: "0" } as never,
      events: {
        endTurn: () => {
          endTurnCalls += 1;
        }
      },
      random: {
        D6: () => 1
      }
    } as never);

    expect(endTurnCalls).toBe(1);
    expect(G.dice.rolled).toBe(true);
    expect(G.turn.actionCompleted).toBe(true);
  });
});
