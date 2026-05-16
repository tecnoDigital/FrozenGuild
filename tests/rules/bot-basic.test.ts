import { afterEach, describe, expect, it, vi } from "vitest";
import { getCardById } from "../../shared/game/cards";
import { setBombAtTurnStart } from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

describe("basic bot", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
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
    G.iceGrid = G.iceGrid.map(() => null);
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

  it("auto-resolves orca received during bot swap turn", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(2, () => 0.3);
    G.players["0"]!.name = "BOT 0";
    G.players["0"]!.zone = ["krill-001", "walrus-001"];
    G.players["1"]!.zone = ["orca-001", "penguin-001"];

    vi.spyOn(Math, "random").mockReturnValue(0.3);

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
        D6: () => 5
      }
    } as never);

    expect(G.dice.rolled).toBe(true);
    expect(G.turn.actionCompleted).toBe(true);
    expect(endTurnCalls).toBe(1);
    expect(G.orcaResolution).toBeNull();
    expect(G.players["0"]!.zone.includes("orca-001")).toBe(false);
    expect(G.discardPile).toEqual(expect.arrayContaining(["orca-001"]));
  });

  it("ends a 3-player bot swap turn when the bot has no cards", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(3, () => 0.3);
    G.players["0"]!.name = "BOT 0";
    G.players["0"]!.zone = [];
    G.players["1"]!.zone = ["krill-001"];
    G.players["2"]!.zone = ["penguin-001"];

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
        D6: () => 5
      }
    } as never);

    expect(G.dice.rolled).toBe(true);
    expect(G.turn.actionCompleted).toBe(false);
    expect(endTurnCalls).toBe(1);
    expect(G.botActivity.playerID).toBe("0");
    expect(G.botActivity.completedAt).not.toBeNull();
  });

  it("ends a 3-player bot swap turn when no rival has cards", async () => {
    const { FrozenGuild } = await import("../../shared/game/FrozenGuild");

    const G = createInitialState(3, () => 0.3);
    G.players["0"]!.name = "BOT 0";
    G.players["0"]!.zone = ["krill-001"];
    G.players["1"]!.zone = [];
    G.players["2"]!.zone = [];

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
        D6: () => 5
      }
    } as never);

    expect(G.dice.rolled).toBe(true);
    expect(G.turn.actionCompleted).toBe(false);
    expect(endTurnCalls).toBe(1);
    expect(G.botActivity.playerID).toBe("0");
    expect(G.botActivity.completedAt).not.toBeNull();
  });
});
