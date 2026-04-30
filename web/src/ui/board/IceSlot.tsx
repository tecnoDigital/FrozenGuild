import styles from "./IceGrid.module.css";
import { Card } from "./Card.js";

type IceSlotProps = {
  cardId: string;
  label: string;
  hidden?: boolean;
  image: string;
  empty?: boolean;
};

export function IceSlot({ cardId, label, hidden = true, image, empty = false }: IceSlotProps) {
  if (empty) {
    return <div className={styles.empty}>Vacio</div>;
  }

  return (
    <div className={styles.slot}>
      <Card id={cardId} label={label} hidden={hidden} image={image} />
    </div>
  );
}
