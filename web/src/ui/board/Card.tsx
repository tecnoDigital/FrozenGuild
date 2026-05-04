import { motion } from "framer-motion";
import styles from "./Card.module.css";

type CardProps = {
  id: string;
  label: string;
  image: string;
  selected?: boolean;
  hidden?: boolean;
  motionLayout?: boolean;
};

export function Card({ id, label, image, selected = false, hidden = false, motionLayout = true }: CardProps) {
  const className = `${styles.card} ${selected ? styles.selected : ""}`.trim();
  const content = (
    <>
      <img src={image} alt={hidden ? "Carta oculta" : label} className={`${styles.img} ${hidden ? styles.imgHidden : styles.imgRevealed}`} />

    </>
  );

  if (!motionLayout) {
    return <article className={className}>{content}</article>;
  }

  return (
    <motion.article
      className={className}
      layout
      layoutId={`card-${id}`}
      initial={false}
      animate={{ rotateY: hidden ? 0 : 2, scale: selected ? 1.02 : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {content}
    </motion.article>
  );
}
