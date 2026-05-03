import type { FrozenGuildUiStore } from "./frozenGuildStore.js";
import type { SwapLocation } from "../../../shared/game/types.js";
import { getCardById } from "../../../shared/game/cards.js";

const EMPTY_LEDGER: Array<{ id: string; name: string; score: number; cards: number; cardIDs: string[] }> = [];
const EMPTY_UNSTABLE: Array<{ id: string; name: string; status: "reconnecting" | "absent"; disconnectSeconds: number | null }> = [];

type PlayersMap = NonNullable<FrozenGuildUiStore["G"]>["players"];
type UiCardType = "penguin" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
type UiCardVariant = "penguin-1" | "penguin-2" | "penguin-3" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";

let lastPlayersRefForLedger: PlayersMap | null | undefined;
let lastPlayersRefForUnstable: PlayersMap | null | undefined;
let lastPlayersRefForOpponents: PlayersMap | null | undefined;
let lastLocalPlayerIDForOpponents: string | null = null;
let lastPlayersRefForOpponentHands: PlayersMap | null | undefined;
let lastLocalPlayerIDForOpponentHands: string | null = null;
let lastPlayersRefForLocalHand: PlayersMap | null | undefined;
let lastLocalPlayerIDForLocalHand: string | null = null;
let lastLedger = EMPTY_LEDGER;
let lastUnstable = EMPTY_UNSTABLE;
let lastOpponents: Array<{ id: string; name: string }> = [];
let lastOpponentHands: Array<{ id: string; handCount: number }> = [];
let lastLocalHand: { playerId: string; cards: Array<{ cardID: string; cardType: "penguin" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb"; variant: "penguin-1" | "penguin-2" | "penguin-3" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb" }> } = {
  playerId: "local",
  cards: []
};
let lastIceGridRefForBoard: NonNullable<FrozenGuildUiStore["G"]>["iceGrid"] | null | undefined;
let lastBoardSlots: Array<{
  slotId: string;
  card?: {
    cardType: "penguin" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
    variant: "penguin-1" | "penguin-2" | "penguin-3" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
  };
}> = [];

function mapCardTypeToUiCardType(type: "penguin" | "walrus" | "petrel" | "sea_elephant" | "krill" | "orca" | "seal_bomb"): UiCardType {
  if (type === "sea_elephant") return "sea-elephant";
  if (type === "seal_bomb") return "seal-bomb";
  return type;
}

function mapCardIdToVariant(cardID: string): UiCardVariant {
  const card = getCardById(cardID);
  if (!card) return "penguin-1";
  if (card.type === "penguin") {
    const fishValue = card.value ?? 1;
    return fishValue === 2 ? "penguin-2" : fishValue === 3 ? "penguin-3" : "penguin-1";
  }
  if (card.type === "sea_elephant") return "sea-elephant";
  if (card.type === "seal_bomb") return "seal-bomb";
  return card.type;
}

let lastCurrentTurnKey = "";
let lastCurrentTurnValue: { currentPlayerName: string; turnCount: number; currentPlayerID: string | null } = {
  currentPlayerName: "Player -",
  turnCount: 0,
  currentPlayerID: null
};

let lastBannerKey = "";
let lastBannerValue: { title: string; detail: string; severity: "neutral" | "your-turn" | "blocked" | "danger" | "success" } = {
  title: "Sin partida",
  detail: "Crea o unete a una sala.",
  severity: "neutral"
};

let lastDiceKey = "";
let lastDiceValue = {
  rolled: false,
  value: null as number | null,
  disabled: true
};

let lastActionFlowKey = "";
let lastActionFlowValue: ActionFlowView = {
  mode: "waiting",
  helperText: "Crea o unete a una partida para empezar.",
  diceValue: null,
  isMyTurn: false,
  canRoll: false,
  canEndTurn: false,
  showPadrinoOptions: false
};

let lastSpyKey = "";
let lastSpyValue: SpyResolutionView | null = null;
let lastOrcaKey = "";
let lastOrcaValue: { orcaCardID: string; validTargetCardIDs: string[] } | null = null;
let lastSealBombKey = "";
let lastSealBombValue: { bombCardID: string; validTargetCardIDs: string[]; requiredDiscardCount: number } | null = null;
let lastGameOverOverlayKey = "";
let lastGameOverOverlayValue: GameOverOverlayView | null = null;

