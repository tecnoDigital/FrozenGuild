import type { ActivePlayersArg, Ctx, Game } from "boardgame.io";
import {
  choosePadrinoAction,
  completeSpy,
  endTurn,
  fishFromIce,
  isOrcaCard,
  isSealBombCard,
  markPlayerDisconnected,
  markPlayerReconnected,
  resolveOrcaDestroy,
  resolveSealBombExplosion,
  resetTurnState,
  rollDice,
  setBombAtTurnStart,
  setTableActive,
  spyGiveCard,
  spyOnIce,
  swapCards
} from "./moves.js";
import { buildPlayerView } from "./playerView.js";
import { createInitialState } from "./setup.js";
import type { SetupData } from "./setup.js";
import type { FrozenGuildState } from "./types.js";

const INVALID_MOVE = "INVALID_MOVE" as const;

function ensureBotActivity(G: FrozenGuildState): FrozenGuildState["botActivity"] {
  if (!G.botActivity) {
    G.botActivity = {
      playerID: null,
      startedAt: null,
      completedAt: null
    };
  }

  return G.botActivity;
}

function isBotPlayer(G: FrozenGuildState, playerID: string): boolean {
  if (G.botIDs?.includes(playerID)) {
    return true;
  }
  
  const player = G.players[playerID];
  if (!player) {
    return false;
  }

  return player.name.trim().toUpperCase().startsWith("BOT ");
}

function randomPick<T>(items: T[], randomFn: () => number): T | null {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * items.length);
  return items[index] ?? null;
}

function getEffectiveActionValue(G: FrozenGuildState): number | null {
  if (!G.dice.rolled || G.dice.value === null) {
    return null;
  }

  if (G.dice.value === 6) {
    return G.turn.padrinoAction;
  }

  return G.dice.value;
}

function botCanSwap(G: FrozenGuildState): boolean {
  const playersWithCards = Object.values(G.players).filter((player) => player.zone.length > 0).length;
  return playersWithCards >= 2;
}

function readSetupData(value: unknown): SetupData | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;
  const botPlayerIDs = candidate.botPlayerIDs;
  
  if (!Array.isArray(botPlayerIDs)) {
    return undefined;
  }

  return {
    botPlayerIDs: botPlayerIDs.filter((item): item is string => typeof item === "string")
  };
}

