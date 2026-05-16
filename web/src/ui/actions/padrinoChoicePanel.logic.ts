import { assets } from "../assets.js";

export type PadrinoCardAction = 1 | 4 | 5;

export interface PadrinoCardMeta {
  action: PadrinoCardAction;
  label: string;
  sublabel: string;
  imageSrc: string;
  description: string;
}

const PADRINO_ACTIONS: PadrinoCardAction[] = [1, 4, 5];

const META_MAP: Record<PadrinoCardAction, PadrinoCardMeta> = {
  1: {
    action: 1,
    label: "PESCA",
    sublabel: "Fish",
    imageSrc: assets.ui.padrino.fish,
    description: "Elige una carta del Hielo para pescar."
  },
  4: {
    action: 4,
    label: "ESPIONAJE",
    sublabel: "Spy",
    imageSrc: assets.ui.padrino.spy,
    description: "Selecciona hasta 3 cartas del Hielo para espionar."
  },
  5: {
    action: 5,
    label: "INTERCAMBIO",
    sublabel: "Swap",
    imageSrc: assets.ui.padrino.swap,
    description: "Elige una carta propia y una de un rival para intercambiar."
  }
};

export function getPadrinoCardMeta(action: PadrinoCardAction): PadrinoCardMeta {
  return META_MAP[action];
}

export function getPadrinoActions(): PadrinoCardAction[] {
  return [...PADRINO_ACTIONS];
}

export interface FanTransform {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

/**
 * Compute transform for a card in a fan layout.
 * Cards arc outward from center with rotation and vertical lift.
 */
export function computePadrinoFanTransform(
  index: number,
  total: number,
  cardWidth: number
): FanTransform {
  if (total <= 1) {
    return { x: 0, y: 0, rotation: 0, zIndex: 1 };
  }

  const maxRotation = 18; // degrees
  const stepX = cardWidth * 0.82; // wide spread per card to keep contract art readable
  const liftCurve = 24; // vertical lift for outer cards, making the arc feel intentional

  const centerIndex = (total - 1) / 2;
  const offsetFromCenter = index - centerIndex;

  const rotation = (offsetFromCenter / centerIndex) * maxRotation;
  const x = offsetFromCenter * stepX;
  const y = Math.abs(offsetFromCenter) * liftCurve;
  const zIndex = index + 1;

  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3)),
    rotation: Number(rotation.toFixed(3)),
    zIndex
  };
}

export type PadrinoSelection = {
  selectedAction: PadrinoCardAction | null;
  confirmed: boolean;
};

export function createInitialPadrinoSelection(): PadrinoSelection {
  return { selectedAction: null, confirmed: false };
}

export function selectPadrinoAction(
  state: PadrinoSelection,
  action: PadrinoCardAction
): PadrinoSelection {
  if (state.confirmed) {
    return state;
  }
  return { selectedAction: action, confirmed: false };
}

export function confirmPadrinoAction(state: PadrinoSelection): PadrinoSelection {
  if (!state.selectedAction) {
    return state;
  }
  return { selectedAction: state.selectedAction, confirmed: true };
}

export function isPadrinoActionSelected(
  state: PadrinoSelection,
  action: PadrinoCardAction
): boolean {
  return state.selectedAction === action;
}

export function isPadrinoActionDisabled(
  state: PadrinoSelection,
  action: PadrinoCardAction
): boolean {
  return state.confirmed && state.selectedAction !== action;
}
