type LeftStatusRailProps = {
  playerName: string;
  playerAvatarSrc: string;
  playerColorValue: string;
  turnLabel: string;
  deckCount: number;
  discardCount: number;
  tableStatus: "activa" | "pausada";
};

export function LeftStatusRail({
  playerName,
  playerAvatarSrc,
  playerColorValue,
  turnLabel,
  deckCount,
  discardCount,
  tableStatus
}: LeftStatusRailProps) {
  return (
    <div>
      <h3>Estado</h3>
      <img data-testid="left-status-avatar" src={playerAvatarSrc} alt={`${playerName} avatar`} width={42} height={42} />
      <span
        data-testid="left-status-color-chip"
        title={`Color ${playerColorValue}`}
        style={{ display: "inline-block", width: 12, height: 12, borderRadius: 999, background: playerColorValue, marginLeft: 8 }}
      />
      <p>Jugador: {playerName}</p>
      <p>
        Turno:{" "}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={turnLabel}
            initial={{ opacity: 0.6, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.6, y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ display: "inline-block" }}
          >
            {turnLabel}
          </motion.span>
        </AnimatePresence>
      </p>
      <p>Mesa: {tableStatus}</p>
      <p>Mazo: {deckCount}</p>
      <p>Descarte: {discardCount}</p>
    </div>
  );
}
import { motion, AnimatePresence } from "framer-motion";
