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

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000";

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
    if (!client) {
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
    });

    const initial = client.getState();
    if (initial) {
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
    };
  }, [client]);

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
  }

  const myTurn = !!session && !!gameState && gameState.currentPlayer === session.playerID;
  const fishingTurn = !!gameState && isFishingTurn(gameState.G);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Frozen Guild MVP</p>
          <h1>Etapa 8 · Multiplayer base</h1>
          <p className="hero-copy">
            Crea o unete a una partida real con matchID, playerID y credentials. Abre dos navegadores
            para validar turnos entre jugadores.
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

            <div className="turn-panel__actions">
              <button className="primary-button" disabled={!myTurn} onClick={() => client?.moves?.rollDice?.()}>
                Tirar dado
              </button>
              <button className="secondary-button" disabled={!myTurn} onClick={() => client?.moves?.endTurn?.()}>
                Finalizar turno
              </button>
            </div>

            <p className="turn-log">
              Dado: {gameState.G.dice.value ?? "-"} · Pesca obligatoria: {fishingTurn ? "si" : "no"} · Accion completada: {gameState.G.turn.actionCompleted ? "si" : "no"}
            </p>
          </div>

          <div className="subpanel">
            <h3>El Hielo (3x3)</h3>
            <div className="ice-grid">
              {gameState.G.iceGrid.map((cardId, slot) => {
                const canFish =
                  myTurn &&
                  fishingTurn &&
                  !gameState.G.turn.actionCompleted &&
                  cardId !== null;

                return (
                  <button
                    key={`${slot}-${cardId ?? "empty"}`}
                    className={`ice-slot ${cardId ? "" : "ice-slot--empty"} ${canFish ? "ice-slot--clickable" : ""}`}
                    disabled={!canFish}
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
              {Object.entries(gameState.G.players).map(([playerID, player]) => (
                <article key={playerID} className={`player-card ${playerID === gameState.currentPlayer ? "player-card--active" : ""}`}>
                  <div className="player-card__header">
                    <h4>{player.name}</h4>
                    <span className="pill">id {playerID}</span>
                  </div>
                  <div className="card-list">
                    {player.zone.map((cardId) => (
                      <div key={cardId} className="mini-card">
                        <strong>{formatCard(cardId)}</strong>
                        <span className="slot-id">{cardId}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {!!gameState.gameover && (
            <div className="subpanel">
              <h3>Resultado final</h3>
              <div className="scoreboard-grid">
                {Object.values(calculateFinalScores(gameState.G.players)).map((score) => (
                  <article key={score.playerID} className="score-card">
                    <div className="score-card__header">
                      <h4>Jugador {score.playerID}</h4>
                      <div className="score-total">
                        <span>Total</span>
                        <strong>{score.total}</strong>
                      </div>
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
