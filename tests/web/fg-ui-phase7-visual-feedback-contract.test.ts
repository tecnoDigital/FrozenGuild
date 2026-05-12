import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { DicePanel } from "../../web/src/ui/actions/DicePanel";
import { FrozenIceGrid } from "../../web/src/features/board/ui/FrozenIceGrid";
import { LocalPlayerHandPanel } from "../../web/src/ui/players/LocalPlayerHandPanel";
import { PlayerLedgerRow } from "../../web/src/ui/players/PlayerLedgerRow";

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

describe("fg phase 7 visual feedback contract", () => {
  it("exposes explicit visual-state flags for available vs disabled dice actions", () => {
    const readyTree = DicePanel({ value: null, rolled: false, disabled: false });
    const blockedTree = DicePanel({ value: null, rolled: false, disabled: true });

    expect((readyTree as { props?: Record<string, unknown> }).props?.["data-action-available"]).toBe("true");
    expect((blockedTree as { props?: Record<string, unknown> }).props?.["data-action-available"]).toBe("false");
    expect((blockedTree as { props?: Record<string, unknown> }).props?.["aria-disabled"]).toBe(true);
  });

  it("marks hidden and revealed card states with explicit accessibility labels", () => {
    const cards = Array.from({ length: 9 }, (_, i) => ({
      id: `c${i}`,
      label: `Card ${i}`,
      image: "/assets/cards/types/penguin-1.png",
      hidden: false,
      empty: false
    }));
    cards[0] = { id: "c-hidden", label: "K♠", image: "/assets/cards/backs/frozen-dreamcatcher-back.png", hidden: true, empty: false };
    cards[1] = { id: "c-open", label: "A♣", image: "/assets/cards/fronts/clubs/a.png", hidden: false, empty: false };

    const tree = FrozenIceGrid({ cards });
    const nodes = collectElements(tree);
    const imgs = nodes.filter((n) => (n as { type?: unknown }).type === "img") as {
      props?: Record<string, unknown>;
    }[];

    expect(imgs[0]?.props?.alt).toBe("Carta oculta");
    expect(imgs[1]?.props?.alt).toBe("A♣");
  });

  it("marks active-turn player rows for immediate turn recognition", () => {
    const activeTree = PlayerLedgerRow({ id: "p1", name: "Don Krill", score: 4, cardCount: 2, cardIDs: ["c1", "c2"], isActiveTurn: true });

    expect((activeTree as { props?: Record<string, unknown> }).props?.["data-active-turn"]).toBe("true");
  });

  it("exposes deterministic avatar fallback for player identity", () => {
    const rowTree = PlayerLedgerRow({ id: "p2", name: "Arctic Nova", score: 8, cardCount: 2, cardIDs: ["c1", "c2"] });
    const nodes = collectElements(rowTree);
    const avatarNode = nodes.find((node) => (node as { props?: Record<string, unknown> }).props?.["data-avatar-fallback"] === "true");

    expect(avatarNode).toBeTruthy();
  });

  it("renders dedicated local-hand frame contract separate from ledger rows", () => {
    const handTree = LocalPlayerHandPanel({
      playerName: "Capitán Local",
      score: 12,
      cardIDs: ["c1", "c2", "c3"],
      clickableCardIndexes: [1],
      selectedCardIndexes: [1]
    });

    const nodes = collectElements(handTree);
    const frameNode = nodes.find((node) => (node as { props?: Record<string, unknown> }).props?.["data-local-hand-frame"] === "true");
    const compactHandNode = nodes.find((node) => {
      const props = (node as { props?: Record<string, unknown> }).props;
      return Array.isArray(props?.selectedIndexes) && (props?.selectedIndexes as number[]).includes(1);
    });

    expect(frameNode).toBeTruthy();
    expect(compactHandNode).toBeTruthy();
  });
});
