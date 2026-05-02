import styles from "./CardVisual.module.css";
import type { CardVisualProps } from "./types";

export function CardVisual({ imageSrc, alt, state = "default", isFaceDown = false }: CardVisualProps) {
  const tone = isFaceDown ? "hidden" : state;

  return (
    <article className={`${styles.card} ${styles[tone]}`} data-state={tone}>
      <img className={styles.image} src={imageSrc} alt={alt} loading="lazy" />
    </article>
  );
}
