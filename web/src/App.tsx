import { useMemo, useState } from "react";
import { getCardById } from "../../shared/game/cards";
import { endTurn, resetTurnState, rollDice } from "../../shared/game/moves";
import {
  ICE_GRID_SIZE,
  INITIAL_HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  createInitialState
} from "../../shared/game/setup";
import type { CardId, FrozenGuildState, PlayerID } from "../../shared/game/types";

type LocalRoom = {
  id: string;
  name: string;
  status: "local_ready";
  createdAt: number;
  playerCount: number;
  currentPlayer: PlayerID;
  turnNumber: number;
  lastAction: string;
  state: FrozenGuildState;
};

const PLAYER_COUNT_OPTIONS = [MIN_PLAYERS, 2, 3, MAX_PLAYERS];

function formatCard(cardId: CardId | null): string {
  if (cardId === null) {
    return "Vacio";
  }

  const card = getCardById(cardId);

  if (!card) {
    return cardId;
  }

  const names = {
    penguin: "Pinguino",
    walrus: "Morsa",
    petrel: "Petrel",
    sea_elephant: "Elefante marino",
    krill: "Krill",
    orca: "Orca",
    seal_bomb: "Foca-bomba"
  } as const;

  const baseName = names[card.type] ?? card.type;
  return card.type === "penguin" && card.value ? `${baseName} ${card.value}` : baseName;
}

function buildRoomName(roomNumber: number): string {
  return `Sala local ${String(roomNumber).padStart(2, "0")}`;
}

function buildInitialRoom(roomNumber: number, playerCount: number): LocalRoom {
  return {
    id: `room-${String(roomNumber).padStart(3, "0")}`,
    name: buildRoomName(roomNumber),
    status: "local_ready",
    createdAt: Date.now(),
    playerCount,
    currentPlayer: "0",
    turnNumber: 1,
    lastAction: "Partida creada. Esperando primer lanzamiento de dado.",
    state: createInitialState(playerCount)
  };
}

function getNextPlayerID(playerCount: number, currentPlayer: PlayerID): PlayerID {
  const nextPlayerIndex = (Number(currentPlayer) + 1) % playerCount;
  return String(nextPlayerIndex);
}

function updateRoom(
  rooms: LocalRoom[],
  roomId: string,
  updater: (room: LocalRoom) => LocalRoom
): LocalRoom[] {
  return rooms.map((room) => (room.id === roomId ? updater(room) : room));
}

