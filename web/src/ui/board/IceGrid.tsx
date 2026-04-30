import type { IceGridCardView } from "../../view-model/iceGridView.js";
import styles from "./IceGrid.module.css";
import { IceSlot } from "./IceSlot.js";

type IceGridProps = {
  cards: IceGridCardView[];
};

export function IceGrid({ cards }: IceGridProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card, index) => (
        <IceSlot
          key={`${card.id}-${index}`}
          cardId={card.id}
          label={card.label}
          hidden={card.hidden}
          image={card.image}
          empty={card.empty}
        />
      ))}
    </div>
  );
}
