type RightLedgerRailProps = {
  players: Array<{ id: string; name: string; score: number; cards: number }>;
  unstablePlayers: Array<{ id: string; name: string; status: "reconnecting" | "absent" }>;
};

export function RightLedgerRail({ players, unstablePlayers }: RightLedgerRailProps) {
  return (
    <div>
      <h3>Ledger</h3>
      {players.map((player) => (
        <p key={player.id}>
          {player.name} · puntos {player.score} · cartas {player.cards}
        </p>
      ))}
      {unstablePlayers.length > 0 ? (
        <div>
          <h4>Conexion</h4>
          {unstablePlayers.map((player) => (
            <p key={player.id}>
              {player.name} · {player.status}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
