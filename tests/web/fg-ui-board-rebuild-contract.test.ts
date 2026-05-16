import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { FrostCard } from "../../web/src/features/board/ui/FrostCard";
import { FrozenIceGrid } from "../../web/src/features/board/ui/FrozenIceGrid";
import { BoardSurface } from "../../web/src/features/board/ui/BoardSurface";
import { BoardContainer } from "../../web/src/features/board/ui/BoardContainer";

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

describe("fg board rebuild contract", () => {
  describe("FrostCard", () => {
    it("renders as a native button with data-slot-index and aria-label", () => {
      const tree = FrostCard({ index: 3, ariaLabel: "Penguin card" });
      expect((tree as { type?: unknown }).type).toBe("button");
      expect((tree as { props?: Record<string, unknown> }).props?.["data-slot-index"]).toBe(3);
      expect((tree as { props?: Record<string, unknown> }).props?.["aria-label"]).toBe("Penguin card");
    });

    it("invokes onClick when clicked", () => {
      const onClick = vi.fn();
      const tree = FrostCard({ index: 0, ariaLabel: "Card", onClick });
      (tree as { props?: { onClick?: () => void } }).props?.onClick?.();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders disabled when disabled is true", () => {
      const tree = FrostCard({ index: 0, ariaLabel: "Card", disabled: true });
      expect((tree as { props?: Record<string, unknown> }).props?.disabled).toBe(true);
    });

    it("exposes data-selected when selected is true", () => {
      const tree = FrostCard({ index: 0, ariaLabel: "Card", selected: true });
      expect((tree as { props?: Record<string, unknown> }).props?.["data-selected"]).toBe("true");
    });

    it("exposes data-clickable when clickable is true", () => {
      const tree = FrostCard({ index: 0, ariaLabel: "Card", clickable: true });
      expect((tree as { props?: Record<string, unknown> }).props?.["data-clickable"]).toBe("true");
    });

    it("renders children inside card-inner", () => {
      const tree = FrostCard({ index: 0, ariaLabel: "Card", children: "inner" });
      const nodes = collectElements(tree);
      const innerSpan = nodes.find(
        (n) => (n as { props?: Record<string, unknown> }).props?.className?.includes("cardInner")
      );
      expect(innerSpan).toBeTruthy();
    });
  });

  describe("FrozenIceGrid", () => {
    const makeCards = () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: `c${i}`,
        label: `Card ${i}`,
        image: "/assets/cards/types/penguin-1.png",
        hidden: false,
        empty: false
      }));

    it("renders exactly 9 FrostCard buttons", () => {
      const tree = FrozenIceGrid({ cards: makeCards() });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard);
      expect(frostCards).toHaveLength(9);
    });

    it("marks clickable slots with clickable prop and disabled false", () => {
      const tree = FrozenIceGrid({ cards: makeCards(), clickableSlots: [2, 5] });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
        props?: Record<string, unknown>;
      }[];
      expect(frostCards[2]?.props?.clickable).toBe(true);
      expect(frostCards[5]?.props?.clickable).toBe(true);
      expect(frostCards[0]?.props?.clickable).toBe(false);
      expect(frostCards[2]?.props?.disabled).toBe(false);
      expect(frostCards[5]?.props?.disabled).toBe(false);
    });

    it("marks selected slots with selected prop", () => {
      const tree = FrozenIceGrid({ cards: makeCards(), selectedSlots: [1, 3] });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
        props?: Record<string, unknown>;
      }[];
      expect(frostCards[1]?.props?.selected).toBe(true);
      expect(frostCards[3]?.props?.selected).toBe(true);
      expect(frostCards[0]?.props?.selected).toBe(false);
    });

    it("calls onSlotClick with the correct index when a clickable FrostCard is clicked", () => {
      const onSlotClick = vi.fn();
      const tree = FrozenIceGrid({ cards: makeCards(), clickableSlots: [4], onSlotClick });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
        props?: { onClick?: () => void };
      }[];
      frostCards[4]?.props?.onClick?.();
      expect(onSlotClick).toHaveBeenCalledWith(4);
    });

    it("does not attach onClick to non-clickable slots", () => {
      const onSlotClick = vi.fn();
      const tree = FrozenIceGrid({ cards: makeCards(), clickableSlots: [1], onSlotClick });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
        props?: { onClick?: () => void };
      }[];
      expect(frostCards[0]?.props?.onClick).toBeUndefined();
      expect(typeof frostCards[1]?.props?.onClick).toBe("function");
    });

    it("marks empty slots as disabled", () => {
      const cards = makeCards();
      cards[4] = { ...cards[4], empty: true, id: "empty-4" };
      const tree = FrozenIceGrid({ cards, clickableSlots: [] });
      const nodes = collectElements(tree);
      const frostCards = nodes.filter((n) => (n as { type?: unknown }).type === FrostCard) as {
        props?: Record<string, unknown>;
      }[];
      expect(frostCards[4]?.props?.disabled).toBe(true);
    });
  });

  describe("BoardSurface", () => {
    it("renders as a section with aria-label and children", () => {
      const tree = BoardSurface({ ariaLabel: "Frozen board", children: "content" });
      expect((tree as { type?: unknown }).type).toBe("section");
      expect((tree as { props?: Record<string, unknown> }).props?.["aria-label"]).toBe("Frozen board");
      expect((tree as { props?: { children?: ReactNode } }).props?.children).toBe("content");
    });
  });

  describe("BoardContainer", () => {
    it("exports a function component", () => {
      expect(typeof BoardContainer).toBe("function");
    });
  });
});
