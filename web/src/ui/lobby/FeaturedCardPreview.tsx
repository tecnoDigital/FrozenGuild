import { FrostCard } from "../../features/board/ui/FrostCard.js";
import styles from "./Lobby.module.css";

type FeaturedCardPreviewProps = {
  id: string;
  label: string;
  image: string;
  detail: string;
};

export function FeaturedCardPreview({ id, label, image, detail }: FeaturedCardPreviewProps) {
  return (
    <section className={styles.panel}>
      <h3 style={{ marginTop: 0 }}>Carta destacada</h3>
      <FrostCard index={0} ariaLabel={label} disabled>
        <img src={image} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </FrostCard>
      <p style={{ marginBottom: 0, color: "var(--muted)" }}>{detail}</p>
    </section>
  );
}
