import type { FrozenGuildUiStore } from "./frozenGuildStore.js";

const EMPTY_LEDGER: Array<{ id: string; name: string; score: number; cards: number }> = [];
const EMPTY_UNSTABLE: Array<{ id: string; name: string; status: "reconnecting" | "absent" }> = [];

type PlayersMap = NonNullable<FrozenGuildUiStore["G"]>["players"];

let lastPlayersRefForLedger: PlayersMap | null | undefined;
let lastPlayersRefForUnstable: PlayersMap | null | undefined;
let lastLedger = EMPTY_LEDGER;
let lastUnstable = EMPTY_UNSTABLE;

export function selectIsMyTurn(state: FrozenGuildUiStore): boolean {
  if (!state.ctx || !state.localPlayerID) {
    return false;
  }
  return state.ctx.currentPlayer === state.localPlayerID;
}

export function selectDiceView(state: FrozenGuildUiStore) {
  return {
    rolled: !!state.G?.dice.rolled,
    value: state.G?.dice.value ?? null,
    disabled: !selectIsMyTurn(state)
  };
}

export function selectActionBannerView(state: FrozenGuildUiStore) {
  if (!state.G || !state.ctx) {
    return { title: "Sin partida", detail: "Crea o unete a una sala.", severity: "neutral" as const };
  }
  if (!selectIsMyTurn(state)) {
    return {
      title: "Esperando turno",
      detail: `Turno de jugador ${state.ctx.currentPlayer}`,
      severity: "blocked" as const
    };
  }
  return { title: "Tu turno", detail: "Lanza el dado.", severity: "your-turn" as const };
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
    cards: player.zone.length
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
      status: player.connectionStatus === "reconnecting" ? "reconnecting" : "absent"
    }));

  return lastUnstable;
}
