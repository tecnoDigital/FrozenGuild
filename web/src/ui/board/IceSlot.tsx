import { motion } from "framer-motion";
import styles from "./IceGrid.module.css";
import { Card } from "./Card.js";

type IceSlotProps = {
  cardId: string;
  label: string;
  hidden?: boolean;
  image: string;
  empty?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function IceSlot({ cardId, label, hidden = true, image, empty = false, selected = false, onClick }: IceSlotProps) {
  if (empty) {
    return <div className={styles.empty}>Vacio</div>;
  }

  return (
    <motion.button
      type="button"
      className={`${styles.slot} ${selected ? styles.slotSelected : ""} ${onClick ? styles.slotClickable : styles.slotDisabled}`}
      onClick={onClick}
      disabled={!onClick}
      initial={false}
      animate={{ scale: selected ? 1.02 : 1, opacity: onClick ? 1 : 0.72 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <Card id={cardId} label={label} hidden={hidden} image={image} />
    </motion.button>
  );
}
