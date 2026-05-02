import { describe, expect, it } from "vitest";
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
      "seal-bomb",
      "mountain"
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
});
