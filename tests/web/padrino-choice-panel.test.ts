import { describe, expect, it } from "vitest";
import { assets } from "../../web/src/ui/assets";
import {
  getPadrinoCardMeta,
  computePadrinoFanTransform,
  getPadrinoActions,
  createInitialPadrinoSelection,
  selectPadrinoAction,
  confirmPadrinoAction,
  isPadrinoActionDisabled,
  isPadrinoActionSelected
} from "../../web/src/ui/actions/padrinoChoicePanel.logic";

describe("getPadrinoCardMeta", () => {
  it("returns fish meta for action 1 mapped to the correct asset", () => {
    const meta = getPadrinoCardMeta(1);
    expect(meta.action).toBe(1);
    expect(meta.label).toBe("PESCA");
    expect(meta.sublabel).toBe("Fish");
    expect(meta.description).toContain("pescar");
    expect(meta.imageSrc).toBe(assets.ui.padrino.fish);
  });

  it("returns spy meta for action 4 mapped to the correct asset (exact disk casing)", () => {
    const meta = getPadrinoCardMeta(4);
    expect(meta.action).toBe(4);
    expect(meta.label).toBe("ESPIONAJE");
    expect(meta.sublabel).toBe("Spy");
    expect(meta.description).toContain("espionar");
    expect(meta.imageSrc).toBe(assets.ui.padrino.spy);
  });

  it("returns swap meta for action 5 mapped to the correct asset", () => {
    const meta = getPadrinoCardMeta(5);
    expect(meta.action).toBe(5);
    expect(meta.label).toBe("INTERCAMBIO");
    expect(meta.sublabel).toBe("Swap");
    expect(meta.description).toContain("intercambiar");
    expect(meta.imageSrc).toBe(assets.ui.padrino.swap);
  });
});

describe("computePadrinoFanTransform", () => {
  it("centers the middle card of three", () => {
    const transforms = [
      computePadrinoFanTransform(0, 3, 180),
      computePadrinoFanTransform(1, 3, 180),
      computePadrinoFanTransform(2, 3, 180)
    ];
    // Middle card (index 1) should be centered
    expect(transforms[1].x).toBe(0);
    expect(transforms[1].rotation).toBe(0);
    expect(transforms[1].zIndex).toBeGreaterThan(transforms[0].zIndex);
  });

  it("rotates left card counter-clockwise and right card clockwise", () => {
    const left = computePadrinoFanTransform(0, 3, 180);
    const right = computePadrinoFanTransform(2, 3, 180);
    expect(left.rotation).toBeLessThan(0);
    expect(right.rotation).toBeGreaterThan(0);
    expect(left.rotation).toBeCloseTo(-right.rotation, 5);
  });

  it("places left and right cards at mirrored x positions", () => {
    const left = computePadrinoFanTransform(0, 3, 180);
    const right = computePadrinoFanTransform(2, 3, 180);
    expect(left.x).toBeCloseTo(-right.x, 5);
  });

  it("lifts outer cards higher than center", () => {
    const left = computePadrinoFanTransform(0, 3, 180);
    const center = computePadrinoFanTransform(1, 3, 180);
    const right = computePadrinoFanTransform(2, 3, 180);
    expect(left.y).toBeGreaterThan(center.y);
    expect(right.y).toBeGreaterThan(center.y);
  });

  it("increases z-index from left to right for stacking", () => {
    const t0 = computePadrinoFanTransform(0, 3, 180);
    const t1 = computePadrinoFanTransform(1, 3, 180);
    const t2 = computePadrinoFanTransform(2, 3, 180);
    expect(t0.zIndex).toBeLessThan(t1.zIndex);
    expect(t1.zIndex).toBeLessThan(t2.zIndex);
  });

  it("scales offsets with card width", () => {
    const narrow = computePadrinoFanTransform(0, 3, 120);
    const wide = computePadrinoFanTransform(0, 3, 240);
    expect(Math.abs(wide.x)).toBeGreaterThan(Math.abs(narrow.x));
  });

  it("keeps adjacent cards far enough apart to minimize overlap", () => {
    const cardWidth = 220;
    const left = computePadrinoFanTransform(0, 3, cardWidth);
    const center = computePadrinoFanTransform(1, 3, cardWidth);
    const right = computePadrinoFanTransform(2, 3, cardWidth);

    expect(center.x - left.x).toBeGreaterThanOrEqual(cardWidth * 0.8);
    expect(right.x - center.x).toBeGreaterThanOrEqual(cardWidth * 0.8);
  });

  it("uses a stronger visual arc for the outer contracts", () => {
    const left = computePadrinoFanTransform(0, 3, 220);
    const right = computePadrinoFanTransform(2, 3, 220);

    expect(Math.abs(left.rotation)).toBeGreaterThanOrEqual(16);
    expect(Math.abs(right.rotation)).toBeGreaterThanOrEqual(16);
    expect(left.y).toBeGreaterThanOrEqual(20);
    expect(right.y).toBeGreaterThanOrEqual(20);
  });

  it("returns zero transform for a single card", () => {
    const t = computePadrinoFanTransform(0, 1, 180);
    expect(t.x).toBe(0);
    expect(t.y).toBe(0);
    expect(t.rotation).toBe(0);
    expect(t.zIndex).toBe(1);
  });

  it("returns all actions in order", () => {
    const actions = getPadrinoActions();
    expect(actions).toEqual([1, 4, 5]);
  });
});