export function selectIsMyTurn(state: FrozenGuildUiStore): boolean {
  if (!state.ctx || !state.localPlayerID) {
    return false;
  }
  return state.ctx.currentPlayer === state.localPlayerID;
}

export function selectDiceView(state: FrozenGuildUiStore) {
  const rolled = !!state.G?.dice.rolled;
  const value = state.G?.dice.value ?? null;
  const disabled = !selectIsMyTurn(state);
  const key = `${rolled}|${value ?? "-"}|${disabled}`;

  if (key === lastDiceKey) {
    return lastDiceValue;
  }

  lastDiceKey = key;
  lastDiceValue = { rolled, value, disabled };
  return lastDiceValue;
}

export function selectActionBannerView(state: FrozenGuildUiStore) {
  let next: { title: string; detail: string; severity: "neutral" | "your-turn" | "blocked" | "danger" | "success" };

  if (!state.G || !state.ctx) {
    next = { title: "Sin partida", detail: "Crea o unete a una sala.", severity: "neutral" };
  } else if (!selectIsMyTurn(state)) {
    next = {
      title: "Esperando turno",
      detail: `Turno de jugador ${state.ctx.currentPlayer}`,
      severity: "blocked"
    };
  } else if (state.G.orcaResolution && state.localPlayerID && state.G.orcaResolution.playerID === state.localPlayerID) {
    next = {
      title: "Orca pendiente",
      detail: "Debes destruir una carta propia para continuar.",
      severity: "danger"
    };
  } else if (state.G.sealBombResolution && state.localPlayerID && state.G.sealBombResolution.playerID === state.localPlayerID) {
    next = {
      title: "Foca-Bomba pendiente",
      detail: "Debes descartar cartas para continuar.",
      severity: "danger"
    };
  } else if (!state.G.dice.rolled) {
    next = { title: "Tu turno", detail: "Lanza el dado.", severity: "your-turn" };
  } else if (state.G.turn.actionCompleted) {
    next = { title: "Accion completada", detail: "Termina tu turno para continuar.", severity: "success" };
  } else {
    const effectiveValue = state.G.dice.value === 6 ? state.G.turn.padrinoAction : state.G.dice.value;
    if (effectiveValue !== null && effectiveValue >= 1 && effectiveValue <= 3) {
      next = { title: "Pesca", detail: "Elige una carta del Hielo.", severity: "your-turn" };
    } else if (effectiveValue === 4) {
      const mySpy = state.G.spy && state.localPlayerID && state.G.spy.playerID === state.localPlayerID ? state.G.spy : null;
      next = mySpy
        ? { title: "Espionaje activo", detail: "Entrega una carta revelada a otro jugador.", severity: "your-turn" }
        : { title: "Espionaje", detail: "Selecciona cartas del Hielo para espiar.", severity: "your-turn" };
    } else if (effectiveValue === 5) {
      next = { title: "Intercambio", detail: "Selecciona origen y destino para intercambiar.", severity: "your-turn" };
    } else {
      next = { title: "Tu turno", detail: "Elige una accion valida.", severity: "your-turn" };
    }
  }

  const key = `${next.title}|${next.detail}|${next.severity}`;
  if (key === lastBannerKey) {
    return lastBannerValue;
  }

  lastBannerKey = key;
  lastBannerValue = next;
  return lastBannerValue;
}

export function selectLocalPlayerName(state: FrozenGuildUiStore): string {
  if (!state.G || !state.localPlayerID) {
    return "Jugador";
  }
  return state.G.players[state.localPlayerID]?.name ?? "Jugador";
}

export function selectDeckCount(state: FrozenGuildUiStore): number {
  return state.G?.deck.length ?? 0;
}

export function selectDiscardCount(state: FrozenGuildUiStore): number {
  return state.G?.discardPile.length ?? 0;
}

export function selectTableActive(state: FrozenGuildUiStore): boolean {
  return !!state.G?.activeTable;
}

export function selectCurrentTurnLabel(state: FrozenGuildUiStore): string {
  return state.ctx?.currentPlayer ?? "-";
}

export function selectRoundBadgeLabel(state: FrozenGuildUiStore): string {
  const round = state.ctx?.turn;
  return typeof round === "number" ? `Round ${round}` : "Round -";
}

