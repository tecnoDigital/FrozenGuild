type LeftStatusRailProps = {
  playerName: string;
  turnLabel: string;
  deckCount: number;
  discardCount: number;
  tableStatus: "activa" | "pausada";
};

export function LeftStatusRail({ playerName, turnLabel, deckCount, discardCount, tableStatus }: LeftStatusRailProps) {
  return (
    <div>
      <h3>Estado</h3>
      <p>Jugador: {playerName}</p>
      <p>Turno: {turnLabel}</p>
      <p>Mesa: {tableStatus}</p>
      <p>Mazo: {deckCount}</p>
      <p>Descarte: {discardCount}</p>
    </div>
  );
}
