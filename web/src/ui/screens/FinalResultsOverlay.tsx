import type { FinalResults } from "../../../../shared/game/types.js";
import { resolveLobbyAvatarSrc, type LobbyAvatarID } from "../../features/lobby/lobbyStore.js";
import styles from "./FinalResultsOverlay.module.css";

type FinalResultsOverlayProps = {
  finalResults: FinalResults;
  onReturnToLobby: () => void;
};

export function FinalResultsOverlay({ finalResults, onReturnToLobby }: FinalResultsOverlayProps) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="fg-results-title">
      <section className={styles.card}>
        <h2 id="fg-results-title" className={styles.title}>RESULTADOS</h2>
        <div className={styles.row} style={{ gridTemplateColumns: `repeat(${Math.max(1, finalResults.players.length)}, minmax(0, 1fr))` }}>
          {finalResults.players.map((player) => (
            <article key={player.playerID} className={styles.playerCard}>
              <span className={styles.place}>{player.placement}°</span>
              <img
                className={styles.avatar}
                src={resolveLobbyAvatarSrc(player.avatarId as LobbyAvatarID)}
                alt={`Avatar de ${player.nickname}`}
              />
              <strong className={styles.name}>{player.nickname}</strong>
              <p className={styles.fishes}>
                <img src="/assets/ui/icons/fish.png" alt="" aria-hidden="true" width={16} height={16} />
                <span>{player.fishes}</span>
              </p>
            </article>
          ))}
        </div>
        <button className="secondary-button" onClick={onReturnToLobby}>Volver al lobby</button>
      </section>
    </div>
  );
}
