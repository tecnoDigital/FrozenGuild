import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { ActionBar } from "../../web/src/features/game/ui/ActionBar";
import { ActionButton } from "../../web/src/features/game/ui/ActionButton";
import { BoardCardSlot } from "../../web/src/features/game/ui/BoardCardSlot";
import { CurrentTurnPanel } from "../../web/src/features/game/ui/CurrentTurnPanel";
import { CurrentTurnPanelContainer } from "../../web/src/features/game/ui/CurrentTurnPanelContainer";
import { DeckPanel } from "../../web/src/features/game/ui/DeckPanel";
import { DicePanel } from "../../web/src/features/game/ui/DicePanel";
import { GameShell } from "../../web/src/features/game/ui/GameShell";
import { LocalPlayerHandContainer } from "../../web/src/features/game/ui/LocalPlayerHandContainer";
import { OpponentPanel } from "../../web/src/features/game/ui/OpponentPanel";
import { OpponentPanelContainer } from "../../web/src/features/game/ui/OpponentPanelContainer";
import { OpponentRow } from "../../web/src/features/game/ui/OpponentRow";
import { PlayerHand } from "../../web/src/features/game/ui/PlayerHand";
import { RoundBadgeContainer } from "../../web/src/features/game/ui/RoundBadgeContainer";
import { ScorePanel } from "../../web/src/features/game/ui/ScorePanel";
import { ScorePanelContainer } from "../../web/src/features/game/ui/ScorePanelContainer";
import type {
  ActionBarProps,
  ActionButtonProps,
  BoardCardSlotProps,
  CardVisualProps,
  CurrentTurnPanelProps,
  DeckPanelProps,
  DicePanelProps,
  GameShellProps,
  OpponentRowProps,
  PlayerHandProps,
  PlayerSummaryProps,
  RoundBadgeProps,
  ScorePanelProps
} from "../../web/src/features/game/ui/types";
import { mockGameShell } from "../../web/src/features/game/ui/mockData";
import { assets } from "../../web/src/ui/assets";

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

function getTestIds(tree: unknown[]): string[] {
  return tree
    .map((node) => (node as { props?: { [key: string]: unknown } }).props?.["data-testid"])
    .filter((value): value is string => typeof value === "string");
}

