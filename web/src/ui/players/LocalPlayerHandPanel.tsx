import { CompactHand } from "./CompactHand.js";
import styles from "./Players.module.css";

type LocalPlayerHandPanelProps = {
  playerName: string;
  score: number;
  cardIDs: string[];
  actionBannerText?: string | null;
  actionBannerButtonLabel?: string | null;
  actionBannerButtonDisabled?: boolean;
  onActionBannerButtonClick?: () => void;
  clickableCardIndexes?: number[];
  selectedCardIndexes?: number[];
  onCardClick?: (index: number) => void;
};

export function LocalPlayerHandPanel({
  playerName,
  score,
  cardIDs,
  actionBannerText = null,
  actionBannerButtonLabel = null,
  actionBannerButtonDisabled = true,
  onActionBannerButtonClick,
  clickableCardIndexes = [],
  selectedCardIndexes = [],
  onCardClick
}: LocalPlayerHandPanelProps) {
  return (
    <section className={styles.localHandFrame} data-local-hand-frame="true" aria-label="Tu mano">
      {actionBannerText ? (
        <div className={styles.localHandActionBanner} role="status" aria-live="polite">
          <span className={styles.localHandActionBannerText}>{actionBannerText}</span>
          {actionBannerButtonLabel && onActionBannerButtonClick ? (
            <button
              type="button"
              className={styles.localHandActionBannerButton}
              disabled={actionBannerButtonDisabled}
              onClick={onActionBannerButtonClick}
            >
              {actionBannerButtonLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      <CompactHand
        cardIDs={cardIDs}
        selectableIndexes={clickableCardIndexes}
        selectedIndexes={selectedCardIndexes}
        {...(onCardClick ? { onCardClick } : {})}
        size="local"
      />
    </section>
  );
}
