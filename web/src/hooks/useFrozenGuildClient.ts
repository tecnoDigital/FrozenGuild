import { useEffect, useMemo, useState } from "react";
import { createFrozenGuildClient } from "../boardgame/client.js";
import { pushBgioSnapshotToStore } from "../store/bgioBridge.js";
import type { FrozenGuildState } from "../../../shared/game/types.js";

type ClientSession = {
  matchID: string;
  playerID: string;
  credentials: string;
};

type ClientState = {
  G: FrozenGuildState;
  currentPlayer: string;
  gameover?: unknown;
};

type UseFrozenGuildClientParams = {
  serverUrl: string;
  session: ClientSession | null;
};

export function useFrozenGuildClient({ serverUrl, session }: UseFrozenGuildClientParams) {
  const [gameState, setGameState] = useState<ClientState | null>(null);

  const client = useMemo(() => {
    if (!session) {
      return null;
    }

    return createFrozenGuildClient({
      serverUrl,
      matchID: session.matchID,
      playerID: session.playerID,
      credentials: session.credentials
    });
  }, [serverUrl, session]);

  useEffect(() => {
    const localPlayerID = session?.playerID ?? null;

    if (!client) {
      pushBgioSnapshotToStore(null, localPlayerID);
      setGameState(null);
      return;
    }

    client.start();
    const unsubscribe = client.subscribe(() => {
      const state = client.getState();
      if (!state) {
        return;
      }

      setGameState({
        G: state.G,
        currentPlayer: state.ctx.currentPlayer,
        gameover: state.ctx.gameover
      });
      pushBgioSnapshotToStore(state, localPlayerID);
    });

    const initial = client.getState();
    if (initial) {
      setGameState({
        G: initial.G,
        currentPlayer: initial.ctx.currentPlayer,
        gameover: initial.ctx.gameover
      });
      pushBgioSnapshotToStore(initial, localPlayerID);
    }

    return () => {
      unsubscribe();
      client.stop();
      setGameState(null);
      pushBgioSnapshotToStore(null, localPlayerID);
    };
  }, [client, session?.playerID]);

  return { client, gameState };
}
