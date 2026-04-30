import type { FrozenGuildState } from "../../../shared/game/types.js";
import { useFrozenGuildStore } from "./frozenGuildStore.js";

type BgioState = {
  G: FrozenGuildState;
  ctx: { currentPlayer: string; gameover?: unknown };
};

export function pushBgioSnapshotToStore(state: BgioState | null, localPlayerID: string | null) {
  const setSnapshot = useFrozenGuildStore.getState().setSnapshot;

  if (!state) {
    setSnapshot({ G: null, ctx: null, gameover: undefined, localPlayerID });
    return;
  }

  setSnapshot({
    G: state.G,
    ctx: { currentPlayer: state.ctx.currentPlayer },
    gameover: state.ctx.gameover,
    localPlayerID
  });
}