export function selectCurrentTurnView(state: FrozenGuildUiStore): {
  currentPlayerName: string;
  turnCount: number;
  currentPlayerID: string | null;
} {
  const currentPlayerID = state.ctx?.currentPlayer ?? null;
  const turnCount = typeof state.ctx?.turn === "number" ? state.ctx.turn : 0;
  const currentPlayerName = currentPlayerID && state.G?.players[currentPlayerID]?.name
    ? state.G.players[currentPlayerID].name
    : "Player -";

  const key = `${currentPlayerID ?? "-"}|${turnCount}|${currentPlayerName}`;
  if (key === lastCurrentTurnKey) {
    return lastCurrentTurnValue;
  }

  lastCurrentTurnKey = key;
  lastCurrentTurnValue = { currentPlayerName, turnCount, currentPlayerID };
  return lastCurrentTurnValue;
}

export function selectOpponentIdentities(state: FrozenGuildUiStore): Array<{ id: string; name: string }> {
  if (!state.G) {
    lastPlayersRefForOpponents = null;
    lastLocalPlayerIDForOpponents = null;
    lastOpponents = [];
    return lastOpponents;
  }

  if (state.G.players === lastPlayersRefForOpponents && state.localPlayerID === lastLocalPlayerIDForOpponents) {
    return lastOpponents;
  }

  lastPlayersRefForOpponents = state.G.players;
  lastLocalPlayerIDForOpponents = state.localPlayerID;
  lastOpponents = Object.entries(state.G.players)
    .filter(([id]) => id !== state.localPlayerID)
    .map(([id, player]) => ({ id, name: player.name }));

  return lastOpponents;
}

export function selectOpponentHandCounts(state: FrozenGuildUiStore): Array<{ id: string; handCount: number }> {
  if (!state.G) {
    lastPlayersRefForOpponentHands = null;
    lastLocalPlayerIDForOpponentHands = null;
    lastOpponentHands = [];
    return lastOpponentHands;
  }

  if (state.G.players === lastPlayersRefForOpponentHands && state.localPlayerID === lastLocalPlayerIDForOpponentHands) {
    return lastOpponentHands;
  }

  lastPlayersRefForOpponentHands = state.G.players;
  lastLocalPlayerIDForOpponentHands = state.localPlayerID;
  lastOpponentHands = Object.entries(state.G.players)
    .filter(([id]) => id !== state.localPlayerID)
    .map(([id, player]) => ({ id, handCount: player.zone.length }));

  return lastOpponentHands;
}

export function selectLocalPlayerHandView(state: FrozenGuildUiStore): {
  playerId: string;
  cards: Array<{
    cardID: string;
    cardType: "penguin" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
    variant: "penguin-1" | "penguin-2" | "penguin-3" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
  }>;
} {
  if (!state.G || !state.localPlayerID) {
    lastPlayersRefForLocalHand = null;
    lastLocalPlayerIDForLocalHand = null;
    lastLocalHand = { playerId: "local", cards: [] };
    return lastLocalHand;
  }

  const localPlayer = state.G.players[state.localPlayerID];
  if (!localPlayer) {
    lastPlayersRefForLocalHand = null;
    lastLocalPlayerIDForLocalHand = null;
    lastLocalHand = { playerId: "local", cards: [] };
    return lastLocalHand;
  }

  if (state.G.players === lastPlayersRefForLocalHand && state.localPlayerID === lastLocalPlayerIDForLocalHand) {
    return lastLocalHand;
  }

  lastPlayersRefForLocalHand = state.G.players;
  lastLocalPlayerIDForLocalHand = state.localPlayerID;
  lastLocalHand = {
    playerId: state.localPlayerID,
    cards: localPlayer.zone.map((cardID) => {
      const card = getCardById(cardID);
      const uiType = card ? mapCardTypeToUiCardType(card.type) : "penguin";
      return {
        cardID,
        cardType: uiType,
        variant: mapCardIdToVariant(cardID)
      };
    })
  };

  return lastLocalHand;
}

