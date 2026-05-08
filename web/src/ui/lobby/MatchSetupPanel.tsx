import styles from "./LobbyGlass.module.css";

type MatchSetupPanelProps = {
  mode: "create" | "join";
  numPlayers: number;
  botCount: number;
  maxBots: number;
  onModeChange?: ((mode: "create" | "join") => void) | undefined;
  onNumPlayersChange?: ((value: number) => void) | undefined;
  onBotCountChange?: ((value: number) => void) | undefined;
};

export function MatchSetupPanel({
  mode,
  numPlayers,
  botCount,
  maxBots,
  onModeChange,
  onNumPlayersChange,
  onBotCountChange,
}: MatchSetupPanelProps) {
  const isCreate = mode === "create";
  const waitingSeats = Math.max(0, numPlayers - 1 - botCount);
  const botText = `${botCount} ${botCount === 1 ? "bot" : "bots"}`;
  const waitingText = `${waitingSeats} ${waitingSeats === 1 ? "waiting seat" : "waiting seats"}`;

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>
        <h2>Match Setup</h2>
        <span>Create or join</span>
      </div>

      <div className={styles.fieldStack}>
        <div className={styles.toggleBar} role="tablist" aria-label="Lobby mode">
          <button
            type="button"
            className={`${styles.modeBtn} ${isCreate ? styles.modeBtnActive : ""}`}
            onClick={() => onModeChange?.("create")}
            role="tab"
            aria-selected={isCreate}
          >
            Create Match
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${!isCreate ? styles.modeBtnActive : ""}`}
            onClick={() => onModeChange?.("join")}
            role="tab"
            aria-selected={!isCreate}
          >
            Join Match
          </button>
        </div>

        <div className={styles.setupGrid} style={{ display: isCreate ? "grid" : "none" }}>
          <div>
            <label htmlFor="players" className={styles.fieldLabel}>
              Players
            </label>
            <select
              id="players"
              className={styles.selectInput}
              value={numPlayers}
              onChange={(e) => onNumPlayersChange?.(Number(e.target.value))}
            >
              <option value={1}>1 player test</option>
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
              <option value={4}>4 players</option>
            </select>
          </div>
          <div>
            <span className={styles.fieldLabel}>Bots</span>
            <div
              className={styles.botSegmented}
              role="group"
              aria-label="Bots selector"
            >
              {Array.from({ length: maxBots + 1 }, (_, i) => {
                const active = i === botCount;
                return (
                  <button
                    key={`bot-${i}`}
                    type="button"
                    className={`${styles.botSegment} ${active ? styles.botSegmentActive : ""}`}
                    onClick={() => onBotCountChange?.(i)}
                    aria-pressed={active}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.configSummary} style={{ display: isCreate ? "block" : "none" }}>
          <strong>You</strong> + {botText} + {waitingText}
        </div>
      </div>
    </section>
  );
}
