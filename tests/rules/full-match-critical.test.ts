import type { Ctx } from "boardgame.io";
import { describe, expect, it } from "vitest";
import {
  fishFromIce,
  resetTurnState,
  resolveOrcaDestroy,
  resolveSealBombExplosion,
  rollDice
} from "../../shared/game/moves";
import { createInitialState } from "../../shared/game/setup";

function makeCtx(currentPlayer: string): Ctx {
  return { currentPlayer } as Ctx;
}

describe("full match critical flow", () => {
  it("finishes match when El Hielo can no longer refill", () => {
    const G = createInitialState(2, () => 0.4);
    const ctx = makeCtx("0");
    let gameoverPayload: unknown;

    let guard = 0;
    while (!gameoverPayload && guard < 500) {
      guard += 1;
      resetTurnState(G);

      rollDice({ G, ctx, playerID: "0", random: { D6: () => 1 } });

      const slot = G.iceGrid.findIndex((item) => item !== null);
      if (slot === -1) {
        break;
      }

      fishFromIce(
        {
          G,
          ctx,
          playerID: "0",
          events: {
            endGame: (payload) => {
              gameoverPayload = payload;
            }
          }
        },
        slot
      );

      if (G.orcaResolution) {
        const target = G.orcaResolution.validTargetCardIDs[0];
        if (target) {
          resolveOrcaDestroy({ G, ctx, playerID: G.orcaResolution.playerID }, target);
        }
      }

      if (G.sealBombResolution) {
        const targets = G.sealBombResolution.validTargetCardIDs.slice(
          0,
          G.sealBombResolution.requiredDiscardCount
        );
        resolveSealBombExplosion({ G, ctx, playerID: G.sealBombResolution.playerID }, targets);
      }
    }

    expect(guard).toBeLessThan(500);
    expect(gameoverPayload).toMatchObject({ reason: "ICE_CANNOT_REFILL" });
    expect(gameoverPayload).toHaveProperty("scores");
  });
});
