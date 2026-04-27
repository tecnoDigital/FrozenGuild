import { useEffect, useMemo, useState } from "react";
import { getCardById } from "../../shared/game/cards";
import { calculateFinalScores } from "../../shared/game/scoring";
import { createFrozenGuildClient } from "./boardgame/client";
import type { FrozenGuildState } from "../../shared/game/types";

type LobbySession = {
  matchID: string;
  playerID: string;
  credentials: string;
  playerName: string;
};

type MatchListResponse = {
  matches: Array<{ matchID: string }>;
};

type SwapDraft = {
  playerID: string;
  cardID: string;
};

type SelfTestResult = {
  label: string;
  ok: boolean;
  details: string;
};

type ConnectionStatus = FrozenGuildState["players"][string]["connectionStatus"];
type ClientSocketStatus = "connecting" | "connected" | "disconnected";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000";
const RECONNECT_ESTIMATE_MS = 30_000;

function formatCard(cardId: unknown): string {
  if (!cardId) {
    return "Vacio";
  }

  if (typeof cardId === "object" && cardId !== null && "hidden" in cardId) {
    return "Oculta";
  }

  if (typeof cardId !== "string") {
    return "Oculta";
  }

  const card = getCardById(cardId);
  if (!card) {
    return cardId;
  }

  const labels = {
    penguin: "Pinguino",
    walrus: "Morsa",
    petrel: "Petrel",
    sea_elephant: "Elefante marino",
    krill: "Krill",
    orca: "Orca",
    seal_bomb: "Foca-bomba"
  } as const;

  const base = labels[card.type] ?? card.type;
  return card.type === "penguin" && card.value ? `${base} ${card.value}` : base;
}

function isFishingTurn(G: FrozenGuildState): boolean {
  return G.dice.rolled && G.dice.value !== null && G.dice.value >= 1 && G.dice.value <= 3;
}

function isSwapTurn(G: FrozenGuildState): boolean {
  return G.dice.rolled && G.dice.value === 5;
}

function runSelfTests(G: FrozenGuildState): SelfTestResult[] {
  const iceCards = G.iceGrid.filter((cardId): cardId is string => typeof cardId === "string");
  const zoneCards = Object.values(G.players).flatMap((player) => player.zone);
  const knownCards = [...iceCards, ...zoneCards, ...G.deck, ...G.discardPile];
  const uniqueCards = new Set(knownCards);

  const swapReadyPlayers = Object.values(G.players).filter((player) => player.zone.length > 0).length;
  const reconnectingCount = Object.values(G.players).filter(
    (player) => player.connectionStatus === "reconnecting"
  ).length;
  const queuedTurnSkips = G.autoResolveQueue.filter((item) => item.stageType === "TURN_SKIP").length;

  return [
    {
      label: "El Hielo tiene 9 slots",
      ok: G.iceGrid.length === 9,
      details: `slots=${G.iceGrid.length}`
    },
    {
      label: "No hay IDs duplicados en estado visible",
      ok: uniqueCards.size === knownCards.length,
      details: `unicos=${uniqueCards.size} total=${knownCards.length}`
    },
    {
      label: "Zonas sin cartas ocultas",
      ok: Object.values(G.players).every((player) => player.zone.every((cardId) => typeof cardId === "string")),
      details: "todas las cartas de zona son strings"
    },
    {
      label: "Intercambio tiene objetivo posible",
      ok: !isSwapTurn(G) || swapReadyPlayers >= 2,
      details: `jugadores-con-cartas=${swapReadyPlayers}`
    },
    {
      label: "Cola TURN_SKIP consistente",
      ok: queuedTurnSkips >= reconnectingCount,
      details: `reconnecting=${reconnectingCount} queue-turn-skip=${queuedTurnSkips}`
    },
    {
      label: "Mesa pausada congela timers",
      ok: G.activeTable || reconnectingCount === 0 || queuedTurnSkips > 0,
      details: `activeTable=${G.activeTable ? "si" : "no"}`
    }
  ];
}

function formatConnectionStatus(status: ConnectionStatus): string {
  if (status === "connected") {
    return "Conectado";
  }

  if (status === "reconnecting") {
    return "Reconectando";
  }

  return "Ausente";
}

