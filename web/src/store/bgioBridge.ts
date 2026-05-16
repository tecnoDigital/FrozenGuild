import type { FrozenGuildState } from "../../../shared/game/types.js";
import { useFrozenGuildStore } from "./frozenGuildStore.js";

type BgioState = {
  G: FrozenGuildState;
  ctx: { currentPlayer: string; turn?: number; gameover?: unknown };
};

export function pushBgioSnapshotToStore(state: BgioState | null, localPlayerID: string | null) {
  const setSnapshot = useFrozenGuildStore.getState().setSnapshot;

  if (!state) {
    setSnapshot({ G: null, ctx: null, gameover: undefined, localPlayerID });
    return;
  }

  setSnapshot({
    G: state.G,
    ctx: {
      currentPlayer: state.ctx.currentPlayer,
      ...(state.ctx.turn !== undefined ? { turn: state.ctx.turn } : {})
    },
    gameover: state.ctx.gameover,
    localPlayerID
  });
}