export function selectBoardSlotsView(state: FrozenGuildUiStore): Array<{
  slotId: string;
  card?: {
    cardType: "penguin" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
    variant: "penguin-1" | "penguin-2" | "penguin-3" | "walrus" | "petrel" | "sea-elephant" | "krill" | "orca" | "seal-bomb";
  };
}> {
  if (!state.G) {
    lastIceGridRefForBoard = null;
    lastBoardSlots = [];
    return lastBoardSlots;
  }

  if (state.G.iceGrid === lastIceGridRefForBoard) {
    return lastBoardSlots;
  }

  lastIceGridRefForBoard = state.G.iceGrid;
  lastBoardSlots = state.G.iceGrid.map((slot, index) => {
    if (!slot || typeof slot !== "string") {
      return { slotId: `slot-${index + 1}` };
    }

    const card = getCardById(slot);
    if (!card) {
      return { slotId: `slot-${index + 1}` };
    }

    return {
      slotId: `slot-${index + 1}`,
      card: {
        cardType: mapCardTypeToUiCardType(card.type),
        variant: mapCardIdToVariant(slot)
      }
    };
  });

  return lastBoardSlots;
}

export function selectIceGrid(state: FrozenGuildUiStore) {
  return state.G?.iceGrid ?? [];
}

export function selectCanChoosePadrino(state: FrozenGuildUiStore): boolean {
  if (!state.G) {
    return false;
  }
  return state.G.dice.rolled && state.G.dice.value === 6 && state.G.turn.padrinoAction === null;
}

export type ActionFlowView = {
  mode:
    | "waiting"
    | "roll"
    | "fish"
    | "spy"
    | "swap"
    | "padrino"
    | "orca"
    | "seal"
    | "done";
  helperText: string;
  diceValue: number | null;
  isMyTurn: boolean;
  canRoll: boolean;
  canEndTurn: boolean;
  showPadrinoOptions: boolean;
};

export function selectActionButtonsView(flow: ActionFlowView): Array<{ id: string; label: string; disabled?: boolean }> {
  const rollButton = { id: "roll", label: "Roll Dice", disabled: !flow.canRoll };
  const endTurnButton = { id: "end-turn", label: "End Turn", disabled: !flow.canEndTurn };

  if (flow.mode === "padrino") {
    return [
      { id: "padrino-fish", label: "Padrino: Fish", disabled: false },
      { id: "padrino-spy", label: "Padrino: Spy", disabled: false },
      { id: "padrino-swap", label: "Padrino: Swap", disabled: false },
      endTurnButton
    ];
  }

  if (flow.mode === "fish") {
    return [
      { id: "fish", label: "Current: Fish", disabled: true },
      endTurnButton
    ];
  }

  if (flow.mode === "spy") {
    return [
      { id: "spy", label: "Current: Spy", disabled: true },
      endTurnButton
    ];
  }

  if (flow.mode === "swap") {
    return [
      { id: "swap", label: "Current: Swap", disabled: true },
      endTurnButton
    ];
  }

  if (flow.mode === "orca") {
    return [
      { id: "orca", label: "Current: Orca Resolution", disabled: true },
      endTurnButton
    ];
  }

  if (flow.mode === "seal") {
    return [
      { id: "seal", label: "Current: Seal-Bomb Resolution", disabled: true },
      endTurnButton
    ];
  }

  if (flow.mode === "done") {
    return [rollButton, endTurnButton];
  }

  return [rollButton, endTurnButton];
}