function runBasicBotTurn(args: {
  G: FrozenGuildState;
  ctx: Ctx;
  events?:
    | {
        endTurn?: () => void;
        endGame?: (arg?: unknown) => void;
        setActivePlayers?: (arg: ActivePlayersArg) => void;
      }
    | undefined;
  random?: { D6: () => number } | undefined;
}): void {
  const { G, ctx, events, random } = args;
  const playerID = ctx.currentPlayer;
  const randomFn = () => Math.random();

  const botActivity = ensureBotActivity(G);
  G.botActivity = {
    playerID,
    startedAt: Date.now(),
    completedAt: null
  };

  const rollResult = rollDice({ G, ctx, playerID, random });
  if (rollResult === INVALID_MOVE) {
    return;
  }

  if (G.dice.value === 6) {
    const padrinoOptions = [1, 2, 3, 4, 5].filter((value) => value !== 5 || botCanSwap(G));
    const chosen = randomPick(padrinoOptions, randomFn);
    if (chosen !== null) {
      choosePadrinoAction({ G, ctx, playerID }, chosen as 1 | 2 | 3 | 4 | 5);
    }
  }

  const action = getEffectiveActionValue(G);

  if (action !== null && action >= 1 && action <= 3) {
    const fishableSlots = G.iceGrid
      .map((cardId, slot) => (typeof cardId === "string" ? slot : -1))
      .filter((slot) => slot >= 0);
    const slot = randomPick(fishableSlots, randomFn);
    if (slot !== null) {
      fishFromIce({ G, ctx, playerID, events }, slot);
    }
  } else if (action === 4) {
    const revealed = G.iceGrid
      .map((cardId, slot) => (typeof cardId === "string" ? slot : -1))
      .filter((slot) => slot >= 0)
      .slice(0, 3);

    const spyResult = spyOnIce({ G, ctx, playerID }, revealed);
    if (spyResult !== INVALID_MOVE) {
      const otherPlayers = Object.keys(G.players).filter((id) => id !== playerID);
      const target = randomPick(otherPlayers, randomFn);
      const giftSlot = randomPick(revealed, randomFn);

      if (target && giftSlot !== null) {
        const cardId = G.iceGrid[giftSlot];
        const isDangerousCard = typeof cardId === "string" && (isOrcaCard(cardId) || isSealBombCard(cardId));
        
        if (!isDangerousCard && randomFn() < 0.5) {
          const giftResult = spyGiveCard({ G, ctx, playerID, events }, giftSlot, target);
          if (giftResult === INVALID_MOVE) {
            completeSpy({ G, ctx, playerID });
          }
        } else {
          completeSpy({ G, ctx, playerID });
        }
      } else {
        completeSpy({ G, ctx, playerID });
      }
    }
  } else if (action === 5) {
    const candidates = Object.entries(G.players)
      .filter(([, player]) => player.zone.length > 0)
      .map(([id]) => id);

    const firstPlayerID = randomPick(candidates, randomFn);
    const secondPlayerID = randomPick(
      candidates.filter((id) => id !== firstPlayerID),
      randomFn
    );

    if (firstPlayerID && secondPlayerID) {
      const firstPlayer = G.players[firstPlayerID]!;
      const secondPlayer = G.players[secondPlayerID]!;
      const firstIndex = Math.floor(randomFn() * firstPlayer.zone.length);
      const secondIndex = Math.floor(randomFn() * secondPlayer.zone.length);

      swapCards(
        { G, ctx, playerID, events },
        { area: "player_zone", playerID: firstPlayerID, index: firstIndex },
        { area: "player_zone", playerID: secondPlayerID, index: secondIndex }
      );
    }
  }

  if (G.orcaResolution?.playerID === playerID) {
    const target = G.orcaResolution.validTargetCardIDs[0];
    if (target) {
      resolveOrcaDestroy({ G, ctx, playerID, events }, target);
    }
  }

  if (G.sealBombResolution?.playerID === playerID) {
    const targets = G.sealBombResolution.validTargetCardIDs.slice(
      0,
      G.sealBombResolution.requiredDiscardCount
    );
    resolveSealBombExplosion({ G, ctx, playerID }, targets);
  }

  endTurn({ G, ctx, playerID, events });

  G.botActivity = {
    playerID,
    startedAt: botActivity.startedAt,
    completedAt: Date.now()
  };
}

export const FrozenGuild: Game<FrozenGuildState> = {
  name: "frozen-guild",
  setup: ({ ctx }, setupData) =>
    createInitialState(ctx.numPlayers, Math.random, readSetupData(setupData)),
  turn: {
    onBegin: ({ G, ctx, events, random }) => {
      resetTurnState(G);
      setBombAtTurnStart(G, ctx.currentPlayer);
      const botActivity = ensureBotActivity(G);

      if (!isBotPlayer(G, ctx.currentPlayer)) {
        const completedAt = botActivity.completedAt;
        if (completedAt !== null && Date.now() - completedAt > 2000) {
          G.botActivity = {
            playerID: null,
            startedAt: null,
            completedAt: null
          };
        }
      }

      if (isBotPlayer(G, ctx.currentPlayer)) {
        runBasicBotTurn({ G, ctx, events, random });
      }
    },
    onEnd: ({ G, ctx }) => {
      const player = G.players[ctx.currentPlayer];
      if (player) {
        player.hasBombAtEnd = player.zone.some((cardID) => isSealBombCard(cardID));
      }
    }
  },
  moves: {
    rollDice,
    fishFromIce,
    spyOnIce,
    completeSpy,
    spyGiveCard,
    swapCards,
    choosePadrinoAction,
    resolveOrcaDestroy,
    resolveSealBombExplosion,
    endTurn,
    setTableActive,
    markPlayerDisconnected,
    markPlayerReconnected
  },
  playerView: ({ G, playerID }) => buildPlayerView(G, playerID)
};