function countByStatus(players: FrozenGuildState["players"], status: ConnectionStatus): number {
  return Object.values(players).filter((player) => player.connectionStatus === status).length;
}

function getSocketStatus(args: {
  session: LobbySession | null;
  hasBrowserConnection: boolean;
  gameStateReady: boolean;
  lastServerSyncAt: number | null;
  nowMs: number;
}): ClientSocketStatus {
  const { session, hasBrowserConnection, gameStateReady, lastServerSyncAt, nowMs } = args;

  if (!session || !hasBrowserConnection) {
    return "disconnected";
  }

  if (!gameStateReady || lastServerSyncAt === null) {
    return "connecting";
  }

  if (nowMs - lastServerSyncAt > 7_000) {
    return "disconnected";
  }

  return "connected";
}

function formatSocketStatus(status: ClientSocketStatus): string {
  if (status === "connected") {
    return "Conectado";
  }

  if (status === "connecting") {
    return "Conectando";
  }

  return "Desconectado";
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`pill pill--status pill--status-${status}`}>
      {formatConnectionStatus(status)}
    </span>
  );
}

export function App() {
  const [playerName, setPlayerName] = useState("Jugador");
  const [numPlayers, setNumPlayers] = useState(2);
  const [matchIDInput, setMatchIDInput] = useState("");
  const [joinPlayerID, setJoinPlayerID] = useState("0");
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedJoinMatchID, setSelectedJoinMatchID] = useState("");
  const [session, setSession] = useState<LobbySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [swapDraft, setSwapDraft] = useState<SwapDraft | null>(null);
  const [selfTestResults, setSelfTestResults] = useState<SelfTestResult[]>([]);
  const [hasBrowserConnection, setHasBrowserConnection] = useState<boolean>(() => navigator.onLine);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [lastServerSyncAt, setLastServerSyncAt] = useState<number | null>(null);
  const [gameState, setGameState] = useState<{
    G: FrozenGuildState;
    currentPlayer: string;
    gameover?: unknown;
  } | null>(null);

  const client = useMemo(() => {
    if (!session) {
      return null;
    }

    return createFrozenGuildClient({
      serverUrl: SERVER_URL,
      matchID: session.matchID,
      playerID: session.playerID,
      credentials: session.credentials
    });
  }, [session]);

  useEffect(() => {
    const online = () => setHasBrowserConnection(true);
    const offline = () => setHasBrowserConnection(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    const ticker = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    client.start();
    const unsubscribe = client.subscribe(() => {
      const state = client.getState();
      if (!state) {
        return;
      }

      setLastServerSyncAt(Date.now());
      setGameState({
        G: state.G,
        currentPlayer: state.ctx.currentPlayer,
        gameover: state.ctx.gameover
      });
    });

    const initial = client.getState();
    if (initial) {
      setLastServerSyncAt(Date.now());
      setGameState({
        G: initial.G,
        currentPlayer: initial.ctx.currentPlayer,
        gameover: initial.ctx.gameover
      });
    }

    return () => {
      unsubscribe();
      client.stop();
      setGameState(null);
      setLastServerSyncAt(null);
    };
  }, [client]);

  useEffect(() => {
    if (!client || !session) {
      return;
    }

    client.moves?.markPlayerReconnected?.(Date.now());

    const ticker = window.setInterval(() => {
      client.moves?.processAutoResolve?.(Date.now());
    }, 1000);

    const onBeforeUnload = () => {
      client.moves?.markPlayerDisconnected?.(Date.now());
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(ticker);
      client.moves?.markPlayerDisconnected?.(Date.now());
    };
  }, [client, session]);

  async function refreshMatches() {
    try {
      const response = await fetch(`${SERVER_URL}/games/frozen-guild`);
      if (!response.ok) {
        throw new Error(`No se pudo listar partidas (${response.status}).`);
      }

      const payload = (await response.json()) as MatchListResponse;
      const listed = payload.matches.map((match) => match.matchID);
      setMatches(listed);
      if (!selectedJoinMatchID && listed.length > 0) {
        const firstMatch = listed[0];
        if (firstMatch) {
          setSelectedJoinMatchID(firstMatch);
        }
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error listando partidas.");
    }
  }

  async function createMatch() {
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(`${SERVER_URL}/games/frozen-guild/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numPlayers })
      });

      if (!response.ok) {
        throw new Error(`No se pudo crear la partida (${response.status}).`);
      }

      const payload = (await response.json()) as { matchID: string };
      setMatchIDInput(payload.matchID);
      setSelectedJoinMatchID(payload.matchID);
      await refreshMatches();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Error creando partida.");
    } finally {
      setIsBusy(false);
    }
  }

  async function joinMatch() {
    const targetMatchID = (matchIDInput || selectedJoinMatchID).trim();
    if (!targetMatchID) {
      setError("Debes seleccionar o escribir un Match ID.");
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(`${SERVER_URL}/games/frozen-guild/${targetMatchID}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerID: joinPlayerID,
          playerName: playerName.trim() || "Jugador"
        })
      });

      if (!response.ok) {
        throw new Error(`No se pudo unir a la partida (${response.status}).`);
      }

      const payload = (await response.json()) as {
        playerID: string;
        playerCredentials: string;
      };

      setSession({
        matchID: targetMatchID,
        playerID: payload.playerID,
        credentials: payload.playerCredentials,
        playerName: playerName.trim() || "Jugador"
      });
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Error al unirse.");
    } finally {
      setIsBusy(false);
    }
  }

  function leaveMatch() {
    setSession(null);
    setGameState(null);
    setLastServerSyncAt(null);
  }

  function retryConnection() {
    if (!client) {
      return;
    }

    client.stop();
    client.start();
    setLastServerSyncAt(null);
  }

  const myTurn = !!session && !!gameState && gameState.currentPlayer === session.playerID;
  const fishingTurn = !!gameState && isFishingTurn(gameState.G);
  const tableActive = !!gameState && gameState.G.activeTable;
  const swapTurn =
    !!gameState &&
    tableActive &&
    myTurn &&
    isSwapTurn(gameState.G) &&
    !gameState.G.turn.actionCompleted;
  const socketStatus = getSocketStatus({
    session,
    hasBrowserConnection,
    gameStateReady: !!gameState,
    lastServerSyncAt,
    nowMs
  });
  const isDev = import.meta.env.DEV;

  const actionDisabledReason = !session || !gameState
    ? "Unete a una partida para jugar."
    : !tableActive
      ? "Mesa en pausa. No corren timers."
      : !myTurn
        ? `No es tu turno. Juega el jugador ${gameState.currentPlayer}.`
        : null;

  const rollDisabledReason = !session || !gameState
    ? "Unete a una partida para jugar."
    : !tableActive
      ? "Mesa en pausa. No corren timers."
      : !myTurn
        ? "Espera tu turno para tirar el dado."
        : gameState.G.dice.rolled
          ? "Ya tiraste el dado en este turno."
          : null;

  const endTurnDisabledReason = !session || !gameState
    ? "Unete a una partida para jugar."
    : !tableActive
      ? "Mesa en pausa. No corren timers."
      : !myTurn
        ? "Espera tu turno para finalizar."
        : !gameState.G.dice.rolled
          ? "Primero tira el dado."
          : fishingTurn && !gameState.G.turn.actionCompleted
            ? "Debes pescar antes de finalizar."
            : isSwapTurn(gameState.G) && !gameState.G.turn.actionCompleted
              ? "Debes intercambiar antes de finalizar."
              : null;

  const actionMessage = !session || !gameState
    ? "Unete a una partida para empezar."
    : !tableActive
      ? "Mesa en pausa. No corren timers."
      : !myTurn
        ? `Esperando al jugador ${gameState.currentPlayer}.`
        : !gameState.G.dice.rolled
          ? "Tu accion actual: tirar dado."
          : fishingTurn && !gameState.G.turn.actionCompleted
            ? "Tu accion actual: Pesca. Elige 1 carta de El Hielo."
            : isSwapTurn(gameState.G) && !gameState.G.turn.actionCompleted
              ? "Tu accion actual: Intercambio. Elige 2 cartas de jugadores distintos."
              : gameState.G.turn.actionCompleted
                ? "Accion resuelta. Finaliza el turno."
                : "Accion de dado sin selector en esta version. Puedes finalizar turno.";

  const finalScores = useMemo(() => {
    if (!gameState?.gameover) {
      return [];
    }

    return Object.values(calculateFinalScores(gameState.G.players)).sort((a, b) => b.total - a.total);
  }, [gameState]);

  const leader = finalScores[0] ?? null;

  useEffect(() => {
    if (!swapTurn || !tableActive) {
      setSwapDraft(null);
    }
  }, [swapTurn, tableActive]);

  function onSwapCardClick(targetPlayerID: string, targetCardID: string) {
    if (!swapTurn || !tableActive) {
      return;
    }

    if (!swapDraft) {
      setSwapDraft({ playerID: targetPlayerID, cardID: targetCardID });
      return;
    }

    if (swapDraft.playerID === targetPlayerID && swapDraft.cardID === targetCardID) {
      setSwapDraft(null);
      return;
    }

    if (swapDraft.playerID === targetPlayerID) {
      return;
    }

    client?.moves?.swapCards?.(swapDraft.playerID, swapDraft.cardID, targetPlayerID, targetCardID);
    setSwapDraft(null);
  }

  function runDebugSelfTests() {
    if (!gameState) {
      return;
    }

    setSelfTestResults(runSelfTests(gameState.G));
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Frozen Guild MVP</p>
          <h1>Etapa 21 · Pulido MVP</h1>
          <p className="hero-copy">
            UI lista para demo: estado de conexion, mesa activa/pausada, bloqueos claros por turno
            y resolucion de acciones sin clics invalidos.
          </p>
        </div>

        <div className="creator-card">
          <label className="field-label" htmlFor="player-name">Nombre</label>
          <input
            id="player-name"
            className="select-control"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Jugador"
          />

          <label className="field-label" htmlFor="player-count">Cantidad de jugadores</label>
          <select
            id="player-count"
            className="select-control"
            value={numPlayers}
            onChange={(event) => setNumPlayers(Number(event.target.value))}
          >
            {[1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>

          <button className="primary-button" onClick={createMatch} disabled={isBusy}>Crear partida</button>
          <button className="secondary-button" onClick={refreshMatches} disabled={isBusy}>Actualizar lista</button>

          <label className="field-label" htmlFor="match-id">Match ID</label>
          <input
            id="match-id"
            className="select-control"
            value={matchIDInput}
            onChange={(event) => setMatchIDInput(event.target.value)}
            placeholder="Escribe o selecciona un match"
          />

          {matches.length > 0 && (
            <select
              className="select-control"
              value={selectedJoinMatchID}
              onChange={(event) => {
                setSelectedJoinMatchID(event.target.value);
                setMatchIDInput(event.target.value);
              }}
            >
              {matches.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          )}

          <label className="field-label" htmlFor="join-player-id">Player ID (0-3)</label>
          <select
            id="join-player-id"
            className="select-control"
            value={joinPlayerID}
            onChange={(event) => setJoinPlayerID(event.target.value)}
          >
            {["0", "1", "2", "3"].map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>

          <button className="primary-button" onClick={joinMatch} disabled={isBusy}>Unirme a la partida</button>
          {session && <button className="secondary-button" onClick={leaveMatch}>Salir de la partida</button>}
          <div className="lobby-meta">
            <span className={`pill pill--status pill--socket-${socketStatus}`}>Socket: {formatSocketStatus(socketStatus)}</span>
            {socketStatus === "disconnected" && session && (
              <button className="secondary-button" onClick={retryConnection}>Reintentar</button>
            )}
          </div>
          {session && socketStatus !== "connected" && (
            <p className="helper-copy">
              {socketStatus === "connecting"
                ? "Conectando con el servidor..."
                : "Conexion perdida. Reintenta o espera reconexion."}
            </p>
          )}
          {session && (
            <p className="helper-copy">matchID {session.matchID} · playerID {session.playerID}</p>
          )}
          {error && <p className="helper-copy">{error}</p>}
        </div>
      </section>

      {!session || !gameState ? (
        <section className="panel" style={{ marginTop: 20 }}>
          <p className="panel-copy">Unete a una partida para empezar a jugar.</p>
        </section>
      ) : (
        <section className="panel panel--wide" style={{ marginTop: 20 }}>
          <div className="turn-panel">
            <div className="turn-panel__summary">
              <div>
                <h2>Partida {session.matchID}</h2>
                <p className="panel-copy">
                  Jugando como {session.playerName} · playerID {session.playerID} · turno actual {gameState.currentPlayer}
                </p>
              </div>
              <span className="pill">{myTurn ? "Tu turno" : "Espera"}</span>
            </div>

            {!tableActive && (
              <div className="blocking-banner">
                <strong>Mesa en pausa</strong>
                <p>Mesa en pausa. No corren timers.</p>
              </div>
            )}

            <div className="turn-panel__actions">
              <button className="primary-button" disabled={!!rollDisabledReason} onClick={() => client?.moves?.rollDice?.()}>
                Tirar dado
              </button>
              <button className="secondary-button" disabled={!!endTurnDisabledReason} onClick={() => client?.moves?.endTurn?.()}>
                Finalizar turno
              </button>
            </div>
            {(rollDisabledReason || endTurnDisabledReason) && (
              <p className="disabled-reason">{rollDisabledReason ?? endTurnDisabledReason}</p>
            )}
            <p className="action-hint">{actionMessage}</p>

            <div className="table-status-grid">
              <div className={`table-status-card ${tableActive ? "table-status-card--active" : "table-status-card--paused"}`}>
                <span>Mesa</span>
                <strong>{tableActive ? "Activa" : "Pausada"}</strong>
              </div>
              <div className="table-status-card">
                <span>Connected</span>
                <strong>{countByStatus(gameState.G.players, "connected")}</strong>
              </div>
              <div className="table-status-card">
                <span>Reconnecting</span>
                <strong>{countByStatus(gameState.G.players, "reconnecting")}</strong>
              </div>
              <div className="table-status-card">
                <span>Absent</span>
                <strong>{countByStatus(gameState.G.players, "absent")}</strong>
              </div>
            </div>

            <p className="turn-log">
              Dado: {gameState.G.dice.value ?? "-"} · Pesca obligatoria: {fishingTurn ? "si" : "no"} · Intercambio obligatorio: {isSwapTurn(gameState.G) ? "si" : "no"} · Accion completada: {gameState.G.turn.actionCompleted ? "si" : "no"}
            </p>
            <p className="turn-log turn-log--hint">
              Queue auto-resolve: {gameState.G.autoResolveQueue.length}
            </p>
            {!tableActive && (
              <p className="turn-log turn-log--paused">
                Mesa pausada: acciones bloqueadas y timers congelados.
              </p>
            )}
            {swapTurn && (
              <p className="turn-log turn-log--hint">
                Intercambio: elige carta 1. Luego solo quedaran activas cartas de otro jugador.
              </p>
            )}
            {swapTurn && swapDraft && (
              <p className="turn-log turn-log--hint">
                Carta 1: {swapDraft.cardID} (jugador {swapDraft.playerID}). Elige carta 2 de otro jugador.
              </p>
            )}
          </div>

          <div className="subpanel">
            <h3>El Hielo (3x3)</h3>
            <div className="ice-grid">
              {gameState.G.iceGrid.map((cardId, slot) => {
                const canFish =
                  myTurn &&
                  tableActive &&
                  fishingTurn &&
                  !gameState.G.turn.actionCompleted &&
                  cardId !== null;

                return (
                  <button
                    key={`${slot}-${cardId ?? "empty"}`}
                    className={`ice-slot ${cardId ? "" : "ice-slot--empty"} ${canFish ? "ice-slot--clickable" : ""}`}
                    disabled={!canFish}
                    title={canFish ? "Pescar esta carta" : (actionDisabledReason ?? "No disponible para pesca")}
                    onClick={() => client?.moves?.fishFromIce?.(slot)}
                  >
                    <span className="slot-index">Slot {slot + 1}</span>
                    <strong>{formatCard(cardId)}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="subpanel">
            <h3>Zonas de jugadores</h3>
            <div className="player-grid">
              {Object.entries(gameState.G.players).map(([playerID, player]) => {
                const isSourcePlayer = swapDraft?.playerID === playerID;

                return (
                  <article key={playerID} className={`player-card ${playerID === gameState.currentPlayer ? "player-card--active" : ""}`}>
                    <div className="player-card__header">
                      <h4>{player.name}</h4>
                      <div className="player-card__pills">
                        <span className="pill">id {playerID}</span>
                        <ConnectionBadge status={player.connectionStatus} />
                      </div>
                    </div>
                    {player.connectionStatus === "reconnecting" && (
                      <p className="player-presence-note">
                        Reconectando. Esperando hasta 30s.
                        {typeof player.disconnectStartedAt === "number" && (
                          <span>
                            {" "}(estimado {Math.max(0, Math.ceil((RECONNECT_ESTIMATE_MS - (nowMs - player.disconnectStartedAt)) / 1000))}s)
                          </span>
                        )}
                      </p>
                    )}
                    {player.connectionStatus === "absent" && (
                      <p className="player-presence-note">Ausente. El turno se salta automaticamente.</p>
                    )}
                    <div className="card-list">
                      {player.zone.map((cardId) => {
                        const selected = swapDraft?.playerID === playerID && swapDraft.cardID === cardId;
                        const swapTargetAllowed = !swapDraft || swapDraft.playerID !== playerID;
                        const canClick = swapTurn && (swapTargetAllowed || selected);
                        const shouldDim = swapTurn && !canClick && !selected;
                        const swapDisabledReason = !swapTurn
                          ? (actionDisabledReason ?? "Carta no disponible")
                          : selected
                            ? "Quitar seleccion"
                            : !swapTargetAllowed
                              ? "Elige carta de otro jugador"
                              : null;

                        return (
                          <button
                            key={cardId}
                            type="button"
                            className={`mini-card ${canClick ? "mini-card--clickable" : ""} ${selected ? "mini-card--selected" : ""} ${shouldDim ? "mini-card--dimmed" : ""}`}
                            disabled={!canClick}
                            title={canClick ? "Seleccionar carta para intercambio" : (swapDisabledReason ?? "Carta no disponible")}
                            onClick={() => onSwapCardClick(playerID, cardId)}
                          >
                            <strong>{formatCard(cardId)}</strong>
                            <span className="slot-id">{cardId}</span>
                          </button>
                        );
                      })}
                    </div>
                    {swapTurn && isSourcePlayer && <p className="panel-copy">Origen elegido. Ahora elige carta destino en otro jugador.</p>}
                  </article>
                );
              })}
            </div>
          </div>

          {isDev && (
            <div className="subpanel">
              <div className="selftest-header">
                <h3>Selftest rapido (solo dev)</h3>
                <div className="selftest-actions">
                  <button className="secondary-button" onClick={runDebugSelfTests}>Correr checks</button>
                  <button className="secondary-button" onClick={() => client?.moves?.setTableActive?.(true)}>Activar mesa</button>
                  <button className="secondary-button" onClick={() => client?.moves?.setTableActive?.(false)}>Pausar mesa</button>
                  <button className="secondary-button" onClick={() => client?.moves?.markPlayerDisconnected?.(Date.now())}>Simular desconexion</button>
                  <button className="secondary-button" onClick={() => client?.moves?.markPlayerReconnected?.()}>Simular reconexion</button>
                </div>
              </div>
              {selfTestResults.length === 0 ? (
                <p className="panel-copy">Corre los checks para validar estado y reglas basicas del turno.</p>
              ) : (
                <div className="selftest-list">
                  {selfTestResults.map((result) => (
                    <div key={result.label} className={`selftest-item ${result.ok ? "selftest-item--ok" : "selftest-item--fail"}`}>
                      <strong>{result.ok ? "OK" : "FAIL"}</strong>
                      <span>{result.label}</span>
                      <small>{result.details}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!!gameState.gameover && (
            <div className="subpanel">
              <h3>Resultado final</h3>
              {leader && (
                <p className="panel-copy">Ganador: jugador {leader.playerID} con {leader.total} puntos.</p>
              )}
              <div className="scoreboard-grid">
                {finalScores.map((score) => (
                  <article key={score.playerID} className={`score-card ${leader?.playerID === score.playerID ? "score-card--leader" : ""}`}>
                    <div className="score-card__header">
                      <h4>Jugador {score.playerID}</h4>
                      <div className="score-total">
                        <span>Total</span>
                        <strong>{score.total}</strong>
                      </div>
                    </div>
                    <div className="score-breakdown">
                      <span>Pinguino: {score.breakdown.penguinBase}</span>
                      <span>Bonus morsa: {score.breakdown.walrusBonus}</span>
                      <span>Petrel: {score.breakdown.petrel}</span>
                      <span>Elefante marino: {score.breakdown.seaElephant}</span>
                      <span>Krill: {score.breakdown.krill}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
