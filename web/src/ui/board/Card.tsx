import { motion } from "framer-motion";
import styles from "./Card.module.css";
import selectionOverlaySrc from "../../assets/cards/states/card-selected.png";

export type CardInteractionState = "idle" | "selectable" | "selected" | "disabled";

type CardProps = {
  id: string;
  label: string;
  image: string;
  interactionState?: CardInteractionState;
  hidden?: boolean;
  motionLayout?: boolean;
  onClick?: (() => void) | undefined;
};

export function Card({
  id,
  label,
  image,
  interactionState = "idle",
  hidden = false,
  motionLayout = true,
  onClick,
}: CardProps) {
  const interactionClass = {
    idle: styles.idle,
    selectable: styles.selectable,
    selected: styles.selected,
    disabled: styles.disabled,
  }[interactionState];

  const className = `${styles.card} ${interactionClass}`.trim();

  const showOverlay = interactionState === "selectable" || interactionState === "selected";

  const content = (
    <>
      <img
        src={image}
        alt={hidden ? "Carta oculta" : label}
        className={`${styles.img} ${hidden ? styles.imgHidden : styles.imgRevealed}`}
      />
      {showOverlay && (
        <img
          className={styles.selectionOverlay}
          src={selectionOverlaySrc}
          alt=""
          aria-hidden="true"
        />
      )}
    </>
  );

  if (!motionLayout) {
    return (
      <article className={className} onClick={onClick}>
        {content}
      </article>
    );
  }

  return (
    <motion.article
      className={className}
      layout
      layoutId={`card-${id}`}
      initial={false}
      animate={{ rotateY: hidden ? 0 : 2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
    >
      {content}
    </motion.article>
  );
}
