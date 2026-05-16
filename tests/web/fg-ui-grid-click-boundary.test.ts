import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { FrostCard } from "../../web/src/features/board/ui/FrostCard";
import { FrozenIceGrid } from "../../web/src/features/board/ui/FrozenIceGrid";

function collectElements(node: ReactNode, bucket: unknown[] = []): unknown[] {
  if (!node) return bucket;
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, bucket);
    return bucket;
  }

  if (typeof node === "object" && "props" in node && "type" in node) {
    bucket.push(node);
    const children = (node as { props?: { children?: ReactNode } }).props?.children;
    collectElements(children, bucket);
  }

  return bucket;
}

describe("fg grid click boundary contract", () => {
  it("invokes onSlotClick when clicking a clickable FrostCard", () => {
    const onSlotClick = vi.fn();
    const cards = Array.from({ length: 9 }, (_, i) => ({
      id: `c${i}`,
      label: `Card ${i}`,
      image: "/assets/cards/types/penguin-1.png",
      hidden: false,
      empty: false
    }));
    const tree = FrozenIceGrid({ cards, clickableSlots: [1], onSlotClick });
    const nodes = collectElements(tree);
    const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
      props?: { onClick?: () => void; disabled?: boolean };
    }[];

    const cell = frostCards[1];
    expect(cell).toBeTruthy();
    expect(cell.props?.disabled).toBe(false);
    cell.props?.onClick?.();
    expect(onSlotClick).toHaveBeenCalledTimes(1);
    expect(onSlotClick).toHaveBeenCalledWith(1);
  });

  it("does not invoke onSlotClick when clicking a non-clickable FrostCard", () => {
    const onSlotClick = vi.fn();
    const cards = Array.from({ length: 9 }, (_, i) => ({
      id: `c${i}`,
      label: `Card ${i}`,
      image: "/assets/cards/types/penguin-1.png",
      hidden: false,
      empty: false
    }));
    const tree = FrozenIceGrid({ cards, clickableSlots: [1], onSlotClick });
    const nodes = collectElements(tree);
    const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
      props?: { onClick?: () => void };
    }[];

    const cell = frostCards[0];
    expect(cell).toBeTruthy();
    expect(cell.props?.onClick).toBeUndefined();
  });

  it("does not attach onClick to FrostCard children", () => {
    const tree = FrostCard({ index: 0, ariaLabel: "Card 1", children: "inner" });
    const nodes = collectElements(tree);
    const clickableNodes = nodes.filter(
      (n) => typeof (n as { props?: Record<string, unknown> }).props?.onClick === "function"
    );
    expect(clickableNodes).toHaveLength(0);
  });

  it("does not forward onSlotClick to inner elements in FrozenIceGrid", () => {
    const onSlotClick = vi.fn();
    const cards = Array.from({ length: 9 }, (_, i) => ({
      id: `c${i}`,
      label: `Card ${i}`,
      image: "/assets/cards/types/penguin-1.png",
      hidden: false,
      empty: false
    }));
    const tree = FrozenIceGrid({ cards, clickableSlots: [0], onSlotClick });
    const nodes = collectElements(tree);
    const imgNodes = nodes.filter((n) => (n as { type?: unknown }).type === "img") as {
      props?: Record<string, unknown>;
    }[];

    for (const img of imgNodes) {
      expect(img.props?.onClick).toBeUndefined();
    }
  });
});
