import styles from "./LobbyGlass.module.css";
import { assets } from "../assets.js";

type ExpeditionPanelProps = {
  active: boolean;
  onViewRooms?: (() => void) | undefined;
};

export function ExpeditionPanel({ active, onViewRooms }: ExpeditionPanelProps) {
  const tutorialSteps = [
    {
      number: "1",
      title: "Roll",
      body: "The dice chooses your action for this turn.",
    },
    {
      number: "2",
      title: "Resolve",
      body: "Use the highlighted card effect.",
    },
    {
      number: "3",
      title: "End turn",
      body: "Confirm the action, then pass control.",
    },
  ];

  const cardTypes = [
    {
      label: "Penguin",
      image: assets.cards.fronts.penguin1,
      detail: "Swap and setup plays.",
    },
    {
      label: "Orca",
      image: assets.cards.fronts.orca,
      detail: "Pressure another player.",
    },
    {
      label: "Seal",
      image: assets.cards.fronts.sealBomb,
      detail: "Explosive risk card.",
    },
    {
      label: "Padrino",
      image: assets.ui.icons.godfather,
      detail: "Choose a special action.",
    },
  ];

  return (
    <div className={`${styles.rightHero} ${active ? styles.rightHeroActive : ""}`}>
      <div className={styles.rightTop}>
        <div>
          <div className={styles.eyebrow}>Before you create</div>
          <h2>Quick Tutorial</h2>
          <p>Three simple ideas before opening the table.</p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={onViewRooms}>
          View Rooms
        </button>
      </div>

      <div className={styles.tutorialSteps} aria-label="Quick tutorial steps">
        {tutorialSteps.map((step) => (
          <article key={step.title} className={styles.tutorialStep}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </div>

      <section className={styles.cardGuide} aria-label="Card type guide">
        <div className={styles.cardGuideHeader}>
          <span className={styles.eyebrow}>Card Types</span>
          <strong>Read the table fast</strong>
        </div>
        <div className={styles.cardGuideList}>
          {cardTypes.map((card) => (
            <article key={card.label} className={styles.cardGuideItem}>
              <img src={card.image} alt="" draggable={false} />
              <div>
                <strong>{card.label}</strong>
                <span>{card.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.tutorialNote}>
        <span>Tip</span>
        <p>During the match, the center action button tells you what to confirm next.</p>
      </div>
    </div>
  );
}
