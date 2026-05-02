import { ActionBarContainer } from "./ActionBarContainer";
import { BoardSlotsContainer } from "./BoardSlotsContainer";
import { CurrentTurnPanelContainer } from "./CurrentTurnPanelContainer";
import { DeckPanelContainer } from "./DeckPanelContainer";
import { DicePanelContainer } from "./DicePanelContainer";
import { LocalPlayerHandContainer } from "./LocalPlayerHandContainer";
import { OpponentPanelContainer } from "./OpponentPanelContainer";
import { RoundBadgeContainer } from "./RoundBadgeContainer";
import { ScorePanelContainer } from "./ScorePanelContainer";
import styles from "./GameShell.module.css";
import type { GameShellProps } from "./types";
import { assets } from "../../../ui/assets";

export function GameShell({
  boardSlots: _boardSlots,
  deckPanel: _deckPanel,
  dicePanel: _dicePanel,
  actionBar: _actionBar
}: GameShellProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.topBar} data-testid="phase4-top-bar">
        <img
          className={styles.logo}
          src={assets.brand.logoMain}
          alt="Frozen Guild logo"
          data-testid="phase4-logo"
        />
        <div className={styles.roundBadgeWrap}>
          <RoundBadgeContainer />
        </div>
        <div className={styles.topSpacer} aria-hidden="true" />
      </section>

      <section className={styles.layout}>
        <aside className={styles.leftRail} data-testid="phase4-left-panel">
          <CurrentTurnPanelContainer />
          <ScorePanelContainer />
          <DeckPanelContainer />
        </aside>

        <section className={styles.grid} data-testid="phase4-board">
          <BoardSlotsContainer />
        </section>

        <aside className={styles.rightRail} data-testid="phase4-opponents-panel">
          <OpponentPanelContainer />
        </aside>

        <section className={styles.bottomCenter} data-testid="phase4-dice-actions">
          <DicePanelContainer />
          <ActionBarContainer />
        </section>

        <section className={styles.bottomRight} data-testid="phase4-local-hand">
          <LocalPlayerHandContainer />
        </section>
      </section>
    </main>
  );
}
