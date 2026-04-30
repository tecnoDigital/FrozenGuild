import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import { getCardById } from "../../shared/game/cards";
import {
  endTurn,
  resolveSealBombExplosion,
  rollDice,
  setBombAtTurnStart
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

function findSealBombCardId(deck: string[]): string {
  const bomb = deck.find((cardId) => getCardById(cardId)?.type === "seal_bomb");
  if (!bomb) {
    throw new Error("Expected seal bomb in deck for test.");
  }

  return bomb;
}

describe("seal bomb resolution", () => {
  it("opens mandatory resolution if player started and ended with seal bomb", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const bomb = findSealBombCardId(G.deck);
    G.players["0"]!.zone.push(bomb);

    setBombAtTurnStart(G, "0");
    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    G.turn.padrinoAction = 4;
    G.turn.actionCompleted = true;

    const endResult = endTurn({ G, ctx, playerID: "0" });

    expect(endResult).toBeUndefined();
    expect(G.sealBombResolution).not.toBeNull();
    expect(G.sealBombResolution?.playerID).toBe("0");
    expect(G.sealBombResolution?.requiredDiscardCount).toBeGreaterThan(0);
  });

  it("resolves seal bomb by discarding bomb and selected targets", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const bomb = findSealBombCardId(G.deck);
    G.players["0"]!.zone.push(bomb);

    setBombAtTurnStart(G, "0");
    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    G.turn.padrinoAction = 4;
    G.turn.actionCompleted = true;
    endTurn({ G, ctx, playerID: "0" });

    const pending = G.sealBombResolution;
    expect(pending).not.toBeNull();
    if (!pending) {
      return;
    }

    const targets = pending.validTargetCardIDs.slice(0, pending.requiredDiscardCount);
    const resolveResult = resolveSealBombExplosion({ G, ctx, playerID: "0" }, targets);

    expect(resolveResult).toBeUndefined();
    expect(G.sealBombResolution).toBeNull();
    expect(G.players["0"]!.zone.includes(bomb)).toBe(false);
    expect(G.discardPile.includes(bomb)).toBe(true);

    for (const target of targets) {
      expect(G.players["0"]!.zone.includes(target)).toBe(false);
      expect(G.discardPile.includes(target)).toBe(true);
    }
  });

  it("does not explode if bomb was removed before end turn", () => {
    const G = createInitialState(2, () => 0.2);
    const ctx = makeCtx("0");
    const bomb = findSealBombCardId(G.deck);
    G.players["0"]!.zone.push(bomb);

    setBombAtTurnStart(G, "0");
    G.players["0"]!.zone = G.players["0"]!.zone.filter((cardId) => cardId !== bomb);
    G.discardPile.push(bomb);

    rollDice({ G, ctx, playerID: "0", random: { D6: () => 6 } });
    G.turn.padrinoAction = 4;
    G.turn.actionCompleted = true;

    const endResult = endTurn({
      G,
      ctx,
      playerID: "0",
      events: {
        endTurn: () => {
          return;
        }
      }
    });

    expect(endResult).toBeUndefined();
    expect(G.sealBombResolution).toBeNull();
  });
});