describe("fg phase 3 UI contract", () => {
  it("exports the expected visual contract types", () => {
    const cardVisual: CardVisualProps = {
      cardType: "penguin",
      variant: "penguin-1",
      imageSrc: "/assets/cards/types/penguin-1.png",
      state: "default",
      alt: "Penguin card"
    };

    const boardSlot: BoardCardSlotProps = { slotId: "r0c0", card: cardVisual };
    const summary: PlayerSummaryProps = {
      id: "p1",
      name: "Player",
      score: 2,
      avatarSrc: "/assets/characters/avatars/penguin-1.png"
    };
    const opponent: OpponentRowProps = { ...summary, handCount: 3 };
    const scorePanel: ScorePanelProps = { title: "Score", players: [summary] };
    const turnPanel: CurrentTurnPanelProps = { currentPlayerName: "Player", turnCount: 3 };
    const deckPanel: DeckPanelProps = { remainingCards: 18, backImageSrc: "/assets/cards/backs/frozen-dreamcatcher-back.png" };
    const dicePanel: DicePanelProps = { result: 4, maxValue: 6, frameSrc: "/assets/ui/frames/dice-panel-frame.png" };
    const actionButton: ActionButtonProps = { id: "roll", label: "Roll", disabled: false };
    const actionBar: ActionBarProps = { actions: [actionButton], frameSrc: "/assets/ui/frames/action-bar-frame.png" };
    const hand: PlayerHandProps = { playerId: "p1", cards: [cardVisual], frameSrc: "/assets/ui/frames/player-hand-frame.png" };
    const roundBadge: RoundBadgeProps = { roundLabel: "Round 2", subtitle: "Ice Table" };
    const shell: GameShellProps = {
      boardSlots: [boardSlot],
      localPlayer: summary,
      opponents: [opponent],
      scorePanel,
      turnPanel,
      deckPanel,
      dicePanel,
      actionBar,
      playerHand: hand,
      roundBadge
    };

    expect(shell.boardSlots).toHaveLength(1);
    expect(shell.playerHand.cards[0].cardType).toBe("penguin");
  });

  it("uses only FrozenGuild custom card types in mock data", () => {
    const allowed = new Set([
      "penguin",
      "walrus",
      "petrel",
      "sea-elephant",
      "krill",
      "orca",
      "seal-bomb"
    ]);

    for (const slot of mockGameShell.boardSlots) {
      if (slot.card) {
        expect(allowed.has(slot.card.cardType)).toBe(true);
      }
    }

    const allCards = [...mockGameShell.playerHand.cards];

    for (const card of allCards) {
      expect(allowed.has(card.cardType)).toBe(true);
      expect(["hearts", "spades", "diamonds", "clubs"].includes(card.cardType)).toBe(false);
    }
  });

  it("exposes phase 3 component modules", () => {
    expect(typeof PlayerHand).toBe("function");
    expect(typeof OpponentRow).toBe("function");
    expect(typeof OpponentPanel).toBe("function");
    expect(typeof ScorePanel).toBe("function");
    expect(typeof CurrentTurnPanel).toBe("function");
    expect(typeof DeckPanel).toBe("function");
    expect(typeof DicePanel).toBe("function");
    expect(typeof ActionButton).toBe("function");
    expect(typeof ActionBar).toBe("function");
  });

  it("builds phase 4 shell composition with existing phase 3 components", () => {
    const shellTree = GameShell(mockGameShell);
    const nodes = collectElements(shellTree);
    const nodeTypes = new Set(nodes.map((node) => (node as { type?: unknown }).type));
    const testIds = getTestIds(nodes);

    expect(nodeTypes.has(RoundBadgeContainer)).toBe(true);
    expect(nodeTypes.has(BoardCardSlot)).toBe(true);
    expect(nodeTypes.has(CurrentTurnPanelContainer)).toBe(true);
    expect(nodeTypes.has(ScorePanelContainer)).toBe(true);
    expect(nodeTypes.has(DeckPanel)).toBe(true);
    expect(nodeTypes.has(OpponentPanelContainer)).toBe(true);
    expect(nodeTypes.has(DicePanel)).toBe(true);
    expect(nodeTypes.has(ActionBar)).toBe(true);
    expect(nodeTypes.has(LocalPlayerHandContainer)).toBe(true);

    expect(testIds.includes("phase4-top-bar")).toBe(true);
    expect(testIds.includes("phase4-board")).toBe(true);
    expect(testIds.includes("phase4-left-panel")).toBe(true);
    expect(testIds.includes("phase4-opponents-panel")).toBe(true);
    expect(testIds.includes("phase4-dice-actions")).toBe(true);
    expect(testIds.includes("phase4-local-hand")).toBe(true);

    const logoNode = nodes.find(
      (node) =>
        (node as { props?: { [key: string]: unknown } }).props?.["data-testid"] === "phase4-logo"
    ) as { props?: { src?: unknown; alt?: unknown } } | undefined;

    expect(logoNode?.props?.src).toBe(assets.brand.logoMain);
    expect(logoNode?.props?.alt).toBe("Frozen Guild logo");
  });

  it("keeps phase 4 mock card universe free of suit and mountain concepts", () => {
    const serialized = JSON.stringify(mockGameShell).toLowerCase();

    expect(serialized.includes("hearts")).toBe(false);
    expect(serialized.includes("spades")).toBe(false);
    expect(serialized.includes("diamonds")).toBe(false);
    expect(serialized.includes("clubs")).toBe(false);
    expect(serialized.includes("mountain")).toBe(false);
  });
});
