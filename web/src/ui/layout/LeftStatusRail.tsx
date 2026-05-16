import { assets } from "../assets.js";
import styles from "./LeftStatusRail.module.css";

type CardPileKind = "deck" | "discard";

type CardStackProps = {
  kind: CardPileKind;
  count: number;
  cardBackSrc: string;
  label: string;
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

export function CardStack({ kind, count, cardBackSrc, label }: CardStackProps) {
  const safeCount = formatCount(count);
  const isEmpty = safeCount === 0;
  const stackClassName = `${styles.cardStack} ${kind === "discard" ? styles.discardStack : styles.deckStack}`;

  return (
    <div className={stackClassName} data-empty={isEmpty ? "true" : "false"} aria-label={`${label}: ${safeCount} cartas`}>
      <span className={styles.stackBadge} aria-hidden="true">
        {safeCount}
      </span>
      <div className={styles.cardStackArt} aria-hidden="true">
        {isEmpty ? (
          <span className={styles.emptyStack} />
        ) : kind === "deck" ? (
          <>
            <img className={`${styles.cardBack} ${styles.cardBackBottom}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.cardBackMiddle}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.cardBackTop}`} src={cardBackSrc} alt="" />
          </>
        ) : (
          <>
            <img className={`${styles.cardBack} ${styles.discardBackA}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.discardBackB}`} src={cardBackSrc} alt="" />
            <img className={`${styles.cardBack} ${styles.discardBackC}`} src={cardBackSrc} alt="" />
          </>
        )}
      </div>
    </div>
  );
}

type CardPileStationProps = CardStackProps;

function CardPileStation({ kind, label, count, cardBackSrc }: CardPileStationProps) {
  const safeCount = formatCount(count);
  const isEmpty = safeCount === 0;

  return (
    <section className={styles.pileStation} data-kind={kind} data-empty={isEmpty ? "true" : "false"}>
      <span className={styles.pileLabel}>{label}</span>
      <CardStack kind={kind} count={safeCount} cardBackSrc={cardBackSrc} label={label} />
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

  return (
    <div className={styles.rail}>
      <div className={styles.logoWrap}>
        <img className={styles.logo} src={assets.brand.logoMain} alt="Frozen Guild" />
      </div>

      <div className={styles.iceSupplyRail} aria-label="Ice Supply Rail: pilas de cartas de la mesa">
        <div className={styles.iceWake} aria-hidden="true" />
        <CardPileStation
          kind="deck"
          label="MAZO"
          count={deckCount}
          cardBackSrc={cardBackSrc}
        />
        <div className={styles.flowCrack} aria-hidden="true">
          <span />
        </div>
        <CardPileStation
          kind="discard"
          label="DESCARTE"
          count={discardCount}
          cardBackSrc={cardBackSrc}
        />
      </div>
    </div>
  );
}