export function App() {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [roomCounter, setRoomCounter] = useState(1);
  const [rooms, setRooms] = useState<LocalRoom[]>(() => {
    return [buildInitialRoom(1, 2)];
  });
  const [selectedRoomId, setSelectedRoomId] = useState("room-001");

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null,
    [rooms, selectedRoomId]
  );

  function handleCreateRoom() {
    const nextRoomNumber = roomCounter + 1;
    const room = buildInitialRoom(nextRoomNumber, playerCount);

    setRooms((currentRooms) => [room, ...currentRooms]);
    setRoomCounter(nextRoomNumber);
    setSelectedRoomId(room.id);
  }

  function handleRollDice(roomId: string) {
    setRooms((currentRooms) =>
      updateRoom(currentRooms, roomId, (room) => {
        const nextState: FrozenGuildState = structuredClone(room.state);
        const result = rollDice({
          G: nextState,
          ctx: { currentPlayer: room.currentPlayer } as never,
          playerID: room.currentPlayer
        });

        if (result === "INVALID_MOVE") {
          return {
            ...room,
            lastAction: `Turno ${room.turnNumber}: no se pudo tirar el dado.`
          };
        }

        return {
          ...room,
          state: nextState,
          lastAction: `Turno ${room.turnNumber}: ${room.state.players[room.currentPlayer]?.name ?? `Jugador ${room.currentPlayer}`} tiro ${nextState.dice.value}.`
        };
      })
    );
  }

  function handleEndTurn(roomId: string) {
    setRooms((currentRooms) =>
      updateRoom(currentRooms, roomId, (room) => {
        const nextState: FrozenGuildState = structuredClone(room.state);
        const nextPlayer = getNextPlayerID(room.playerCount, room.currentPlayer);
        let didAdvanceTurn = false;

        const result = endTurn({
          G: nextState,
          ctx: { currentPlayer: room.currentPlayer } as never,
          playerID: room.currentPlayer,
          events: {
            endTurn: () => {
              didAdvanceTurn = true;
            }
          }
        });

        if (result === "INVALID_MOVE" || !didAdvanceTurn) {
          return {
            ...room,
            lastAction: `Turno ${room.turnNumber}: debes tirar el dado antes de finalizar el turno.`
          };
        }

        resetTurnState(nextState);

        return {
          ...room,
          state: nextState,
          currentPlayer: nextPlayer,
          turnNumber: room.turnNumber + 1,
          lastAction: `Comienza el turno ${room.turnNumber + 1}. Juega ${room.state.players[nextPlayer]?.name ?? `Jugador ${nextPlayer}`}.`
        };
      })
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Frozen Guild MVP</p>
          <h1>Visor local de salas</h1>
          <p className="hero-copy">
            Este panel permite crear partidas locales de prueba y revisar el estado real del setup:
            mazo, El Hielo, descarte y zonas de jugadores.
          </p>
        </div>

        <div className="creator-card">
          <label className="field-label" htmlFor="player-count">
            Jugadores iniciales
          </label>
          <select
            id="player-count"
            className="select-control"
            value={playerCount}
            onChange={(event) => setPlayerCount(Number(event.target.value))}
          >
            {PLAYER_COUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} jugador{option > 1 ? "es" : ""}
              </option>
            ))}
          </select>

          <button className="primary-button" type="button" onClick={handleCreateRoom}>
            Crear sala local
          </button>

          <p className="helper-copy">
            Mano inicial por jugador: {INITIAL_HAND_SIZE} cartas. El Hielo: {ICE_GRID_SIZE} slots.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="panel">
          <div className="panel-header">
            <h2>Salas</h2>
            <span className="pill">{rooms.length}</span>
          </div>

          <div className="room-list">
            {rooms.map((room) => {
              const isActive = room.id === selectedRoom?.id;

              return (
                <button
                  key={room.id}
                  className={`room-card${isActive ? " room-card--active" : ""}`}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <span className="room-title">{room.name}</span>
                  <span className="room-meta">{room.playerCount} jugadores</span>
                  <span className="room-meta">Estado: {room.status}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="panel panel--wide">
          {selectedRoom ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>{selectedRoom.name}</h2>
                  <p className="panel-copy">
                    Version {selectedRoom.state.version} · creada {new Date(selectedRoom.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className="pill">{selectedRoom.playerCount} jugadores</span>
              </div>

              <section className="turn-panel">
                <div className="turn-panel__summary">
                  <div>
                    <span className="stat-label">Turno activo</span>
                    <h3>
                      Turno {selectedRoom.turnNumber} · {selectedRoom.state.players[selectedRoom.currentPlayer]?.name}
                    </h3>
                    <p className="panel-copy">Solo el jugador activo puede tirar una vez y cerrar turno.</p>
                  </div>
                  <div className="dice-badge">
                    <span className="stat-label">Dado</span>
                    <strong>{selectedRoom.state.dice.value ?? "-"}</strong>
                  </div>
                </div>

                <div className="turn-panel__actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleRollDice(selectedRoom.id)}
                    disabled={selectedRoom.state.dice.rolled}
                  >
                    {selectedRoom.state.dice.rolled ? "Dado ya tirado" : "Tirar dado"}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleEndTurn(selectedRoom.id)}
                  >
                    Finalizar turno
                  </button>
                </div>

                <p className="turn-log">{selectedRoom.lastAction}</p>
              </section>

              <div className="stats-grid">
                <article className="stat-card">
                  <span className="stat-label">Mazo restante</span>
                  <strong>{selectedRoom.state.deck.length}</strong>
                </article>
                <article className="stat-card">
                  <span className="stat-label">Descarte</span>
                  <strong>{selectedRoom.state.discardPile.length}</strong>
                </article>
                <article className="stat-card">
                  <span className="stat-label">Jugadores</span>
                  <strong>{Object.keys(selectedRoom.state.players).length}</strong>
                </article>
              </div>

              <section className="subpanel">
                <div className="panel-header">
                  <h3>El Hielo</h3>
                  <span className="pill">3x3</span>
                </div>

                <div className="ice-grid">
                  {selectedRoom.state.iceGrid.map((cardId, index) => (
                    <article key={`${selectedRoom.id}-ice-${index}`} className="ice-slot">
                      <span className="slot-index">Slot {index + 1}</span>
                      <strong>{formatCard(cardId)}</strong>
                      <span className="slot-id">{cardId ?? "Sin carta"}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="subpanel">
                <div className="panel-header">
                  <h3>Zonas de jugadores</h3>
                  <span className="pill">Setup inicial</span>
                </div>

                <div className="player-grid">
                  {Object.entries(selectedRoom.state.players).map(([playerID, player]) => (
                    <article
                      key={`${selectedRoom.id}-player-${playerID}`}
                      className={`player-card${playerID === selectedRoom.currentPlayer ? " player-card--active" : ""}`}
                    >
                      <div className="player-card__header">
                        <div>
                          <h4>{player.name}</h4>
                          <p>playerID {playerID}</p>
                        </div>
                        <span className="pill">
                          {playerID === selectedRoom.currentPlayer ? "En turno" : `${player.zone.length} cartas`}
                        </span>
                      </div>

                      <div className="card-list">
                        {player.zone.map((cardId) => (
                          <article key={cardId} className="mini-card">
                            <strong>{formatCard(cardId)}</strong>
                            <span>{cardId}</span>
                          </article>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <h2>Sin sala seleccionada</h2>
              <p>Crea una sala local para inspeccionar el setup inicial del juego.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
