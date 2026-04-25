import { getCardById } from "./cards";
import type { CardId, PenguinFishValue, PlayerID, PlayerState } from "./types";

export const KRILL_BONUS_POINTS = 5;
export const KRILL_PENALTY_POINTS = -3;

export type ScoreBreakdown = {
  penguinBase: number;
  walrusBonus: number;
  petrel: number;
  seaElephant: number;
  krill: number;
};

export type PlayerScore = {
  playerID: PlayerID;
  total: number;
  breakdown: ScoreBreakdown;
};

function summarizeZone(zone: CardId[]): {
  penguinValues: PenguinFishValue[];
  walrusCount: number;
  petrelCount: number;
  seaElephantCount: number;
  krillCount: number;
} {
  const penguinValues: PenguinFishValue[] = [];
  let walrusCount = 0;
  let petrelCount = 0;
  let seaElephantCount = 0;
  let krillCount = 0;

  for (const cardId of zone) {
    const card = getCardById(cardId);
    if (!card) {
      throw new Error(`Unknown card id in scoring: ${cardId}`);
    }

    switch (card.type) {
      case "penguin":
        penguinValues.push(card.value ?? 1);
        break;
      case "walrus":
        walrusCount += 1;
        break;
      case "petrel":
        petrelCount += 1;
        break;
      case "sea_elephant":
        seaElephantCount += 1;
        break;
      case "krill":
        krillCount += 1;
        break;
      default:
        break;
    }
  }

  return {
    penguinValues,
    walrusCount,
    petrelCount,
    seaElephantCount,
    krillCount
  };
}

function computePenguinWalrusScore(penguinValues: PenguinFishValue[], walrusCount: number): {
  penguinBase: number;
  walrusBonus: number;
} {
  const penguinBase = penguinValues.reduce((sum, value) => sum + value, 0);
  const sortedPenguins = [...penguinValues].sort((a, b) => b - a);
  const walrusTargets = Math.min(walrusCount, sortedPenguins.length);
  const walrusBonus = sortedPenguins.slice(0, walrusTargets).reduce((sum, value) => sum + value, 0);

  return { penguinBase, walrusBonus };
}

function computePetrelScore(petrelCount: number): number {
  if (petrelCount === 0) {
    return 0;
  }

  return petrelCount % 2 === 0 ? petrelCount : -petrelCount;
}

function computeSeaElephantScore(seaElephantCount: number): number {
  return seaElephantCount * seaElephantCount;
}

function computeKrillScores(krillByPlayer: Record<PlayerID, number>): Record<PlayerID, number> {
  const counts = Object.values(krillByPlayer);
  const maxKrill = counts.length === 0 ? 0 : Math.max(...counts);
  const scores: Record<PlayerID, number> = {};

  for (const [playerID, krillCount] of Object.entries(krillByPlayer)) {
    if (krillCount === 0) {
      scores[playerID] = KRILL_PENALTY_POINTS;
      continue;
    }

    if (krillCount === maxKrill) {
      scores[playerID] = KRILL_BONUS_POINTS;
      continue;
    }

    scores[playerID] = KRILL_PENALTY_POINTS;
  }

  return scores;
}

export function calculateFinalScores(
  players: Record<PlayerID, PlayerState>
): Record<PlayerID, PlayerScore> {
  const perPlayerSummary: Record<
    PlayerID,
    {
      penguinBase: number;
      walrusBonus: number;
      petrel: number;
      seaElephant: number;
      krillCount: number;
    }
  > = {};

  const krillByPlayer: Record<PlayerID, number> = {};

  for (const [playerID, player] of Object.entries(players)) {
    const summary = summarizeZone(player.zone);
    const penguinWalrus = computePenguinWalrusScore(summary.penguinValues, summary.walrusCount);

    perPlayerSummary[playerID] = {
      penguinBase: penguinWalrus.penguinBase,
      walrusBonus: penguinWalrus.walrusBonus,
      petrel: computePetrelScore(summary.petrelCount),
      seaElephant: computeSeaElephantScore(summary.seaElephantCount),
      krillCount: summary.krillCount
    };

    krillByPlayer[playerID] = summary.krillCount;
  }

  const krillScores = computeKrillScores(krillByPlayer);
  const finalScores: Record<PlayerID, PlayerScore> = {};

  for (const [playerID, values] of Object.entries(perPlayerSummary)) {
    const breakdown: ScoreBreakdown = {
      penguinBase: values.penguinBase,
      walrusBonus: values.walrusBonus,
      petrel: values.petrel,
      seaElephant: values.seaElephant,
      krill: krillScores[playerID] ?? 0
    };

    finalScores[playerID] = {
      playerID,
      total:
        breakdown.penguinBase +
        breakdown.walrusBonus +
        breakdown.petrel +
        breakdown.seaElephant +
        breakdown.krill,
      breakdown
    };
  }

  return finalScores;
}