describe("createInitialPadrinoSelection", () => {
  it("starts with no selection and not confirmed", () => {
    const state = createInitialPadrinoSelection();
    expect(state.selectedAction).toBeNull();
    expect(state.confirmed).toBe(false);
  });
});

describe("selectPadrinoAction", () => {
  it("selects an action without confirming", () => {
    const state = createInitialPadrinoSelection();
    const next = selectPadrinoAction(state, 4);
    expect(next.selectedAction).toBe(4);
    expect(next.confirmed).toBe(false);
  });

  it("allows changing selection before confirmation", () => {
    const state = selectPadrinoAction(createInitialPadrinoSelection(), 1);
    const next = selectPadrinoAction(state, 5);
    expect(next.selectedAction).toBe(5);
    expect(next.confirmed).toBe(false);
  });

  it("ignores selection changes after confirmation", () => {
    let state = createInitialPadrinoSelection();
    state = selectPadrinoAction(state, 1);
    state = confirmPadrinoAction(state);
    const next = selectPadrinoAction(state, 5);
    expect(next.selectedAction).toBe(1);
    expect(next.confirmed).toBe(true);
  });
});

describe("confirmPadrinoAction", () => {
  it("confirms the currently selected action", () => {
    const state = selectPadrinoAction(createInitialPadrinoSelection(), 4);
    const next = confirmPadrinoAction(state);
    expect(next.selectedAction).toBe(4);
    expect(next.confirmed).toBe(true);
  });

  it("does nothing when no action is selected", () => {
    const state = createInitialPadrinoSelection();
    const next = confirmPadrinoAction(state);
    expect(next.selectedAction).toBeNull();
    expect(next.confirmed).toBe(false);
  });

  it("is idempotent when already confirmed", () => {
    let state = createInitialPadrinoSelection();
    state = selectPadrinoAction(state, 4);
    state = confirmPadrinoAction(state);
    const next = confirmPadrinoAction(state);
    expect(next.selectedAction).toBe(4);
    expect(next.confirmed).toBe(true);
  });
});

describe("isPadrinoActionSelected", () => {
  it("returns false when no selection made", () => {
    const state = createInitialPadrinoSelection();
    expect(isPadrinoActionSelected(state, 1)).toBe(false);
    expect(isPadrinoActionSelected(state, 4)).toBe(false);
    expect(isPadrinoActionSelected(state, 5)).toBe(false);
  });

  it("returns true for the selected action", () => {
    const state = selectPadrinoAction(createInitialPadrinoSelection(), 4);
    expect(isPadrinoActionSelected(state, 4)).toBe(true);
    expect(isPadrinoActionSelected(state, 1)).toBe(false);
    expect(isPadrinoActionSelected(state, 5)).toBe(false);
  });
});

describe("isPadrinoActionDisabled", () => {
  it("returns false for all actions when no selection made", () => {
    const state = createInitialPadrinoSelection();
    expect(isPadrinoActionDisabled(state, 1)).toBe(false);
    expect(isPadrinoActionDisabled(state, 4)).toBe(false);
    expect(isPadrinoActionDisabled(state, 5)).toBe(false);
  });

  it("returns false for all actions when selected but not confirmed", () => {
    const state = selectPadrinoAction(createInitialPadrinoSelection(), 4);
    expect(isPadrinoActionDisabled(state, 1)).toBe(false);
    expect(isPadrinoActionDisabled(state, 4)).toBe(false);
    expect(isPadrinoActionDisabled(state, 5)).toBe(false);
  });

  it("returns true for unselected actions after confirmation", () => {
    let state = createInitialPadrinoSelection();
    state = selectPadrinoAction(state, 4);
    state = confirmPadrinoAction(state);
    expect(isPadrinoActionDisabled(state, 1)).toBe(true);
    expect(isPadrinoActionDisabled(state, 4)).toBe(false);
    expect(isPadrinoActionDisabled(state, 5)).toBe(true);
  });
});
