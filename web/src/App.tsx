import { useEffect, useMemo, useState } from "react";
import { getCardById } from "../../shared/game/cards.js";
import { calculateFinalScores } from "../../shared/game/scoring.js";
import { createFrozenGuildClient } from "./boardgame/client.js";
import type { FrozenGuildState, SwapLocation } from "../../shared/game/types.js";

type LobbySession = {
  matchID: string;
  playerID: string;
  credentials: string;
  playerName: string;
};

type AdminPlayerID = "0" | "1";

type AdminPlayerSession = {
  playerID: AdminPlayerID;
  credentials: string;
  playerName: string;
};

type AdminDualSession = {
  matchID: string;
  players: Record<AdminPlayerID, AdminPlayerSession>;
};

type MatchListResponse = {
  matches: Array<{ matchID: string }>;
};

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000");

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
  if (!G.dice.rolled || G.dice.value === null) {
    return false;
  }

  if (G.dice.value >= 1 && G.dice.value <= 3) {
    return true;
  }

  return G.dice.value === 6 && G.turn.padrinoAction !== null && G.turn.padrinoAction >= 1 && G.turn.padrinoAction <= 3;
}

function isSpyTurn(G: FrozenGuildState): boolean {
  return G.dice.rolled && (G.dice.value === 4 || (G.dice.value === 6 && G.turn.padrinoAction === 4));
}

function isSwapTurn(G: FrozenGuildState): boolean {
  return G.dice.rolled && (G.dice.value === 5 || (G.dice.value === 6 && G.turn.padrinoAction === 5));
}

function isPadrinoSelectionPending(G: FrozenGuildState): boolean {
  return G.dice.rolled && G.dice.value === 6 && G.turn.padrinoAction === null;
}

function hasOrcaPendingForPlayer(G: FrozenGuildState, playerID?: string): boolean {
  return !!playerID && !!G.orcaResolution && G.orcaResolution.playerID === playerID;
}

function hasSealBombPendingForPlayer(G: FrozenGuildState, playerID?: string): boolean {
  return !!playerID && !!G.sealBombResolution && G.sealBombResolution.playerID === playerID;
}

function sameSwapLocation(a: SwapLocation | null, b: SwapLocation): boolean {
  if (!a) {
    return false;
  }

  if (a.area !== b.area) {
    return false;
  }

  if (a.area === "ice_grid" && b.area === "ice_grid") {
    return a.slot === b.slot;
  }

  if (a.area === "player_zone" && b.area === "player_zone") {
    return a.playerID === b.playerID && a.index === b.index;
  }

  return false;
}

