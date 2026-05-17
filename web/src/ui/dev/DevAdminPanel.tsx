import { useMemo, useState } from "react";
import type { FrozenGuildState } from "../../../../shared/game/types.js";

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

type AdminObservedState = {
  G: FrozenGuildState;
  currentPlayer: string;
  gameover?: unknown;
} | null;

type DevAdminClient = {
  moves?: {
    rollDice?: () => void;
    endTurn?: () => void;
    fishFromIce?: (slot: number) => void;
    choosePadrinoAction?: (action: 1 | 2 | 3 | 4 | 5) => void;
    spyOnIce?: (slots: number[]) => void;
    completeSpy?: () => void;
    resolveOrcaDestroy?: (targetCardID: string) => void;
    resolveSealBombExplosion?: (targetCardIDs: string[]) => void;
    swapCards?: (...args: unknown[]) => void;
    setTableActive?: (active: boolean) => void;
    markPlayerDisconnected?: (now?: number) => void;
    markPlayerReconnected?: () => void;
  };
} | null;

type DevAdminPanelProps = {
  adminBusy: boolean;
  adminError: string | null;
  adminSession: AdminDualSession | null;
  adminState: Record<AdminPlayerID, AdminObservedState>;
  adminClient0: DevAdminClient;
  adminClient1: DevAdminClient;
  onCreateAndControlTwoPlayers: () => void;
  onAttachTwoPlayersToExistingMatch: () => void;
  onStopAdminControl: () => void;
};

function formatTimestamp(value?: number | null): string {
  if (typeof value !== "number") {
    return "-";
  }

  return new Date(value).toLocaleTimeString();
}

export function DevAdminPanel(props: DevAdminPanelProps) {
  const {
    adminBusy,
    adminError,
    adminSession,
    adminState,
    adminClient0,
    adminClient1,
    onCreateAndControlTwoPlayers,
    onAttachTwoPlayersToExistingMatch,
    onStopAdminControl
  } = props;

  const [adminFishSlot, setAdminFishSlot] = useState<Record<AdminPlayerID, number>>({ "0": 0, "1": 0 });

  const canonicalState = useMemo(
    () => adminState["0"]?.G ?? adminState["1"]?.G ?? null,
    [adminState]
  );

  return (
    <>
      <hr style={{ borderColor: "rgba(162, 194, 255, 0.25)", width: "100%" }} />
      <h3 style={{ margin: 0 }}>Panel administrador</h3>
      <p className="panel-copy" style={{ marginTop: 0 }}>
        Controla Jugador 0 y Jugador 1 desde esta misma interfaz.
      </p>

      <button className="primary-button" onClick={onCreateAndControlTwoPlayers} disabled={adminBusy}>
        Crear sala + controlar 2 jugadores
      </button>
      <button className="secondary-button" onClick={onAttachTwoPlayersToExistingMatch} disabled={adminBusy}>
        Adjuntar control dual al match seleccionado
      </button>
      {adminSession && (
        <button className="secondary-button" onClick={onStopAdminControl}>
          Cerrar control dual
        </button>
      )}
      {adminError && <p className="helper-copy">{adminError}</p>}

      {adminSession && canonicalState && (
        <div className="subpanel" style={{ width: "100%" }}>
          <h4 style={{ marginTop: 0 }}>Estado operativo · Match {adminSession.matchID}</h4>
          <p className="panel-copy">
            Mesa activa: {canonicalState.activeTable ? "si" : "no"} · pendingStage: {canonicalState.pendingStage?.type ?? "none"} · queue: {canonicalState.autoResolveQueue.length}
          </p>
          <p className="panel-copy">
            Bot: {canonicalState.botActivity.playerID ?? "-"} · inicio: {formatTimestamp(canonicalState.botActivity.startedAt)} · fin: {formatTimestamp(canonicalState.botActivity.completedAt)}
          </p>
          <p className="panel-copy">
            Orca: {canonicalState.orcaResolution ? `${canonicalState.orcaResolution.playerID} (${canonicalState.orcaResolution.validTargetCardIDs.length} targets)` : "none"} · Foca-bomba: {canonicalState.sealBombResolution ? `${canonicalState.sealBombResolution.playerID} (${canonicalState.sealBombResolution.requiredDiscardCount} descartes)` : "none"}
          </p>
          <div className="turn-panel__actions">
            <button className="secondary-button" onClick={() => adminClient0?.moves?.setTableActive?.(true)}>
              Activar mesa
            </button>
            <button className="secondary-button" onClick={() => adminClient0?.moves?.setTableActive?.(false)}>
              Desactivar mesa
            </button>
          </div>
          {canonicalState.autoResolveQueue.length > 0 && (
            <div className="panel-copy">
              Queue: {canonicalState.autoResolveQueue.map((item) => `${item.stageType}:${item.playerID}`).join(" · ")}
            </div>
          )}
          <div className="panel-copy">
            {Object.entries(canonicalState.players).map(([playerID, player]) => (
              <div key={`conn-${playerID}`}>
                J{playerID}: {player.connectionStatus} · desde: {formatTimestamp(player.disconnectStartedAt)}
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <button className="secondary-button" onClick={() => adminClient?.moves?.markPlayerDisconnected?.(Date.now())}>
                      Marcar desconectado
                    </button>
                    <button className="secondary-button" onClick={() => adminClient?.moves?.markPlayerReconnected?.()}>
                      Marcar reconectado
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
    </>
  );
}
