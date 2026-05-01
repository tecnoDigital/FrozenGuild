export type CardType =
  | "penguin"
  | "walrus"
  | "petrel"
  | "sea_elephant"
  | "krill"
  | "orca"
  | "seal_bomb";

export type CardId = string;
export type PlayerID = string;

export type HiddenCardView = {
  hidden: true;
};

export type PenguinFishValue = 1 | 2 | 3;

export type Card = {
  id: CardId;
  type: CardType;
  image: string;
  value?: PenguinFishValue;
};

export type IceGridSlot = CardId | HiddenCardView | null;

export type PlayerState = {
  name: string;
  zone: CardId[];
  hasBombAtStart: boolean;
  hasBombAtEnd: boolean;
  connectionStatus: "connected" | "reconnecting" | "absent";
  disconnectStartedAt?: number;
};

export type AutoResolveItem = {
  playerID: PlayerID;
  stageType: "ORCA_DESTROY_SELECTION" | "SEAL_EXPLOSION" | "TURN_SKIP";
  startedAt: number;
  resolveAfterMs: number;
};

export type PendingStage =
  | {
      type: "ORCA_DESTROY_SELECTION";
      playerID: PlayerID;
      orcaCardID: CardId;
      validTargets: CardId[];
    }
  | null;

export type DiceState = {
  value: number | null;
  rolled: boolean;
};

export type TurnState = {
  actionCompleted: boolean;
  padrinoAction: 1 | 2 | 3 | 4 | 5 | null;
};

export type SpyState = {
  playerID: PlayerID;
  revealedSlots: number[];
};

export type OrcaResolutionState = {
  playerID: PlayerID;
  orcaCardID: CardId;
  validTargetCardIDs: CardId[];
};

export type SealBombResolutionState = {
  playerID: PlayerID;
  bombCardID: CardId;
  requiredDiscardCount: number;
  validTargetCardIDs: CardId[];
};

export type SwapLocation =
  | {
      area: "ice_grid";
      slot: number;
    }
  | {
      area: "player_zone";
      playerID: PlayerID;
      index: number;
    };

export type FrozenGuildState = {
  version: string;
  createdAt: number;
  activeTable: boolean;
  botActivity: {
    playerID: PlayerID | null;
    startedAt: number | null;
    completedAt: number | null;
  };
  botIDs: PlayerID[];
  deck: CardId[];
  discardPile: CardId[];
  iceGrid: IceGridSlot[];
  players: Record<PlayerID, PlayerState>;
  pendingStage: PendingStage;
  autoResolveQueue: AutoResolveItem[];
  dice: DiceState;
  turn: TurnState;
  spy: SpyState | null;
  orcaResolution: OrcaResolutionState | null;
  sealBombResolution: SealBombResolutionState | null;
};