export function App() {
  const [playerName, setPlayerName] = useState("Jugador");
  const [numPlayers, setNumPlayers] = useState(2);
  const [selectedBotPlayerIDs, setSelectedBotPlayerIDs] = useState<string[]>([]);
  const [botPulseNow, setBotPulseNow] = useState(() => Date.now());
  const [matchIDInput, setMatchIDInput] = useState("");
  const [joinPlayerID, setJoinPlayerID] = useState("0");
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedJoinMatchID, setSelectedJoinMatchID] = useState("");
  const [session, setSession] = useState<LobbySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [selectedSpySlots, setSelectedSpySlots] = useState<number[]>([]);
  const [selectedSpyGiftSlot, setSelectedSpyGiftSlot] = useState<number | null>(null);
  const [spyGiftTarget, setSpyGiftTarget] = useState("1");
  const [swapSource, setSwapSource] = useState<SwapLocation | null>(null);
  const [swapTarget, setSwapTarget] = useState<SwapLocation | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<AdminDualSession | null>(null);
  const [adminState, setAdminState] = useState<
    Record<AdminPlayerID, { G: FrozenGuildState; currentPlayer: string; gameover?: unknown } | null>
  >({
    "0": null,
    "1": null
  });
  const [adminFishSlot, setAdminFishSlot] = useState<Record<AdminPlayerID, number>>({
    "0": 0,
    "1": 0
  });
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

  const adminClient0 = useMemo(() => {
    if (!adminSession) {
      return null;
    }

    return createFrozenGuildClient({
      serverUrl: SERVER_URL,
      matchID: adminSession.matchID,
      playerID: "0",
      credentials: adminSession.players["0"].credentials
    });
  }, [adminSession]);

  const adminClient1 = useMemo(() => {
    if (!adminSession) {
      return null;
    }

    return createFrozenGuildClient({
      serverUrl: SERVER_URL,
      matchID: adminSession.matchID,
      playerID: "1",
      credentials: adminSession.players["1"].credentials
    });
  }, [adminSession]);

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

  useEffect(() => {
    if (!adminClient0) {
      setAdminState((current) => ({ ...current, "0": null }));
      return;
    }

    adminClient0.start();
    const unsubscribe = adminClient0.subscribe(() => {
      const state = adminClient0.getState();
      if (!state) {
        return;
      }

      setAdminState((current) => ({
        ...current,
        "0": {
          G: state.G,
          currentPlayer: state.ctx.currentPlayer,
          gameover: state.ctx.gameover
        }
      }));
    });

    return () => {
      unsubscribe();
      adminClient0.stop();
      setAdminState((current) => ({ ...current, "0": null }));
    };
  }, [adminClient0]);

  useEffect(() => {
    if (!adminClient1) {
      setAdminState((current) => ({ ...current, "1": null }));
      return;
    }

    adminClient1.start();
    const unsubscribe = adminClient1.subscribe(() => {
      const state = adminClient1.getState();
      if (!state) {
        return;
      }

      setAdminState((current) => ({
        ...current,
        "1": {
          G: state.G,
          currentPlayer: state.ctx.currentPlayer,
          gameover: state.ctx.gameover
        }
      }));
    });

    return () => {
      unsubscribe();
      adminClient1.stop();
      setAdminState((current) => ({ ...current, "1": null }));
    };
  }, [adminClient1]);

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
        body: JSON.stringify({
          numPlayers,
          setupData: {
            botPlayerIDs: selectedBotPlayerIDs
          }
        })
      });

      if (!response.ok) {
        throw new Error(`No se pudo crear la partida (${response.status}).`);
      }

      const payload = (await response.json()) as { matchID: string };

      const parsedBotIDs = selectedBotPlayerIDs
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value < numPlayers)
        .map((value) => String(value));

      for (const botPlayerID of parsedBotIDs) {
        const botJoin = await fetch(`${SERVER_URL}/games/frozen-guild/${payload.matchID}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerID: botPlayerID,
            playerName: `BOT ${botPlayerID}`
          })
        });

        if (!botJoin.ok && botJoin.status !== 409) {
          throw new Error(`No se pudo unir BOT ${botPlayerID} (${botJoin.status}).`);
        }
      }

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

  async function joinPlayerForAdmin(matchID: string, playerID: AdminPlayerID, playerName: string) {
    const response = await fetch(`${SERVER_URL}/games/frozen-guild/${matchID}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerID,
        playerName
      })
    });

    if (!response.ok) {
      throw new Error(`No se pudo unir jugador ${playerID} (${response.status}).`);
    }

    const payload = (await response.json()) as {
      playerID: string;
      playerCredentials: string;
    };

    return {
      playerID,
      credentials: payload.playerCredentials,
      playerName
    } satisfies AdminPlayerSession;
  }

  async function createAndControlTwoPlayers() {
    setAdminBusy(true);
    setAdminError(null);

    try {
      const createResponse = await fetch(`${SERVER_URL}/games/frozen-guild/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numPlayers: Math.max(2, numPlayers) })
      });

      if (!createResponse.ok) {
        throw new Error(`No se pudo crear la partida admin (${createResponse.status}).`);
      }

      const created = (await createResponse.json()) as { matchID: string };
      const matchID = created.matchID;

      const player0 = await joinPlayerForAdmin(matchID, "0", "Admin Player 0");
      const player1 = await joinPlayerForAdmin(matchID, "1", "Admin Player 1");

      setAdminSession({
        matchID,
        players: {
          "0": player0,
          "1": player1
        }
      });

      setMatchIDInput(matchID);
      setSelectedJoinMatchID(matchID);
      await refreshMatches();
    } catch (adminCreateError) {
      setAdminError(
        adminCreateError instanceof Error ? adminCreateError.message : "Error creando control dual."
      );
    } finally {
      setAdminBusy(false);
    }
  }

  async function attachTwoPlayersToExistingMatch() {
    const targetMatchID = (matchIDInput || selectedJoinMatchID).trim();
    if (!targetMatchID) {
      setAdminError("Debes seleccionar un Match ID para control dual.");
      return;
    }

    setAdminBusy(true);
    setAdminError(null);

    try {
      const player0 = await joinPlayerForAdmin(targetMatchID, "0", "Admin Player 0");
      const player1 = await joinPlayerForAdmin(targetMatchID, "1", "Admin Player 1");

      setAdminSession({
        matchID: targetMatchID,
        players: {
          "0": player0,
          "1": player1
        }
      });
    } catch (attachError) {
      setAdminError(
        attachError instanceof Error ? attachError.message : "Error activando control dual en match."
      );
    } finally {
      setAdminBusy(false);
    }
  }

  function leaveMatch() {
    setSession(null);
    setGameState(null);
  }

  function stopAdminControl() {
    setAdminSession(null);
    setAdminState({ "0": null, "1": null });
    setAdminError(null);
  }

  function toggleSpySlot(slot: number) {
    setSelectedSpySlots((current) => {
      if (current.includes(slot)) {
        return current.filter((value) => value !== slot);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, slot];
    });
  }

  function selectSwapLocation(location: SwapLocation) {
    if (!swapSource || sameSwapLocation(swapSource, location)) {
      setSwapSource(location);
      if (swapTarget && sameSwapLocation(swapTarget, location)) {
        setSwapTarget(null);
      }
      return;
    }

    if (!swapTarget || sameSwapLocation(swapTarget, location)) {
      setSwapTarget(location);
      return;
    }

    setSwapSource(location);
    setSwapTarget(null);
  }

  const myTurn = !!session && !!gameState && gameState.currentPlayer === session.playerID;
  const fishingTurn = !!gameState && isFishingTurn(gameState.G);
  const spyTurn = !!gameState && isSpyTurn(gameState.G);
  const swapTurn = !!gameState && isSwapTurn(gameState.G);
  const padrinoPending = !!gameState && isPadrinoSelectionPending(gameState.G);
  const orcaPendingForMe = !!session && !!gameState && hasOrcaPendingForPlayer(gameState.G, session.playerID);
  const sealBombPendingForMe =
    !!session && !!gameState && hasSealBombPendingForPlayer(gameState.G, session.playerID);
  const botActivity = gameState?.G.botActivity;
  const recentBotActivityPlayerID =
    botActivity?.playerID &&
    botActivity.completedAt !== null &&
    botPulseNow - botActivity.completedAt < 2200
      ? botActivity.playerID
      : null;
  const spyActive = !!session && !!gameState?.G.spy && gameState.G.spy.playerID === session.playerID;
  const spyTargets = gameState
    ? Object.keys(gameState.G.players).filter((playerID) => playerID !== session?.playerID)
    : [];

  const botCandidateIDs = Array.from({ length: numPlayers }, (_, index) => String(index));

  useEffect(() => {
    setSelectedBotPlayerIDs((current) => current.filter((id) => Number(id) < numPlayers));
  }, [numPlayers]);

  useEffect(() => {
    const timer = window.setInterval(() => setBotPulseNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  function toggleBotPlayerID(playerID: string) {
    setSelectedBotPlayerIDs((current) => {
      if (current.includes(playerID)) {
        return current.filter((id) => id !== playerID);
      }

      return [...current, playerID];
    });
  }

  useEffect(() => {
    if (spyTargets.length === 0) {
      return;
    }

    if (!spyTargets.includes(spyGiftTarget)) {
      const firstTarget = spyTargets[0];
      if (firstTarget) {
        setSpyGiftTarget(firstTarget);
      }
    }
  }, [spyGiftTarget, spyTargets]);

  useEffect(() => {
    setSelectedSpySlots([]);
    setSelectedSpyGiftSlot(null);
  }, [gameState?.G.spy, gameState?.G.dice.value, gameState?.G.turn.actionCompleted]);

  useEffect(() => {
    setSwapSource(null);
    setSwapTarget(null);
  }, [gameState?.G.dice.value, gameState?.G.turn.actionCompleted, gameState?.currentPlayer]);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Frozen Guild MVP</p>
          <h1>Etapa 12 · El Padrino</h1>
          <p className="hero-copy">
            Etapa 22.1: release candidate con bot basico opcional en lobby para llenar asientos.
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

          <label className="field-label">¿Que jugadores entran como BOT?</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {botCandidateIDs.map((id) => {
              const selected = selectedBotPlayerIDs.includes(id);
              return (
                <button
                  key={`bot-${id}`}
                  type="button"
                  className={selected ? "primary-button" : "secondary-button"}
                  onClick={() => toggleBotPlayerID(id)}
                  style={{ minWidth: 86 }}
                >
                  {selected ? `BOT ${id} ✓` : `BOT ${id}`}
                </button>
              );
            })}
          </div>

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

          <hr style={{ borderColor: "rgba(162, 194, 255, 0.25)", width: "100%" }} />
          <h3 style={{ margin: 0 }}>Panel administrador</h3>
          <p className="panel-copy" style={{ marginTop: 0 }}>
            Controla Jugador 0 y Jugador 1 desde esta misma interfaz.
          </p>

          <button className="primary-button" onClick={createAndControlTwoPlayers} disabled={adminBusy}>
            Crear sala + controlar 2 jugadores
          </button>
          <button className="secondary-button" onClick={attachTwoPlayersToExistingMatch} disabled={adminBusy}>
            Adjuntar control dual al match seleccionado
          </button>
          {adminSession && (
            <button className="secondary-button" onClick={stopAdminControl}>
              Cerrar control dual
            </button>
          )}
          {adminError && <p className="helper-copy">{adminError}</p>}

          {adminSession && (
            <div className="subpanel" style={{ width: "100%" }}>
              <h4 style={{ marginTop: 0 }}>Control dual · Match {adminSession.matchID}</h4>
              <div className="player-grid">
                {(["0", "1"] as const).map((adminPlayerID) => {
                  const adminClient = adminPlayerID === "0" ? adminClient0 : adminClient1;
                  const state = adminState[adminPlayerID];
                  const fishSlot = adminFishSlot[adminPlayerID];
                  const isTurn = state?.currentPlayer === adminPlayerID;

                  return (
                    <article key={`admin-${adminPlayerID}`} className={`player-card ${isTurn ? "player-card--active" : ""}`}>
                      <div className="player-card__header">
                        <h4>Jugador {adminPlayerID}</h4>
                        <span className="pill">{isTurn ? "Turno" : "Espera"}</span>
                      </div>
                      <p className="panel-copy">
                        Dado: {state?.G.dice.value ?? "-"} · Padrino: {state?.G.turn.padrinoAction ?? "-"} · Orca: {state?.G.orcaResolution ? "si" : "no"} · Foca-bomba: {state?.G.sealBombResolution ? "si" : "no"} · Accion: {state?.G.turn.actionCompleted ? "si" : "no"}
                      </p>

                      <div className="turn-panel__actions">
                        <button className="primary-button" onClick={() => adminClient?.moves?.rollDice?.()}>
                          Tirar dado
                        </button>
                        <button className="secondary-button" onClick={() => adminClient?.moves?.endTurn?.()}>
                          Finalizar turno
                        </button>
                      </div>

                      <label className="field-label" htmlFor={`admin-fish-slot-${adminPlayerID}`}>Slot pesca (0-8)</label>
                      <input
                        id={`admin-fish-slot-${adminPlayerID}`}
                        className="select-control"
                        type="number"
                        min={0}
                        max={8}
                        value={fishSlot}
                        onChange={(event) => {
                          const raw = Number(event.target.value);
                          const safeSlot = Number.isFinite(raw) ? Math.max(0, Math.min(8, raw)) : 0;
                          setAdminFishSlot((current) => ({ ...current, [adminPlayerID]: safeSlot }));
                        }}
                      />

                      <div className="turn-panel__actions">
                        <button className="secondary-button" onClick={() => adminClient?.moves?.fishFromIce?.(fishSlot)}>
                          Pescar slot
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => adminClient?.moves?.choosePadrinoAction?.(1)}
                        >
                          Padrino accion 1
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            adminClient?.moves?.spyOnIce?.([0]);
                            adminClient?.moves?.completeSpy?.();
                          }}
                        >
                          Resolver espionaje rapido
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            const target = state?.G.orcaResolution?.validTargetCardIDs[0];
                            if (target) {
                              adminClient?.moves?.resolveOrcaDestroy?.(target);
                            }
                          }}
                        >
                          Resolver orca rapida
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            const seal = state?.G.sealBombResolution;
                            if (!seal) {
                              return;
                            }

                            const targets = seal.validTargetCardIDs.slice(0, seal.requiredDiscardCount);
                            if (targets.length === seal.requiredDiscardCount) {
                              adminClient?.moves?.resolveSealBombExplosion?.(targets);
                            }
                          }}
                        >
                          Resolver foca rapida
                        </button>
                      </div>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          adminClient?.moves?.swapCards?.(
                            { area: "player_zone", playerID: adminPlayerID, index: 0 },
                            {
                              area: "player_zone",
                              playerID: adminPlayerID === "0" ? "1" : "0",
                              index: 0
                            }
                          )
                        }
                      >
                        Intercambio rapido (jugador 0 ↔ jugador 1)
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
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
              Dado: {gameState.G.dice.value ?? "-"} · Padrino: {gameState.G.turn.padrinoAction ?? "-"} · Pesca obligatoria: {fishingTurn ? "si" : "no"} · Espionaje obligatorio: {spyTurn ? "si" : "no"} · Intercambio obligatorio: {swapTurn ? "si" : "no"} · Orca pendiente: {gameState.G.orcaResolution ? "si" : "no"} · Foca-bomba pendiente: {gameState.G.sealBombResolution ? "si" : "no"} · Accion completada: {gameState.G.turn.actionCompleted ? "si" : "no"}
            </p>
          </div>

          {orcaPendingForMe && gameState.G.orcaResolution && (
            <div className="subpanel">
              <h3>Resolucion obligatoria · Orca</h3>
              <p className="panel-copy">
                Debes elegir una carta propia para destruir junto con la Orca antes de continuar.
              </p>
              <div className="turn-panel__actions">
                {gameState.G.orcaResolution.validTargetCardIDs.map((cardID) => (
                  <button
                    key={`orca-target-${cardID}`}
                    className="primary-button"
                    onClick={() => client?.moves?.resolveOrcaDestroy?.(cardID)}
                  >
                    Destruir {formatCard(cardID)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sealBombPendingForMe && gameState.G.sealBombResolution && (
            <div className="subpanel">
              <h3>Resolucion obligatoria · Foca-bomba</h3>
              <p className="panel-copy">
                Debes elegir {gameState.G.sealBombResolution.requiredDiscardCount} carta(s) propia(s)
                para descartar junto con la Foca-bomba.
              </p>
              <div className="turn-panel__actions">
                {gameState.G.sealBombResolution.validTargetCardIDs.map((cardID) => (
                  <button
                    key={`seal-target-${cardID}`}
                    className="primary-button"
                    onClick={() => client?.moves?.resolveSealBombExplosion?.([cardID])}
                    disabled={gameState.G.sealBombResolution?.requiredDiscardCount !== 1}
                  >
                    Descartar {formatCard(cardID)}
                  </button>
                ))}
              </div>
              {gameState.G.sealBombResolution.requiredDiscardCount === 2 && (
                <div className="turn-panel__actions">
                  {gameState.G.sealBombResolution.validTargetCardIDs.flatMap((firstCardID, firstIndex) =>
                    gameState.G.sealBombResolution!.validTargetCardIDs
                      .slice(firstIndex + 1)
                      .map((secondCardID) => (
                        <button
                          key={`seal-pair-${firstCardID}-${secondCardID}`}
                          className="secondary-button"
                          onClick={() =>
                            client?.moves?.resolveSealBombExplosion?.([firstCardID, secondCardID])
                          }
                        >
                          {formatCard(firstCardID)} + {formatCard(secondCardID)}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          {myTurn && padrinoPending && !gameState.G.turn.actionCompleted && (
            <div className="subpanel">
              <h3>El Padrino</h3>
              <p className="panel-copy">Elige una accion (1-5) para este turno con dado 6.</p>
              <div className="turn-panel__actions">
                {[1, 2, 3, 4, 5].map((action) => (
                  <button
                    key={`padrino-${action}`}
                    className="primary-button"
                    onClick={() => client?.moves?.choosePadrinoAction?.(action)}
                  >
                    Accion {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {myTurn && spyTurn && !gameState.G.turn.actionCompleted && (
            <div className="subpanel">
              <h3>Espionaje</h3>

              {!spyActive ? (
                <>
                  <p className="panel-copy">
                    Selecciona de 1 a 3 slots para espiar. Solo tu veras esas cartas.
                  </p>
                  <p className="panel-copy">
                    Seleccionados: {selectedSpySlots.length} / 3 (se resaltan en el tablero)
                  </p>
                  <button
                    className="primary-button"
                    disabled={selectedSpySlots.length === 0}
                    onClick={() => client?.moves?.spyOnIce?.(selectedSpySlots)}
                  >
                    Confirmar espionaje
                  </button>
                </>
              ) : (
                <>
                  <p className="panel-copy">
                    Las cartas reveladas se muestran en su posicion original del tablero. Haz clic en una
                    de esas cartas para regalarla.
                  </p>
                  <p className="panel-copy">
                    Slot elegido para regalo: {selectedSpyGiftSlot === null ? "-" : selectedSpyGiftSlot + 1}
                  </p>

                  <label className="field-label" htmlFor="spy-target">Regalar a</label>
                  <select
                    id="spy-target"
                    className="select-control"
                    value={spyGiftTarget}
                    onChange={(event) => setSpyGiftTarget(event.target.value)}
                  >
                    {spyTargets.map((playerID) => (
                      <option key={playerID} value={playerID}>
                        Jugador {playerID}
                      </option>
                    ))}
                  </select>

                  <div className="turn-panel__actions">
                    <button
                      className="primary-button"
                      disabled={selectedSpyGiftSlot === null || spyTargets.length === 0}
                      onClick={() => {
                        if (selectedSpyGiftSlot === null) {
                          return;
                        }

                        client?.moves?.spyGiveCard?.(selectedSpyGiftSlot, spyGiftTarget);
                      }}
                    >
                      Regalar carta vista
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => client?.moves?.completeSpy?.()}
                    >
                      Cerrar espionaje sin regalar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {myTurn && swapTurn && !gameState.G.turn.actionCompleted && (
            <div className="subpanel">
              <h3>Intercambio</h3>
              <p className="panel-copy">
                Selecciona una carta de un jugador y otra carta de otro jugador para intercambiarlas.
              </p>
              <p className="panel-copy">
                Origen: {swapSource ? "seleccionado" : "-"} · Destino: {swapTarget ? "seleccionado" : "-"}
              </p>
              <div className="turn-panel__actions">
                <button
                  className="primary-button"
                  disabled={!swapSource || !swapTarget}
                  onClick={() => {
                    if (!swapSource || !swapTarget) {
                      return;
                    }

                    client?.moves?.swapCards?.(swapSource, swapTarget);
                  }}
                >
                  Ejecutar intercambio
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSwapSource(null);
                    setSwapTarget(null);
                  }}
                >
                  Limpiar seleccion
                </button>
              </div>
            </div>
          )}

          <div className="subpanel">
            <h3>El Hielo (3x3)</h3>
            <div className="ice-grid">
              {gameState.G.iceGrid.map((cardId, slot) => {
                const canFish =
                  myTurn &&
                  fishingTurn &&
                  !gameState.G.turn.actionCompleted &&
                  cardId !== null;
                const canSelectSpySlot =
                  myTurn &&
                  spyTurn &&
                  !gameState.G.turn.actionCompleted &&
                  !spyActive &&
                  cardId !== null;
                const canSelectSpyGiftSlot =
                  myTurn &&
                  spyTurn &&
                  spyActive &&
                  !gameState.G.turn.actionCompleted &&
                  !!gameState.G.spy?.revealedSlots.includes(slot) &&
                  cardId !== null;
                const isSelectedForSpy = selectedSpySlots.includes(slot);
                const isSelectedSpyGiftSlot = selectedSpyGiftSlot === slot;
                const canInteract = canFish || canSelectSpySlot || canSelectSpyGiftSlot;

                return (
                  <button
                    key={`${slot}-${cardId ?? "empty"}`}
                    className={`ice-slot ${cardId ? "" : "ice-slot--empty"} ${(canInteract || isSelectedForSpy || isSelectedSpyGiftSlot) ? "ice-slot--clickable" : ""} ${(isSelectedForSpy || isSelectedSpyGiftSlot) ? "card-choice--selected" : ""}`}
                    disabled={!canInteract}
                    onClick={() => {
                      if (canFish) {
                        client?.moves?.fishFromIce?.(slot);
                        return;
                      }

                      if (canSelectSpySlot) {
                        toggleSpySlot(slot);
                        return;
                      }

                      if (canSelectSpyGiftSlot) {
                        setSelectedSpyGiftSlot(slot);
                        return;
                      }
                    }}
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
                const isBotPlayer = player.name.trim().toUpperCase().startsWith("BOT ");
                const showBotPulse =
                  isBotPlayer &&
                  (playerID === gameState.currentPlayer || recentBotActivityPlayerID === playerID);

                return (
                <article key={playerID} className={`player-card ${playerID === gameState.currentPlayer ? "player-card--active" : ""}`}>
                  <div className="player-card__header">
                    <h4>
                      {player.name}
                      {isBotPlayer && (
                        <span className={`bot-badge ${showBotPulse ? "bot-badge--active" : ""}`}>
                          🤖
                        </span>
                      )}
                    </h4>
                    <span className="pill">id {playerID}</span>
                  </div>
                  <div className="card-list">
                    {player.zone.map((cardId, index) => {
                      const location: SwapLocation = {
                        area: "player_zone",
                        playerID,
                        index
                      };
                      const canSelectSwapCardBase =
                        myTurn &&
                        swapTurn &&
                        !gameState.G.turn.actionCompleted;
                      const mustBeOtherPlayer =
                        !!swapSource &&
                        swapSource.area === "player_zone" &&
                        !sameSwapLocation(swapSource, location);
                      const canSelectSwapCard =
                        canSelectSwapCardBase &&
                        (!swapSource || (mustBeOtherPlayer && swapSource.playerID !== playerID));
                      const isSelectedForSwap =
                        sameSwapLocation(swapSource, location) || sameSwapLocation(swapTarget, location);

                      return (
                        <button
                          key={cardId}
                          className={`mini-card ${canSelectSwapCard || isSelectedForSwap ? "ice-slot--clickable" : ""} ${isSelectedForSwap ? "card-choice--selected" : ""}`}
                          disabled={!canSelectSwapCard}
                          onClick={() => {
                            if (canSelectSwapCard) {
                              selectSwapLocation(location);
                            }
                          }}
                        >
                          <strong>{formatCard(cardId)}</strong>
                          <span className="slot-id">{cardId}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
                );
              })}
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
