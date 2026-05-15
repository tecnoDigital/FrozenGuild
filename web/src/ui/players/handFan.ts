import { getCardById } from "../../../../shared/game/cards.js";

export function getCardStackKey(cardId: string): string {
  const card = getCardById(cardId);
  if (!card) {
    return cardId;
  }
  if (card.type === "penguin") {
    return `penguin:${card.value ?? "none"}`;
  }
  return `${card.type}:none`;
}

export type VisualSlot = {
  id: string;
  kind: "single" | "stack";
  displayCardID: string;
  realIndexes: number[];
  count: number;
};

export function buildVisualSlots(
  cardIDs: string[],
  options: {
    selectableIndexes?: number[];
    selectedIndexes?: number[];
    stackThreshold?: number;
  } = {}
): VisualSlot[] {
  const {
    selectableIndexes = [],
    selectedIndexes = [],
    stackThreshold = 3,
  } = options;

  const selectableSet = new Set(selectableIndexes);
  const selectedSet = new Set(selectedIndexes);

  // Build consecutive groups preserving original order
  const groups: { key: string; items: { cardID: string; index: number }[] }[] = [];

  cardIDs.forEach((cardID, index) => {
    const key = getCardStackKey(cardID);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === key) {
      lastGroup.items.push({ cardID, index });
    } else {
      groups.push({ key, items: [{ cardID, index }] });
    }
  });

  return groups.flatMap((group): VisualSlot[] => {
    const hasSelectable = group.items.some((item) =>
      selectableSet.has(item.index)
    );
    const hasSelected = group.items.some((item) => selectedSet.has(item.index));
    const shouldStack =
      group.items.length >= stackThreshold && !hasSelectable && !hasSelected;

    if (shouldStack) {
      const firstIndex = group.items[0].index;
      return [
        {
          id: `stack:${group.key}@${firstIndex}`,
          kind: "stack",
          displayCardID: group.items[group.items.length - 1]!.cardID,
          realIndexes: group.items.map((item) => item.index),
          count: group.items.length,
        },
      ];
    }

    return group.items.map((item) => ({
      id: item.cardID,
      kind: "single",
      displayCardID: item.cardID,
      realIndexes: [item.index],
      count: 1,
    }));
  });
}

export type FanTransform = {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeFanTransforms(
  slotCount: number,
  cardWidth: number
): FanTransform[] {
  if (slotCount <= 0) {
    return [];
  }
  if (slotCount === 1) {
    return [{ x: 0, y: 0, rotation: 0, zIndex: 1 }];
  }

  const center = (slotCount - 1) / 2;
  // Wider arc: more aggressive rotation and lift for a premium feel.
  const maxRotation = clamp(8 + slotCount * 0.9, 14, 28);
  const overlap = clamp(
    cardWidth * (0.30 + slotCount * 0.008),
    cardWidth * 0.28,
    cardWidth * 0.46
  );
  const step = cardWidth - overlap;
  const liftCurve = clamp(12 + slotCount * 1.8, 22, 48);

  return Array.from({ length: slotCount }, (_, index) => {
    const distance = index - center;
    const normalized = center === 0 ? 0 : distance / center;

    return {
      x: distance * step,
      y: Math.abs(normalized) * liftCurve,
      rotation: normalized * maxRotation,
      zIndex: index + 1,
    };
  });
}
