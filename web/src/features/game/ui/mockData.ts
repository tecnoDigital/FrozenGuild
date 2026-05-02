import { assets } from "../../../ui/assets";
import type {
  BoardCardSlotProps,
  CardVisualProps,
  FrozenGuildCardType,
  FrozenGuildCardVariant,
  GameShellProps
} from "./types";

type CardSeed = {
  cardType: FrozenGuildCardType;
  variant: FrozenGuildCardVariant;
};

const cardImageByVariant: Record<FrozenGuildCardVariant, string> = {
  "penguin-1": assets.cards.fronts.penguin1,
  "penguin-2": assets.cards.fronts.penguin2,
  "penguin-3": assets.cards.fronts.penguin3,
  walrus: assets.cards.fronts.walrus,
  petrel: assets.cards.fronts.petrel,
  "sea-elephant": assets.cards.fronts.seaElephant,
  krill: assets.cards.fronts.krill,
  orca: assets.cards.fronts.orca,
  "seal-bomb": assets.cards.fronts.sealBomb
};

function createCard(seed: CardSeed): CardVisualProps {
  return {
    cardType: seed.cardType,
    variant: seed.variant,
    imageSrc: cardImageByVariant[seed.variant],
    alt: `${seed.cardType} card`,
    state: "default"
  };
}

const boardSeeds: Array<CardSeed | null> = [
  { cardType: "penguin", variant: "penguin-1" },
  { cardType: "walrus", variant: "walrus" },
  { cardType: "petrel", variant: "petrel" },
  { cardType: "sea-elephant", variant: "sea-elephant" },
  null,
  { cardType: "krill", variant: "krill" },
  { cardType: "orca", variant: "orca" },
  { cardType: "seal-bomb", variant: "seal-bomb" },
  { cardType: "penguin", variant: "penguin-3" }
];

const boardSlots: BoardCardSlotProps[] = boardSeeds.map((seed, index) => ({
  slotId: `slot-${index + 1}`,
  card: seed ? createCard(seed) : undefined,
  highlighted: index === 4
}));

export const mockGameShell: GameShellProps = {
  boardSlots,
  localPlayer: {
    id: "player-local",
    name: "Captain Frost",
    score: 12,
    avatarSrc: assets.characters.avatars.penguin1,
    colorHex: "#6ce4ff"
  },
  opponents: [
    {
      id: "opponent-1",
      name: "Walrus Don",
      score: 10,
      avatarSrc: assets.characters.avatars.walrus,
      handCount: 4,
      isCurrentTurn: true
    }
  ],
  scorePanel: {
    title: "Score",
    players: [
      {
        id: "player-local",
        name: "Captain Frost",
        score: 12,
        avatarSrc: assets.characters.avatars.penguin1
      }
    ]
  },
  turnPanel: {
    currentPlayerName: "Walrus Don",
    turnCount: 5
  },
  deckPanel: {
    remainingCards: 18,
    backImageSrc: assets.cards.back
  },
  dicePanel: {
    result: 4,
    maxValue: 6,
    frameSrc: assets.ui.frames.dicePanel
  },
  actionBar: {
    actions: [
      { id: "roll", label: "Roll Dice", iconSrc: assets.ui.icons.dice },
      { id: "seal", label: "Seal-Bomb", disabled: true },
      { id: "orca", label: "Orca" }
    ],
    frameSrc: assets.ui.frames.actionBar
  },
  playerHand: {
    playerId: "player-local",
    cards: [
      createCard({ cardType: "penguin", variant: "penguin-2" }),
      createCard({ cardType: "seal-bomb", variant: "seal-bomb" }),
      createCard({ cardType: "orca", variant: "orca" })
    ],
    frameSrc: assets.ui.frames.playerHand
  },
  roundBadge: {
    roundLabel: "Round 3",
    subtitle: "Frozen Guild"
  }
};
