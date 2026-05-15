import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Players.module.css";
import { getCardAssetById } from "../../view-model/assetMap.js";
import {
  buildVisualSlots,
  computeFanTransforms,
  type VisualSlot,
} from "./handFan.js";

type CompactHandProps = {
  cardIDs: string[];
  /** @deprecated use selectableIndexes instead */
  clickableIndexes?: number[];
  selectableIndexes?: number[];
  selectedIndexes?: number[];
  onCardClick?: (index: number) => void;
  size?: "compact" | "local" | "hud";
};

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function getCardLabel(cardID: string): string {
  // Simple heuristic: extract readable name from cardID like "penguin-001"
  const [type] = cardID.split("-");
  return type ?? cardID;
}

function getIsSlotInteractive(
  slot: VisualSlot,
  onCardClick: CompactHandProps["onCardClick"],
  selectable: Set<number>
): { isSelectable: boolean; isSelected: boolean; targetIndex: number | null } {
  if (!onCardClick || slot.kind === "stack") {
    return { isSelectable: false, isSelected: false, targetIndex: null };
  }
  const index = slot.realIndexes[0]!;
  return {
    isSelectable: selectable.has(index),
    isSelected: false, // computed separately via selected Set
    targetIndex: index,
  };
}

export function CompactHand({
  cardIDs,
  clickableIndexes = [],
  selectableIndexes,
  selectedIndexes = [],
  onCardClick,
  size = "compact",
}: CompactHandProps) {
  const rawSelectable = selectableIndexes ?? clickableIndexes;
  const selectable = useMemo(() => new Set(rawSelectable), [rawSelectable]);
  const selected = useMemo(() => new Set(selectedIndexes), [selectedIndexes]);
  const isHud = size === "hud";
  const isLocal = size === "local";

  const prevCardIDs = usePrevious(cardIDs);
  const newestCardID = useMemo(() => {
    if (!prevCardIDs || prevCardIDs.length >= cardIDs.length) return null;
    const prevSet = new Set(prevCardIDs);
    for (const id of cardIDs) {
      if (!prevSet.has(id)) return id;
    }
    return null;
  }, [prevCardIDs, cardIDs]);

  const visualSlots = useMemo(
    () =>
      buildVisualSlots(cardIDs, {
        selectableIndexes: rawSelectable,
        selectedIndexes,
      }),
    [cardIDs, rawSelectable, selectedIndexes]
  );

  const localTransforms = useMemo(() => {
    if (!isLocal) return [];
    // Estimated card width in px for local size (midpoint of new clamp range)
    return computeFanTransforms(visualSlots.length, 210);
  }, [isLocal, visualSlots.length]);

  const containerClass = isHud
    ? styles.hudHand
    : isLocal
    ? `${styles.handLocal} ${styles.handLocalFan}`
    : styles.hand;

  return (
    <div
      className={containerClass}
      aria-label="Cartas visibles del jugador"
    >
      {visualSlots.map((slot, slotIndex) => {
        const cardID = slot.displayCardID;
        const isStack = slot.kind === "stack";
        const isNew = newestCardID
          ? slot.realIndexes.some((idx) => cardIDs[idx] === newestCardID)
          : false;

        const { isSelectable, targetIndex } = getIsSlotInteractive(
          slot,
          onCardClick,
          selectable
        );
        const isSelected =
          !isStack && targetIndex !== null && selected.has(targetIndex);

        const label = `${getCardLabel(cardID)} ${isSelectable ? "seleccionable" : "bloqueada"}`;

        // Local desktop fan layout
        if (isLocal) {
          const transform = localTransforms[slotIndex];
          return (
            <div
              key={slot.id}
              className={`${styles.fanCardLocal} ${isNew ? styles.fanCardNew : ""} ${isStack ? styles.fanCardStack : ""}`}
              style={
                transform
                  ? ({
                      "--card-x": `${transform.x}px`,
                      "--card-y": `${transform.y}px`,
                      "--card-r": `${transform.rotation}deg`,
                      "--card-z": transform.zIndex,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className={styles.fanCardInnerLocal}>
                {isStack ? (
                  <div className={styles.stackLayers} aria-hidden="true">
                    <div className={styles.stackLayerBack} />
                    <div className={styles.stackLayerMid} />
                  </div>
                ) : null}
                {isStack ? <span className={styles.stackCount}>×{slot.count}</span> : null}
                <button
                  type="button"
                  className={`${styles.fanCardButtonLocal} ${isSelectable ? styles.fanCardButtonLocalSelectable : ""} ${isSelected ? styles.fanCardButtonLocalSelected : ""}`}
                  onClick={
                    isSelectable && targetIndex !== null
                      ? () => onCardClick!(targetIndex)
                      : undefined
                  }
                  disabled={!isSelectable}
                  aria-pressed={isSelected}
                  aria-label={label}
                >
                  <motion.div
                    layout
                    layoutId={`card-${cardID}`}
                    className={styles.fanCardFaceLocal}
                    title={cardID}
                    initial={false}
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                      y: isSelected ? -4 : 0,
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <img
                      className={styles.fanCardImgLocal}
                      src={getCardAssetById(cardID)}
                      alt=""
                      draggable="false"
                    />
                  </motion.div>
                </button>
              </div>
            </div>
          );
        }

        // HUD compact layout (no premium fan; keep readable and unobtrusive)
        if (isHud) {
          return (
            <button
              key={slot.id}
              type="button"
              className={`${styles.hudCardButton} ${isSelectable ? styles.hudCardSelectable : ""} ${isSelected ? styles.hudCardSelected : ""}`}
              onClick={
                isSelectable && targetIndex !== null
                  ? () => onCardClick!(targetIndex)
                  : undefined
              }
              disabled={!isSelectable}
              aria-pressed={isSelected}
              aria-label={label}
            >
              <motion.div
                layout
                layoutId={`card-${cardID}`}
                className={styles.hudCard}
                title={cardID}
                initial={false}
                animate={{
                  scale: isSelected ? 1.1 : 1,
                  y: isSelected ? -2 : 0,
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <img
                  className={styles.hudCardImg}
                  src={getCardAssetById(cardID)}
                  alt=""
                  draggable="false"
                />
                {isStack ? (
                  <span className={styles.hudStackCount}>{slot.count}</span>
                ) : null}
              </motion.div>
            </button>
          );
        }

        // Compact / fallback layout
        return (
          <button
            key={slot.id}
            type="button"
            className={`${styles.compactCardButton} ${isLocal ? styles.compactCardButtonLocal : ""} ${isSelectable ? styles.compactCardSelectable : ""} ${isSelected ? styles.compactCardSelected : ""}`}
            onClick={
              isSelectable && targetIndex !== null
                ? () => onCardClick!(targetIndex)
                : undefined
            }
            disabled={!isSelectable}
            aria-pressed={isSelected}
            aria-label={label}
            style={{ zIndex: cardIDs.length - (targetIndex ?? 0) }}
          >
            <motion.div
              layout
              layoutId={`card-${cardID}`}
              className={`${styles.compactCard} ${isLocal ? styles.compactCardLocal : ""}`}
              title={cardID}
              initial={false}
              animate={{
                scale: isSelected ? 1.1 : 1,
                y: isSelected ? -1 : 0,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <img
                className={styles.compactCardImg}
                src={getCardAssetById(cardID)}
                alt=""
                draggable="false"
              />
              {isStack ? (
                <span className={styles.compactStackCount}>{slot.count}</span>
              ) : null}
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