export function selectActionFlowView(state: FrozenGuildUiStore): ActionFlowView {
  const diceRolled = !!state.G?.dice.rolled;
  const diceValue = state.G?.dice.value ?? null;
  const isMyTurn = selectIsMyTurn(state);
  const hasOrca = !!(state.G?.orcaResolution && state.localPlayerID && state.G.orcaResolution.playerID === state.localPlayerID);
  const hasSeal = !!(state.G?.sealBombResolution && state.localPlayerID && state.G.sealBombResolution.playerID === state.localPlayerID);

  let next: ActionFlowView;

  if (!state.G || !state.ctx) {
    next = {
      mode: "waiting",
      helperText: "Crea o unete a una partida para empezar.",
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (state.gameover !== undefined) {
    next = {
      mode: "waiting",
      helperText: "Partida terminada.",
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (!state.G.activeTable) {
    next = {
      mode: "waiting",
      helperText: "Mesa pausada. No corren timers.",
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (!isMyTurn) {
    next = {
      mode: "waiting",
      helperText: `Esperando a jugador ${state.ctx.currentPlayer}.`,
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (hasOrca) {
    next = {
      mode: "orca",
      helperText: "Orca pendiente: destruye una carta propia para continuar.",
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (hasSeal) {
    next = {
      mode: "seal",
      helperText: "Foca-Bomba pendiente: descarta cartas para resolver.",
      diceValue,
      isMyTurn,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else if (!diceRolled) {
    next = {
      mode: "roll",
      helperText: "Tu turno: lanza el dado.",
      diceValue,
      isMyTurn,
      canRoll: true,
      canEndTurn: false,
      showPadrinoOptions: false
    };
  } else {
    const actionCompleted = !!state.G.turn.actionCompleted;
    const showPadrinoOptions = selectCanChoosePadrino(state);

    if (showPadrinoOptions) {
      next = {
        mode: "padrino",
        helperText: "El Padrino: elige una accion 1-5.",
        diceValue,
        isMyTurn,
        canRoll: false,
        canEndTurn: false,
        showPadrinoOptions
      };
    } else {
      const effectiveValue = diceValue === 6 ? state.G.turn.padrinoAction : diceValue;

      if (actionCompleted) {
        next = {
          mode: "done",
          helperText: "Accion completada. Termina tu turno.",
          diceValue,
          isMyTurn,
          canRoll: false,
          canEndTurn: true,
          showPadrinoOptions: false
        };
      } else if (effectiveValue !== null && effectiveValue >= 1 && effectiveValue <= 3) {
        next = {
          mode: "fish",
          helperText: "Pesca: elige una carta del Hielo.",
          diceValue,
          isMyTurn,
          canRoll: false,
          canEndTurn: false,
          showPadrinoOptions: false
        };
      } else if (effectiveValue === 4) {
        const mySpy = state.G.spy && state.localPlayerID && state.G.spy.playerID === state.localPlayerID ? state.G.spy : null;
        next = {
          mode: "spy",
          helperText: mySpy ? "Espionaje activo: selecciona una carta vista y regalala." : "Espionaje: elige hasta 3 cartas del Hielo.",
          diceValue,
          isMyTurn,
          canRoll: false,
          canEndTurn: false,
          showPadrinoOptions: false
        };
      } else if (effectiveValue === 5) {
        next = {
          mode: "swap",
          helperText: "Intercambio: elige carta origen y luego destino.",
          diceValue,
          isMyTurn,
          canRoll: false,
          canEndTurn: false,
          showPadrinoOptions: false
        };
      } else {
        next = {
          mode: "waiting",
          helperText: "Esperando accion valida.",
          diceValue,
          isMyTurn,
          canRoll: false,
          canEndTurn: false,
          showPadrinoOptions: false
        };
      }
    }
  }

  const key = [
    next.mode,
    next.helperText,
    next.diceValue ?? "-",
    next.isMyTurn,
    next.canRoll,
    next.canEndTurn,
    next.showPadrinoOptions
  ].join("|");

  if (key === lastActionFlowKey) {
    return lastActionFlowValue;
  }

  lastActionFlowKey = key;
  lastActionFlowValue = next;
  return lastActionFlowValue;
}

export type SwapSelectionView = {
  source: SwapLocation | null;
  target: SwapLocation | null;
  canConfirm: boolean;
  helperText: string;
};

export type SpyResolutionView = {
  active: boolean;
  availableSlots: number[];
  revealedSlots: number[];
  targetPlayerIDs: string[];
};

export function selectSpyResolutionView(state: FrozenGuildUiStore): SpyResolutionView | null {
  if (!state.G || !state.localPlayerID) {
    lastSpyKey = "";
    lastSpyValue = null;
    return null;
  }

  const availableSlots: number[] = [];
  state.G.iceGrid.forEach((slot, index) => {
    if (slot !== null) {
      availableSlots.push(index);
    }
  });

  const activeSpy = state.G.spy && state.G.spy.playerID === state.localPlayerID ? state.G.spy : null;

  const next: SpyResolutionView = {
    active: !!activeSpy,
    availableSlots,
    revealedSlots: activeSpy?.revealedSlots ?? [],
    targetPlayerIDs: Object.keys(state.G.players).filter((playerID) => playerID !== state.localPlayerID)
  };

  const key = [
    next.active,
    next.availableSlots.join(","),
    next.revealedSlots.join(","),
    next.targetPlayerIDs.join(",")
  ].join("|");

  if (key === lastSpyKey && lastSpyValue) {
    return lastSpyValue;
  }

  lastSpyKey = key;
  lastSpyValue = next;
  return lastSpyValue;
}

export function selectOrcaResolutionView(state: FrozenGuildUiStore) {
  const pending = state.G?.orcaResolution;
  if (!pending || !state.localPlayerID || pending.playerID !== state.localPlayerID) {
    lastOrcaKey = "";
    lastOrcaValue = null;
    return null;
  }

  const key = [pending.orcaCardID, pending.validTargetCardIDs.join(",")].join("|");
  if (key === lastOrcaKey && lastOrcaValue) {
    return lastOrcaValue;
  }

  lastOrcaKey = key;
  lastOrcaValue = {
    orcaCardID: pending.orcaCardID,
    validTargetCardIDs: pending.validTargetCardIDs
  };
  return lastOrcaValue;
}

export type GameOverOverlayView = {
  title: string;
  detail: string;
};

export function selectGameOverOverlayView(state: FrozenGuildUiStore): GameOverOverlayView | null {
  if (state.gameover === undefined) {
    lastGameOverOverlayKey = "";
    lastGameOverOverlayValue = null;
    return null;
  }

  const payload = state.gameover as { reason?: unknown } | null;
  const reason = typeof payload?.reason === "string" ? payload.reason : null;

  const key = reason ?? "GENERIC";
  if (key === lastGameOverOverlayKey && lastGameOverOverlayValue) {
    return lastGameOverOverlayValue;
  }

  if (reason === "NO_ICE_CARDS_AVAILABLE") {
    lastGameOverOverlayKey = key;
    lastGameOverOverlayValue = {
      title: "Partida terminada",
      detail: "No quedan cartas en El Hielo."
    };
    return lastGameOverOverlayValue;
  }

  lastGameOverOverlayKey = key;
  lastGameOverOverlayValue = {
    title: "Partida terminada",
    detail: "La partida finalizo."
  };
  return lastGameOverOverlayValue;
}

export function selectSealBombResolutionView(state: FrozenGuildUiStore) {
  const pending = state.G?.sealBombResolution;
  if (!pending || !state.localPlayerID || pending.playerID !== state.localPlayerID) {
    lastSealBombKey = "";
    lastSealBombValue = null;
    return null;
  }

  const key = [
    pending.bombCardID,
    pending.requiredDiscardCount,
    pending.validTargetCardIDs.join(",")
  ].join("|");

  if (key === lastSealBombKey && lastSealBombValue) {
    return lastSealBombValue;
  }

  lastSealBombKey = key;
  lastSealBombValue = {
    bombCardID: pending.bombCardID,
    validTargetCardIDs: pending.validTargetCardIDs,
    requiredDiscardCount: pending.requiredDiscardCount
  };
  return lastSealBombValue;
}

export function selectPlayersLedger(state: FrozenGuildUiStore) {
  if (!state.G) {
    lastPlayersRefForLedger = null;
    lastLedger = EMPTY_LEDGER;
    return lastLedger;
  }

  if (state.G.players === lastPlayersRefForLedger) {
    return lastLedger;
  }

  lastPlayersRefForLedger = state.G.players;
  lastLedger = Object.entries(state.G.players).map(([id, player]) => ({
    id,
    name: player.name,
    score: player.zone.length,
    cards: player.zone.length,
    cardIDs: player.zone
  }));

  return lastLedger;
}

export function selectUnstablePlayers(state: FrozenGuildUiStore) {
  if (!state.G) {
    lastPlayersRefForUnstable = null;
    lastUnstable = EMPTY_UNSTABLE;
    return lastUnstable;
  }

  if (state.G.players === lastPlayersRefForUnstable) {
    return lastUnstable;
  }

  lastPlayersRefForUnstable = state.G.players;
  lastUnstable = Object.entries(state.G.players)
    .filter(([, player]) => player.connectionStatus === "reconnecting" || player.connectionStatus === "absent")
    .map(([id, player]) => ({
      id,
      name: player.name,
      status: player.connectionStatus === "reconnecting" ? "reconnecting" : "absent",
      disconnectSeconds: player.disconnectStartedAt
        ? Math.max(0, Math.floor((Date.now() - player.disconnectStartedAt) / 1000))
        : null
    }));

  return lastUnstable;
}
