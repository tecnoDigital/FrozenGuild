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
  setPlayerProfile,
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

function isDevRuntime(): boolean {
  const mode = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV;
  return mode !== "production";
}

function logBotAutoResolve(reason: string, details: Record<string, unknown>): void {
  if (!isDevRuntime()) {
    return;
  }

  console.warn(`[bot:auto-resolve] ${reason}`, details);
}

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

function botShouldSkipSwapTurn(G: FrozenGuildState): boolean {
  const players = Object.values(G.players);
  return players.length === 2 && players.some((player) => player.zone.length === 0);
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

  const resolvePendingForBot = (stage: "pre-action" | "post-action" | "post-endturn"): boolean => {
    if (G.orcaResolution?.playerID === playerID) {
      const candidates = [...G.orcaResolution.validTargetCardIDs];
      const target = randomPick(candidates, randomFn);
      if (!target) {
        logBotAutoResolve("ORCA_NO_TARGET", {
          stage,
          playerID,
          pending: G.orcaResolution,
          validTargetCardIDs: candidates
        });
        return false;
      }

      const result = resolveOrcaDestroy({ G, ctx, playerID, events }, target);
      if (result === INVALID_MOVE) {
        logBotAutoResolve("ORCA_RESOLVE_INVALID_MOVE", {
          stage,
          playerID,
          target,
          pending: G.orcaResolution,
          validTargetCardIDs: candidates
        });
        return false;
      }
    }

    if (G.sealBombResolution?.playerID === playerID) {
      const candidates = [...G.sealBombResolution.validTargetCardIDs];
      const selected: string[] = [];
      while (
        selected.length < G.sealBombResolution.requiredDiscardCount &&
        candidates.length > 0
      ) {
        const chosen = randomPick(candidates, randomFn);
        if (!chosen) {
          break;
        }
        selected.push(chosen);
        const selectedIndex = candidates.indexOf(chosen);
        if (selectedIndex >= 0) {
          candidates.splice(selectedIndex, 1);
        }
      }

      const result = resolveSealBombExplosion({ G, ctx, playerID }, selected);
      if (result === INVALID_MOVE) {
        logBotAutoResolve("SEAL_BOMB_RESOLVE_INVALID_MOVE", {
          stage,
          playerID,
          targets: selected,
          pending: G.sealBombResolution,
          validTargetCardIDs: G.sealBombResolution.validTargetCardIDs,
          requiredDiscardCount: G.sealBombResolution.requiredDiscardCount
        });
        return false;
      }
    }

    return true;
  };

  const hasBlockingPending =
    G.pendingStage !== null || G.orcaResolution !== null || G.sealBombResolution !== null;

  if (hasBlockingPending && !resolvePendingForBot("pre-action")) {
    return;
  }

  if (G.pendingStage !== null || G.orcaResolution !== null || G.sealBombResolution !== null) {
    logBotAutoResolve("PENDING_NOT_RESOLVED_BEFORE_ACTION", {
      playerID,
      pendingStage: G.pendingStage,
      orcaResolution: G.orcaResolution,
      sealBombResolution: G.sealBombResolution
    });
    return;
  }

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
      const fishResult = fishFromIce({ G, ctx, playerID, events }, slot);
      if (fishResult === INVALID_MOVE) {
        console.log("[bot:fishFromIce:INVALID_MOVE]", {
          playerID,
          currentPlayer: ctx.currentPlayer,
          slot,
          fishableSlots,
          dice: G.dice,
          turn: G.turn,
          pendingStage: G.pendingStage,
          orcaResolution: G.orcaResolution,
          sealBombResolution: G.sealBombResolution,
          iceGrid: G.iceGrid,
          deckLength: G.deck.length
        });
      }
    } else {
      console.log("[bot:no-fishable-slot]", {
        playerID,
        currentPlayer: ctx.currentPlayer,
        action,
        dice: G.dice,
        turn: G.turn,
        iceGrid: G.iceGrid,
        deckLength: G.deck.length
      });
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
    if (botShouldSkipSwapTurn(G)) {
      // Isolated 2-player edge case: one hand is empty, so swap cannot execute.
      // Let endTurn run and close the turn cleanly.
    } else {
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
  }

  if (!resolvePendingForBot("post-action")) {
    return;
  }

const firstEndTurnResult = endTurn({ G, ctx, playerID, events });
  if (firstEndTurnResult === INVALID_MOVE) {
    logBotAutoResolve("END_TURN_INVALID_MOVE", {
      playerID,
      pendingStage: G.pendingStage,
      orcaResolution: G.orcaResolution,
      sealBombResolution: G.sealBombResolution,
      dice: G.dice,
      turn: G.turn
    });
    return;
  }

  const bombTriggeredAfterEndTurn = Boolean(G.sealBombResolution) && (G.sealBombResolution as unknown as { playerID: string }).playerID === playerID;
  if (bombTriggeredAfterEndTurn) {
    if (!resolvePendingForBot("post-endturn")) {
      return;
    }

    const secondEndTurnResult = endTurn({ G, ctx, playerID, events });
    if (secondEndTurnResult === INVALID_MOVE) {
      logBotAutoResolve("END_TURN_AFTER_SEAL_INVALID_MOVE", {
        playerID,
        pendingStage: G.pendingStage,
        orcaResolution: G.orcaResolution,
        sealBombResolution: G.sealBombResolution,
        dice: G.dice,
        turn: G.turn
      });
      return;
    }
  }

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
    setPlayerProfile,
    endTurn,
    setTableActive,
    markPlayerDisconnected,
    markPlayerReconnected
  },
  playerView: ({ G, playerID }) => buildPlayerView(G, playerID)
};
