export type FrozenGuildCardType =
  | "penguin"
  | "walrus"
  | "petrel"
  | "sea-elephant"
  | "krill"
  | "orca"
  | "seal-bomb";

export type FrozenGuildCardVariant =
  | "penguin-1"
  | "penguin-2"
  | "penguin-3"
  | "walrus"
  | "petrel"
  | "sea-elephant"
  | "krill"
  | "orca"
  | "seal-bomb";

export interface CardVisualProps {
  cardType: FrozenGuildCardType;
  variant: FrozenGuildCardVariant;
  imageSrc: string;
  alt: string;
  state?: "default" | "selected" | "disabled" | "hidden" | "highlighted";
  isFaceDown?: boolean;
}

export interface BoardCardSlotProps {
  slotId: string;
  card?: CardVisualProps;
  highlighted?: boolean;
}

export interface PlayerSummaryProps {
  id: string;
  name: string;
  score: number;
  avatarSrc: string;
  colorHex?: string;
}

export interface OpponentRowProps extends PlayerSummaryProps {
  handCount: number;
  isCurrentTurn?: boolean;
}

export interface OpponentPanelProps {
  title: string;
  opponents: OpponentRowProps[];
}

export interface ScorePanelProps {
  title: string;
  players: PlayerSummaryProps[];
}

export interface CurrentTurnPanelProps {
  currentPlayerName: string;
  turnCount: number;
}

export interface DeckPanelProps {
  remainingCards: number;
  backImageSrc: string;
}

export interface DicePanelProps {
  result: number;
  maxValue: number;
  frameSrc?: string;
}

export interface ActionButtonProps {
  id: string;
  label: string;
  iconSrc?: string;
  disabled?: boolean;
}

export interface ActionBarProps {
  actions: ActionButtonProps[];
  frameSrc?: string;
}

export interface PlayerHandProps {
  playerId: string;
  cards: CardVisualProps[];
  frameSrc?: string;
}

export interface RoundBadgeProps {
  roundLabel: string;
  subtitle?: string;
}

export interface GameShellProps {
  boardSlots: BoardCardSlotProps[];
  localPlayer: PlayerSummaryProps;
  opponents: OpponentRowProps[];
  scorePanel: ScorePanelProps;
  turnPanel: CurrentTurnPanelProps;
  deckPanel: DeckPanelProps;
  dicePanel: DicePanelProps;
  actionBar: ActionBarProps;
  playerHand: PlayerHandProps;
  roundBadge: RoundBadgeProps;
}
