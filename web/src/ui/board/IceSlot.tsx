import styles from "./IceGrid.module.css";
import { Card } from "./Card.js";
import type { CardInteractionState } from "./Card.js";

type IceSlotProps = {
  cardId: string;
  label: string;
  hidden?: boolean;
  image: string;
  empty?: boolean;
  interactionState?: CardInteractionState;
  onClick?: () => void;
};

export function IceSlot({
  cardId,
  label,
  hidden = true,
  image,
  empty = false,
  interactionState = "idle",
  onClick,
}: IceSlotProps) {
  if (empty) {
    return <div className={styles.empty}>Vacio</div>;
  }

  const slotStateClass = {
    idle: "",
    selectable: styles.slotSelectable,
    selected: styles.slotSelected,
    disabled: styles.slotDisabled,
  }[interactionState];

  return (
    <div className={`${styles.slot} ${slotStateClass}`.trim()}>
      <Card
        id={cardId}
        label={label}
        hidden={hidden}
        image={image}
        interactionState={interactionState}
        onClick={onClick}
      />
    </div>
  );
}
