import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { getCardById } from "../../shared/game/cards";
import {
  endTurn,
  fishFromIce,
  resolveOrcaDestroy,
  rollDice,
  spyGiveCard,
  spyOnIce
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

function findOrcaCardId(deck: string[]): string {
  const orca = deck.find((cardId) => getCardById(cardId)?.type === "orca");
  if (!orca) {
    throw new Error("Expected at least one orca card in test deck.");
  }

  return orca;
}

describe("orca resolution", () => {
  it("opens mandatory resolution when active player receives an orca", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const orcaCardId = findOrcaCardId(G.deck);
    G.iceGrid[0] = orcaCardId;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 1 } });
    fishFromIce({ G, ctx, playerID: "0" }, 0);

    expect(G.orcaResolution).not.toBeNull();
    expect(G.orcaResolution?.playerID).toBe("0");
    expect(G.orcaResolution?.orcaCardID).toBe(orcaCardId);
    expect(G.orcaResolution?.validTargetCardIDs.length).toBeGreaterThan(0);

    const endTurnResult = endTurn({ G, ctx, playerID: "0" });
    expect(endTurnResult).toBe("INVALID_MOVE");
  });

  it("resolves orca by discarding orca and selected own target", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const orcaCardId = findOrcaCardId(G.deck);
    G.iceGrid[0] = orcaCardId;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 1 } });
    fishFromIce({ G, ctx, playerID: "0" }, 0);

    const targetCardId = G.orcaResolution?.validTargetCardIDs[0];
    expect(targetCardId).toBeTruthy();
    if (!targetCardId) {
      return;
    }

    const resolveResult = resolveOrcaDestroy({ G, ctx, playerID: "0" }, targetCardId);

    expect(resolveResult).toBeUndefined();
    expect(G.orcaResolution).toBeNull();
    expect(G.players["0"]?.zone.includes(orcaCardId)).toBe(false);
    expect(G.players["0"]?.zone.includes(targetCardId)).toBe(false);
    expect(G.discardPile.includes(orcaCardId)).toBe(true);
    expect(G.discardPile.includes(targetCardId)).toBe(true);
  });

  it("auto-discards orca if player has no other destroyable card", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const orcaCardId = findOrcaCardId(G.deck);
    G.players["0"]!.zone = [];
    G.iceGrid[0] = orcaCardId;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 1 } });
    fishFromIce({ G, ctx, playerID: "0" }, 0);

    expect(G.orcaResolution).toBeNull();
    expect(G.players["0"]?.zone.includes(orcaCardId)).toBe(false);
    expect(G.discardPile.includes(orcaCardId)).toBe(true);
  });

  it("requires the receiving player to resolve pending orca", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const orcaCardId = findOrcaCardId(G.deck);
    G.iceGrid[0] = orcaCardId;

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 4 } });
    spyOnIce({ G, ctx, playerID: "0" }, [0]);
    spyGiveCard({ G, ctx, playerID: "0" }, 0, "1");

    expect(G.orcaResolution?.playerID).toBe("1");
    const target = G.orcaResolution?.validTargetCardIDs[0];
    expect(target).toBeTruthy();
    if (!target) {
      return;
    }

    const invalidResolver = resolveOrcaDestroy({ G, ctx, playerID: "0" }, target);
    const validResolver = resolveOrcaDestroy({ G, ctx, playerID: "1" }, target);

    expect(invalidResolver).toBe("INVALID_MOVE");
    expect(validResolver).toBeUndefined();
    expect(G.orcaResolution).toBeNull();
  });
});
