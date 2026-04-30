import type { FrozenGuildUiStore } from "../store/frozenGuildStore.js";
import {
  selectCurrentTurnLabel,
  selectDeckCount,
  selectDiscardCount,
  selectLocalPlayerName,
  selectTableActive
} from "../store/selectors.js";

export type GameView = {
  ready: boolean;
  playerName: string;
  turnLabel: string;
  deckCount: number;
  discardCount: number;
  tableStatus: "activa" | "pausada";
};

export function makeGameView(state: FrozenGuildUiStore): GameView {
  return {
    ready: !!state.G,
    playerName: selectLocalPlayerName(state),
    turnLabel: selectCurrentTurnLabel(state),
    deckCount: selectDeckCount(state),
    discardCount: selectDiscardCount(state),
    tableStatus: selectTableActive(state) ? "activa" : "pausada"
  };
}
