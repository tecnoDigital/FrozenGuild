import { assets } from "../assets.js";
import styles from "./LeftStatusRail.module.css";

type CardPileKind = "deck" | "discard";

type CardPileStatProps = {
  kind: CardPileKind;
  label: string;
  count: number;
  cardBackSrc: string;
};

type LeftStatusRailProps = {
  deckCount: number;
  discardCount: number;
  cardBackSrc: string;
};

function formatCount(count: number) {
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function CardPileStat({ kind, label, count, cardBackSrc }: CardPileStatProps) {
  const safeCount = formatCount(count);
  const isEmpty = safeCount === 0;
  const pileClassName = `${styles.pile} ${kind === "discard" ? styles.discardPile : styles.deckPile}`;

  return (
    <section className={styles.pileCard} data-kind={kind} aria-label={`${label}: ${safeCount} cartas`}>
      <div className={styles.pileHeader}>
        <span className={styles.pileLabel}>{label}</span>
        <span className={styles.pileCount}>{safeCount}</span>
      </div>

      <div className={pileClassName} data-empty={isEmpty ? "true" : "false"} aria-hidden="true">
        {kind === "deck" ? (
          <>
            <img className={`${styles.cardBack} ${styles.cardBackBottom}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.cardBackMiddle}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.cardBackTop}`} src={cardBackSrc} alt="" />
          </>
        ) : isEmpty ? (
          <span className={styles.emptyDiscard} />
        ) : (
          <>
            <img className={`${styles.cardBack} ${styles.discardBackA}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.discardBackB}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.discardBackC}`} src={cardBackSrc} alt="" />
          </>
        )}
      </div>
    </section>
  );
}

export function LeftStatusRail({ deckCount, discardCount, cardBackSrc }: LeftStatusRailProps) {
  return (
    <div className={styles.rail}>
      <div className={styles.logoWrap}>
        <img className={styles.logo} src={assets.brand.logoMain} alt="Frozen Guild" />
      </div>

      <div className={styles.tableSurface} aria-label="Pilas de cartas de la mesa">
        <CardPileStat kind="deck" label="MAZO" count={deckCount} cardBackSrc={cardBackSrc} />
        <div className={styles.flowArrow} aria-hidden="true">
          <span />
        </div>
        <CardPileStat kind="discard" label="DESCARTE" count={discardCount} cardBackSrc={cardBackSrc} />
      </div>
    </div>
  );
}
