import { useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./PadrinoChoicePanel.module.css";
import {
  getPadrinoCardMeta,
  getPadrinoActions,
  computePadrinoFanTransform,
  isPadrinoActionSelected,
  type PadrinoCardAction
} from "./padrinoChoicePanel.logic.js";

type PadrinoChoicePanelProps = {
  selectedAction: 1 | 4 | 5 | null;
  onSelect: (action: 1 | 4 | 5) => void;
};

const CARD_WIDTH = 220; // max visual card width in px for low-overlap fan calculations

export function PadrinoChoicePanel({ selectedAction, onSelect }: PadrinoChoicePanelProps) {
  const handleSelect = useCallback(
    (action: PadrinoCardAction) => {
      onSelect(action);
    },
    [onSelect]
  );

  const actions = getPadrinoActions();

  return (
    <div className={styles.ritual} role="group" aria-label="El Padrino: elige un contrato">
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.mainTitle}>El Padrino te hará un favor</h2>
          <p className={styles.subTitle}>Escoge solo uno</p>
        </div>

        <div className={styles.fan}>
          {actions.map((action, index) => {
            const meta = getPadrinoCardMeta(action);
            const transform = computePadrinoFanTransform(index, actions.length, CARD_WIDTH);
            const selected = isPadrinoActionSelected({ selectedAction, confirmed: false }, action);
            const hasSelection = selectedAction !== null;

            return (
              <motion.button
                key={meta.label}
                type="button"
                className={[
                  styles.card,
                  styles.cardSelectable,
                  hasSelection && !selected ? styles.cardMuted : "",
                  selected ? styles.cardSelected : ""
                ].join(" ")}
                initial={{ opacity: 0, y: 40, scale: 0.88, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: -transform.y,
                  x: transform.x,
                  rotate: transform.rotation,
                  scale: selected ? 1.06 : 1,
                  zIndex: selected ? 60 : transform.zIndex
                }}
                whileHover={
                  selected
                    ? {}
                    : {
                        y: -transform.y - 10,
                        scale: 1.04,
                        transition: { duration: 0.18 }
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  delay: index * 0.18 + 0.35
                }}
                onClick={() => handleSelect(action)}
                aria-label={`${meta.label}: ${meta.description}`}
                aria-pressed={selected}
              >
                <img
                  className={styles.cardImage}
                  src={meta.imageSrc}
                  alt={meta.sublabel}
                  loading="eager"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
