import { assets } from "../assets.js";
import styles from "./LeftStatusRail.module.css";

type CardPileKind = "deck" | "discard";

type CardPileStatProps = {
  kind: CardPileKind;
  label: string;
  count: number;
  cardBackSrc: string;
  isActive: boolean;
};

type LeftStatusRailProps = {
  deckCount?: number;
  discardCount?: number;
  cardBackSrc?: string;
  players?: Array<{
    id: string;
    name: string;
    avatarSrc?: string;
    colorValue?: string;
    score?: number;
    isActiveTurn?: boolean;
  }>;
};

function formatCount(count: number) {
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function CardPileStat({ kind, label, count, cardBackSrc, isActive }: CardPileStatProps) {
  const safeCount = formatCount(count);
  const isEmpty = safeCount === 0;
  const pileClassName = `${styles.pile} ${kind === "discard" ? styles.discardPile : styles.deckPile}`;

  return (
    <section
      className={styles.pileStation}
      data-kind={kind}
      data-active={isActive ? "true" : "false"}
      data-empty={isEmpty ? "true" : "false"}
      aria-label={`${label}: ${safeCount} cartas`}
    >
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

export function LeftStatusRail({
  deckCount = 0,
  discardCount = 0,
  cardBackSrc = assets.cards.back,
  players = []
}: LeftStatusRailProps) {
  if (players.length > 0) {
    return (
      <div className={styles.rail}>
        {players.map((player) => (
          <article key={player.id} data-testid={`score-row-${player.id}`}>
            <div>
              <img src={player.avatarSrc} alt="" />
              <span>{player.name}</span>
              <span
                title={`Color ${player.colorValue}`}
                style={player.colorValue ? { backgroundColor: player.colorValue } : undefined}
              />
            </div>
          </article>
        ))}
      </div>
    );
  }

  const activePile: CardPileKind | null = null;

  return (
    <div className={styles.rail}>
      <div className={styles.logoWrap}>
        <img className={styles.logo} src={assets.brand.logoMain} alt="Frozen Guild" />
      </div>

      <div className={styles.tableSurface} aria-label="Pilas de cartas de la mesa">
        <div className={styles.iceWake} aria-hidden="true" />
        <CardPileStat
          kind="deck"
          label="MAZO"
          count={deckCount}
          cardBackSrc={cardBackSrc}
          isActive={activePile === "deck"}
        />
        <div className={styles.flowArrow} aria-hidden="true">
          <span />
        </div>
        <CardPileStat
          kind="discard"
          label="DESCARTE"
          count={discardCount}
          cardBackSrc={cardBackSrc}
          isActive={activePile === "discard"}
        />
      </div>
    </div>
  );
}
