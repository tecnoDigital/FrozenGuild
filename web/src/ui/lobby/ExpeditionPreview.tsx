import { Card } from "../board/Card.js";
import styles from "./Lobby.module.css";

type PreviewCard = { id: string; label: string; image: string };

type ExpeditionPreviewProps = {
  cards: PreviewCard[];
};

export function ExpeditionPreview({ cards }: ExpeditionPreviewProps) {
  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Expedicion</h3>
      <div className={styles.cards}>
        {cards.map((card) => (
          <Card key={card.id} id={card.id} label={card.label} image={card.image} motionLayout={false} />
        ))}
      </div>
    </section>
  );
}
