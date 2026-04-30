import type { FrozenGuildUiStore } from "./frozenGuildStore.js";
import type { SwapLocation } from "../../../shared/game/types.js";

const EMPTY_LEDGER: Array<{ id: string; name: string; score: number; cards: number; cardIDs: string[] }> = [];
const EMPTY_UNSTABLE: Array<{ id: string; name: string; status: "reconnecting" | "absent"; disconnectSeconds: number | null }> = [];

type PlayersMap = NonNullable<FrozenGuildUiStore["G"]>["players"];

let lastPlayersRefForLedger: PlayersMap | null | undefined;
let lastPlayersRefForUnstable: PlayersMap | null | undefined;
let lastLedger = EMPTY_LEDGER;
let lastUnstable = EMPTY_UNSTABLE;

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
    return null;
  }
  return {
    orcaCardID: pending.orcaCardID,
    validTargetCardIDs: pending.validTargetCardIDs
  };
}

export function selectSealBombResolutionView(state: FrozenGuildUiStore) {
  const pending = state.G?.sealBombResolution;
  if (!pending || !state.localPlayerID || pending.playerID !== state.localPlayerID) {
    return null;
  }
  return {
    bombCardID: pending.bombCardID,
    validTargetCardIDs: pending.validTargetCardIDs,
    requiredDiscardCount: pending.requiredDiscardCount
  };
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
