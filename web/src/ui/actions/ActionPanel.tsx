import { motion } from "framer-motion";
import type { SwapLocation } from "../../../../shared/game/types.js";
import type { ActionFlowView } from "../../store/selectors.js";
import { PadrinoChoicePanel } from "./PadrinoChoicePanel.js";
import { SwapConfirmPanel } from "./SwapConfirmPanel.js";
import { OrcaResolutionPanel } from "./OrcaResolutionPanel.js";
import { SealExplosionPanel } from "./SealExplosionPanel.js";
import { SpyActionPanel } from "./SpyActionPanel.js";
import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";

type ActionPanelProps = {
  flow: ActionFlowView;
  onChoosePadrinoAction: (action: 1 | 4 | 5) => void;
  swap: {
    source: SwapLocation | null;
    target: SwapLocation | null;
    canConfirm: boolean;
    helperText: string;
    sourceKey: string;
    targetKey: string;
    options: Array<{ key: string; label: string; location: SwapLocation }>;
    onSourceKeyChange: (key: string) => void;
    onTargetKeyChange: (key: string) => void;
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
  onEndTurn: () => void;
};

function locationLabel(location: SwapLocation | null): string {
  if (!location) {
    return "-";
  }
  if (location.area === "ice_grid") {
    return `Hielo ${location.slot + 1}`;
  }
  return `Jugador ${location.playerID} · carta ${location.index + 1}`;
}

export function ActionPanel({ flow, onChoosePadrinoAction, swap, orca, seal, spy, onEndTurn }: ActionPanelProps) {
  const modeIcon =
    flow.mode === "fish"
      ? "/assets/ui/icons/fish.png"
      : flow.mode === "orca"
        ? "/assets/ui/icons/orca.png"
        : null;

  const modeLabel =
    flow.mode === "fish"
      ? "Pesca"
      : flow.mode === "spy"
        ? "Espionaje"
        : flow.mode === "swap"
          ? "Intercambio"
          : flow.mode === "orca"
            ? "Orca"
            : flow.mode === "seal"
              ? "Foca-Bomba"
              : flow.mode === "padrino"
                ? "Padrino"
                : flow.mode === "done"
                  ? "Fin de accion"
                  : flow.mode === "roll"
                    ? "Dado"
                    : "Espera";

  const interactiveMode = flow.mode !== "waiting" && flow.mode !== "done";

  return (
    <div className={styles.panelBlock}>
      <p className={styles.helperRow}>
        {modeIcon ? <img className={styles.modeIcon} src={modeIcon} alt="" aria-hidden /> : null}
        <motion.span
          className={`${styles.modeChip} ${interactiveMode ? styles.modeChipInteractive : styles.modeChipWaiting}`}
          initial={false}
          animate={{ scale: interactiveMode ? 1.02 : 1, opacity: interactiveMode ? 1 : 0.75 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {modeLabel}
        </motion.span>
        <span>{flow.helperText}</span>
      </p>

      {flow.mode === "padrino" ? <PadrinoChoicePanel onChoose={onChoosePadrinoAction} /> : null}

      {flow.mode === "swap" ? (
        <SwapConfirmPanel
          sourceLabel={locationLabel(swap.source)}
          targetLabel={locationLabel(swap.target)}
          canConfirm={swap.canConfirm}
          helperText={swap.helperText}
          sourceKey={swap.sourceKey}
          targetKey={swap.targetKey}
          options={swap.options}
          onSourceKeyChange={swap.onSourceKeyChange}
          onTargetKeyChange={swap.onTargetKeyChange}
          onConfirm={swap.onConfirm}
          onClearSelection={swap.onClearSelection}
        />
      ) : null}

      {flow.mode === "orca" && orca ? (
        <OrcaResolutionPanel
          validTargetCardIDs={orca.validTargetCardIDs}
          selectedCardID={orca.selectedCardID}
          onSelectCardID={orca.onSelectCardID}
          onResolve={orca.onResolve}
        />
      ) : null}

      {flow.mode === "seal" && seal ? (
        <SealExplosionPanel
          validTargetCardIDs={seal.validTargetCardIDs}
          selectedCardIDs={seal.selectedCardIDs}
          requiredDiscardCount={seal.requiredDiscardCount}
          onToggleCardID={seal.onToggleCardID}
          onResolve={seal.onResolve}
        />
      ) : null}

      {flow.mode === "spy" && spy ? (
        <SpyActionPanel
          active={spy.active}
          selectedSlots={spy.selectedSlots}
          availableSlots={spy.availableSlots}
          revealedSlots={spy.revealedSlots}
          selectedGiftSlot={spy.selectedGiftSlot}
          targetPlayerID={spy.targetPlayerID}
          targetPlayerIDs={spy.targetPlayerIDs}
          onToggleSlot={spy.onToggleSlot}
          onSelectGiftSlot={spy.onSelectGiftSlot}
          onTargetPlayerChange={spy.onTargetPlayerChange}
          onConfirmSpy={spy.onConfirmSpy}
          onGiveCard={spy.onGiveCard}
          onCompleteSpy={spy.onCompleteSpy}
        />
      ) : null}

      {flow.canEndTurn ? <Button onClick={onEndTurn}>Terminar turno</Button> : null}
    </div>
  );
}
