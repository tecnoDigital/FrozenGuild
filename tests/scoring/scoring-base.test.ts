import { describe, expect, it } from "vitest";
import {
  KRILL_BONUS_POINTS,
  KRILL_PENALTY_POINTS,
  calculateFinalScores
} from "../../shared/game/scoring";
import type { PlayerState } from "../../shared/game/types";

function makePlayer(zone: string[]): PlayerState {
  return {
    name: "Player",
    zone,
    hasBombAtStart: false
  };
}

describe("scoring base", () => {
  it("scores penguins and walrus with max one walrus per penguin", () => {
    const players = {
      "0": makePlayer(["penguin-016", "penguin-009", "walrus-001", "walrus-002", "walrus-003"])
    };

    const scores = calculateFinalScores(players);

    expect(scores["0"]?.breakdown.penguinBase).toBe(5);
    expect(scores["0"]?.breakdown.walrusBonus).toBe(5);
    expect(scores["0"]?.total).toBe(10 + KRILL_PENALTY_POINTS);
  });

  it("scores petrel as positive on even count and negative on odd count", () => {
    const evenPlayers = {
      "0": makePlayer(["petrel-001", "petrel-002"])
    };

    const oddPlayers = {
      "0": makePlayer(["petrel-001", "petrel-002", "petrel-003"])
    };

    expect(calculateFinalScores(evenPlayers)["0"]?.breakdown.petrel).toBe(2);
    expect(calculateFinalScores(oddPlayers)["0"]?.breakdown.petrel).toBe(-3);
  });

  it("scores sea elephants as N squared", () => {
    const players = {
      "0": makePlayer(["sea_elephant-001", "sea_elephant-002", "sea_elephant-003"])
    };

    const scores = calculateFinalScores(players);
    expect(scores["0"]?.breakdown.seaElephant).toBe(9);
  });

  it("scores krill majority with bonus and non-majority with penalty", () => {
    const players = {
      "0": makePlayer(["krill-001", "krill-002", "krill-003"]),
      "1": makePlayer(["krill-004"]),
      "2": makePlayer([])
    };

    const scores = calculateFinalScores(players);

    expect(scores["0"]?.breakdown.krill).toBe(KRILL_BONUS_POINTS);
    expect(scores["1"]?.breakdown.krill).toBe(KRILL_PENALTY_POINTS);
    expect(scores["2"]?.breakdown.krill).toBe(KRILL_PENALTY_POINTS);
  });

  it("combines all base scoring categories", () => {
    const players = {
      "0": makePlayer([
        "penguin-001",
        "penguin-016",
        "walrus-001",
        "petrel-001",
        "petrel-002",
        "sea_elephant-001",
        "sea_elephant-002",
        "krill-001",
        "krill-002"
      ]),
      "1": makePlayer(["krill-003"])
    };

    const scores = calculateFinalScores(players);

    expect(scores["0"]?.breakdown).toEqual({
      penguinBase: 4,
      walrusBonus: 3,
      petrel: 2,
      seaElephant: 4,
      krill: KRILL_BONUS_POINTS
    });
    expect(scores["0"]?.total).toBe(18);
    expect(scores["1"]?.breakdown.krill).toBe(KRILL_PENALTY_POINTS);
  });
});
