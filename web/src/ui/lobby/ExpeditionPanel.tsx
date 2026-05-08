import styles from "./LobbyGlass.module.css";
import { assets } from "../assets.js";

type ExpeditionPanelProps = {
  active: boolean;
  onViewRooms?: (() => void) | undefined;
};

export function ExpeditionPanel({ active, onViewRooms }: ExpeditionPanelProps) {
  const featureCards = [
    {
      icon: "🎲",
      title: "One roll, one decision",
      body: "The dice creates pressure without burying the player in rules.",
    },
    {
      icon: "🧊",
      title: "El Hielo remembers",
      body: "A compact 3x3 board keeps memory, bluffing, and risk visible.",
    },
    {
      icon: "⚔️",
      title: "Conflict is readable",
      body: "Spy, swap, and destroy cards without losing the table state.",
    },
  ];

  const miniCards = [
    {
      label: "Penguin",
      image: assets.cards.fronts.penguin1,
      detail: "Stable score. Good when you need tempo and clarity.",
    },
    {
      label: "Orca",
      image: assets.cards.fronts.orca,
      detail: "Immediate effect. Destroy one of your own cards to continue.",
    },
    {
      label: "Seal Bomb",
      image: assets.cards.fronts.sealBomb,
      detail: "Danger card. Clear the blocking stage when it explodes.",
    },
  ];

  return (
    <div className={`${styles.rightHero} ${active ? styles.rightHeroActive : ""}`}>
      <div className={styles.rightTop}>
        <div>
          <div className={styles.eyebrow}>El Hielo Briefing</div>
          <h2>Expedition</h2>
          <p>
            Open a table, recruit players, and survive a frozen board where every reveal changes the plan.
          </p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={onViewRooms}>
          View Rooms
        </button>
      </div>

      <div className={styles.iceMap} aria-label="El Hielo 3x3 preview">
        <div className={styles.iceGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`ice-${i}`} className={styles.iceSlot} />
          ))}
        </div>
        <div className={styles.floatingCard}>
          <span>Immediate effect</span>
          <img src={assets.cards.fronts.orca} alt="" draggable={false} />
          <strong>Orca forces a sacrifice before the turn continues.</strong>
        </div>
      </div>

      <div className={styles.features}>
        {featureCards.map((feature) => (
          <article key={feature.title} className={styles.feature}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.cardRow}>
        {miniCards.map((card) => (
          <article key={card.label} className={styles.miniCard}>
            <img className={styles.miniCardImage} src={card.image} alt="" draggable={false} />
            <div>
              <strong>{card.label}</strong>
              <span>{card.detail}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
