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
    <button type="button" className={`${styles.slot} ${selected ? styles.slotSelected : ""}`} onClick={onClick} disabled={!onClick}>
      <Card id={cardId} label={label} hidden={hidden} image={image} />
    </button>
  );
}
