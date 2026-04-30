import styles from "./Actions.module.css";
import { Button } from "../shared/Button.js";

type SpyActionPanelProps = {
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
};

export function SpyActionPanel({
  active,
  selectedSlots,
  availableSlots,
  revealedSlots,
  selectedGiftSlot,
  targetPlayerID,
  targetPlayerIDs,
  onToggleSlot,
  onSelectGiftSlot,
  onTargetPlayerChange,
  onConfirmSpy,
  onGiveCard,
  onCompleteSpy
}: SpyActionPanelProps) {
  if (!active) {
    return (
      <>
        <p className={styles.helper}>Selecciona de 1 a 3 slots del Hielo para espiar.</p>
        <div className={styles.choiceList}>
          {availableSlots.map((slot) => {
            const selected = selectedSlots.includes(slot);
            return (
              <button
                key={`spy-slot-${slot}`}
                type="button"
                className={`${styles.choiceButton} ${selected ? styles.choiceButtonSelected : ""}`}
                onClick={() => onToggleSlot(slot)}
              >
                Slot {slot + 1}
              </button>
            );
          })}
        </div>
        <Button onClick={onConfirmSpy} disabled={selectedSlots.length === 0}>Confirmar espionaje</Button>
      </>
    );
  }

  return (
    <>
      <p className={styles.helper}>Selecciona una carta revelada para regalar o cierra el espionaje.</p>
      <div className={styles.choiceList}>
        {revealedSlots.map((slot) => {
          const selected = selectedGiftSlot === slot;
          return (
            <button
              key={`spy-gift-slot-${slot}`}
              type="button"
              className={`${styles.choiceButton} ${selected ? styles.choiceButtonSelected : ""}`}
              onClick={() => onSelectGiftSlot(slot)}
            >
              Slot {slot + 1}
            </button>
          );
        })}
      </div>

      <label>
        Regalar a
        <select className={styles.select} value={targetPlayerID} onChange={(event) => onTargetPlayerChange(event.target.value)}>
          {targetPlayerIDs.map((playerID) => (
            <option key={`spy-target-${playerID}`} value={playerID}>Jugador {playerID}</option>
          ))}
        </select>
      </label>

      <div className={styles.actionRow}>
        <Button onClick={onGiveCard} disabled={selectedGiftSlot === null || targetPlayerIDs.length === 0}>Regalar carta vista</Button>
        <Button onClick={onCompleteSpy}>Cerrar espionaje</Button>
      </div>
    </>
  );
}
