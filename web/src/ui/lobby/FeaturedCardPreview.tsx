import { Card } from "../board/Card.js";
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
      <Card id={id} label={label} image={image} motionLayout={false} />
      <p style={{ marginBottom: 0, color: "var(--muted)" }}>{detail}</p>
    </section>
  );
}
