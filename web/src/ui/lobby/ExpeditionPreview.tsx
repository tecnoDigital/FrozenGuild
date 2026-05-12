import { FrostCard } from "../../features/board/ui/FrostCard.js";
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
        {cards.map((card, index) => (
          <FrostCard key={card.id} index={index} ariaLabel={card.label} disabled>
            <img src={card.image} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </FrostCard>
        ))}
      </div>
    </section>
  );
}
