import { DicePanel } from "../actions/DicePanel.js";
import { ActionPanel } from "../actions/ActionPanel.js";
import { getPadrinoCardMeta } from "../actions/padrinoChoicePanel.logic.js";
import type { ActionFlowView } from "../../store/selectors.js";
import type { SwapLocation } from "../../../../shared/game/types.js";
import styles from "./CenterActionDock.module.css";

type CenterActionDockProps = {
  rolled: boolean;
  value: number | null;
  disabled: boolean;
  onRoll: () => void;
  flow: ActionFlowView;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  padrinoSelectedAction: 1 | 4 | 5 | null;
  onEndTurn: () => void;
  swap: {
    source: SwapLocation | null;
    target: SwapLocation | null;
    canConfirm: boolean;
    helperText: string;
    sourceKey: string;
    targetKey: string;
    onConfirm: () => void;
    onClearSelection: () => void;
  };
  orca: {
    validTargetCardIDs: string[];
    selectedCardID: string | null;
    onSelectCardID: (cardID: string) => void;
    onResolve: () => void;
  } | null;
  seal: {
    validTargetCardIDs: string[];
    selectedCardIDs: string[];
    requiredDiscardCount: number;
    onToggleCardID: (cardID: string) => void;
    onResolve: () => void;
  } | null;
  spy: {
    active: boolean;
    selectedSlots: number[];
    availableSlots: number[];
    revealedSlots: number[];
    selectedGiftSlot: number | null;
    targetPlayerID: string;
    targetPlayerIDs: string[];
    onToggleSlot: (slot: number) => void;
    onSelectGiftSlot: (slot: number) => void;
    onTargetPlayerChange: (playerID: string) => void;
    onConfirmSpy: () => void;
    onGiveCard: () => void;
    onCompleteSpy: () => void;
  } | null;
};

function diceToneClass(value: number | null, fallbackMode: ActionFlowView["mode"]): string {
  if (value === 4 || fallbackMode === "spy") return styles.toneSpy ?? "";
  if (value === 5 || fallbackMode === "swap") return styles.toneSwap ?? "";
  if (value === 6 || fallbackMode === "padrino") return styles.tonePadrino ?? "";
  if (value === 1 || value === 2 || value === 3 || fallbackMode === "fish") return styles.toneFish ?? "";
  return styles.toneIdle ?? "";
}

export function CenterActionDock({
  rolled,
  value,
  disabled,
  onRoll,
  flow,
  onChoosePadrinoAction,
  padrinoSelectedAction,
  onEndTurn,
  swap,
  orca,
  seal,
  spy
}: CenterActionDockProps) {
  const showEndTurnOverlay = flow.mode === "done" || flow.canEndTurn;
  const showSwapActions = flow.mode === "swap" && (!!swap.sourceKey || !!swap.targetKey);
  const showSpyConfirm = flow.mode === "spy" && spy != null && !spy.active && spy.selectedSlots.length > 0;
  const showSpyResolution = flow.mode === "spy" && spy != null && spy.active;
  const canGiveSpyCard = showSpyResolution && spy.selectedGiftSlot !== null && spy.targetPlayerIDs.length > 0;
  const showPadrinoConfirm = flow.showPadrinoOptions && padrinoSelectedAction !== null;
  const showOverlay = showEndTurnOverlay || showSwapActions || showSpyConfirm || showSpyResolution || showPadrinoConfirm;
  const overlayToneClass = diceToneClass(value, flow.mode);
  const overlayButtonClassName = `${styles.overlayButton} ${overlayToneClass}`;

  return (
    <div className={styles.dockRoot}>
      <ActionPanel
        flow={flow}
        onChoosePadrinoAction={onChoosePadrinoAction}
        orca={orca}
        seal={seal}
      />
      <div className={styles.diceWrapper}>
        <DicePanel rolled={rolled} value={value} disabled={disabled} onRoll={onRoll} />
        {showOverlay && (
          <div className={styles.diceOverlay}>
            {showSwapActions && (
              <div className={styles.overlayButtonGroup} role="group" aria-label="Resolver intercambio">
                <button
                  type="button"
                  className={overlayButtonClassName}
                  onClick={swap.onConfirm}
                  disabled={!swap.canConfirm}
                >
                  Confirmar intercambio
                </button>
                <button
                  type="button"
                  className={overlayButtonClassName}
                  onClick={swap.onClearSelection}
                >
                  Limpiar seleccion
                </button>
              </div>
            )}
            {showSpyConfirm && (
              <button
                type="button"
                className={overlayButtonClassName}
                onClick={spy.onConfirmSpy}
              >
                Confirmar espionaje
              </button>
            )}
            {showSpyResolution && (
              <div className={styles.overlayResolutionStack}>
                {spy.targetPlayerIDs.length > 1 ? (
                  <label className={styles.overlayTargetLabel}>
                    Regalar a
                    <select
                      className={styles.overlayTargetSelect}
                      value={spy.targetPlayerID}
                      onChange={(event) => spy.onTargetPlayerChange(event.target.value)}
                    >
                      {spy.targetPlayerIDs.map((playerID) => (
                        <option key={`spy-overlay-target-${playerID}`} value={playerID}>Jugador {playerID}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className={styles.overlayButtonGroup} role="group" aria-label="Resolver espionaje">
                  <button
                    type="button"
                    className={overlayButtonClassName}
                    onClick={spy.onGiveCard}
                    disabled={!canGiveSpyCard}
                  >
                    Regalar carta
                  </button>
                  <button
                    type="button"
                    className={overlayButtonClassName}
                    onClick={spy.onCompleteSpy}
                  >
                    Cerrar espionaje
                  </button>
                </div>
              </div>
            )}
            {showPadrinoConfirm && padrinoSelectedAction !== null && (
              <button
                type="button"
                className={overlayButtonClassName}
                onClick={() => onChoosePadrinoAction(padrinoSelectedAction)}
                aria-label={`Confirmar ${getPadrinoCardMeta(padrinoSelectedAction).label}`}
              >
                Confirmar {getPadrinoCardMeta(padrinoSelectedAction).label}
              </button>
            )}
            {showEndTurnOverlay && (
              <button
                type="button"
                className={overlayButtonClassName}
                onClick={onEndTurn}
                aria-label="Terminar turno"
              >
                END TURN
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
