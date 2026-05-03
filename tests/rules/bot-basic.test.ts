import { afterEach, describe, expect, it, vi } from "vitest";
import { getCardById } from "../../shared/game/cards";
import { setBombAtTurnStart } from "../../shared/game/moves";
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

  it("recognizes bot seats created from setup data", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(2, () => 0.3, { botPlayerIDs: ["0"] });
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

    expect(G.players["0"]?.name).toBe("BOT 0");
    expect(endTurnCalls).toBe(1);
    expect(G.botActivity.playerID).toBe("0");
    expect(G.botActivity.completedAt).not.toBeNull();
  });

  it("resolves seal bomb triggered by endTurn and closes turn", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(2, () => 0.3);
    G.players["0"]!.name = "BOT 0";

    const bomb = G.deck.find((cardID) => getCardById(cardID)?.type === "seal_bomb");
    const nonBomb = G.deck.find((cardID) => getCardById(cardID)?.type !== "seal_bomb");
    expect(bomb).toBeTruthy();
    expect(nonBomb).toBeTruthy();
    if (!bomb || !nonBomb) {
      return;
    }

    G.players["0"]!.zone = [bomb, nonBomb];
    setBombAtTurnStart(G, "0");

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
        D6: () => 4
      }
    } as never);

    expect(endTurnCalls).toBe(1);
    expect(G.sealBombResolution).toBeNull();
    expect(G.players["0"]!.zone.includes(bomb)).toBe(false);
    expect(G.discardPile).toContain(bomb);
  });

  it("auto-resolves orca pending created during bot action", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(2, () => 0.3);
    G.players["0"]!.name = "BOT 0";
    G.players["0"]!.zone = ["krill-001"];
    G.iceGrid[0] = "orca-001";

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

    expect(G.dice.rolled).toBe(true);
    expect(G.turn.actionCompleted).toBe(true);
    expect(endTurnCalls).toBe(1);
    expect(G.orcaResolution).toBeNull();
    expect(G.players["0"]!.zone.includes("orca-001")).toBe(false);
    expect(G.discardPile).toEqual(expect.arrayContaining(["orca-001", "krill-001"]));
  });
});
