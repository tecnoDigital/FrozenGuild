import { describe, expect, it } from "vitest";
import { getCardStackKey, buildVisualSlots, computeFanTransforms } from "../../web/src/ui/players/handFan";

describe("getCardStackKey", () => {
  it("returns type:value for penguins", () => {
    expect(getCardStackKey("penguin-001")).toBe("penguin:1");
    expect(getCardStackKey("penguin-009")).toBe("penguin:2");
    expect(getCardStackKey("penguin-016")).toBe("penguin:3");
  });

  it("returns type:none for non-penguin cards", () => {
    expect(getCardStackKey("orca-001")).toBe("orca:none");
    expect(getCardStackKey("walrus-001")).toBe("walrus:none");
    expect(getCardStackKey("seal_bomb-001")).toBe("seal_bomb:none");
  });

  it("returns the raw cardId for unknown cards", () => {
    expect(getCardStackKey("unknown-xyz")).toBe("unknown-xyz");
  });
});

describe("buildVisualSlots", () => {
  it("returns singles when total cards are below stack threshold", () => {
    const cardIDs = ["penguin-001", "penguin-002", "orca-001"];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(3);
    expect(slots.every((s) => s.kind === "single")).toBe(true);
    expect(slots[0].realIndexes).toEqual([0]);
    expect(slots[1].realIndexes).toEqual([1]);
    expect(slots[2].realIndexes).toEqual([2]);
  });

  it("stacks identical consecutive cards when count meets threshold", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "penguin-004",
    ];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(1);
    expect(slots[0].kind).toBe("stack");
    expect(slots[0].count).toBe(4);
    expect(slots[0].realIndexes).toEqual([0, 1, 2, 3]);
  });

  it("does NOT stack when any card in group is selectable", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "penguin-004",
    ];
    const slots = buildVisualSlots(cardIDs, { selectableIndexes: [2] });
    expect(slots).toHaveLength(4);
    expect(slots.every((s) => s.kind === "single")).toBe(true);
  });

  it("does NOT stack when any card in group is selected", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "penguin-004",
    ];
    const slots = buildVisualSlots(cardIDs, { selectedIndexes: [1] });
    expect(slots).toHaveLength(4);
    expect(slots.every((s) => s.kind === "single")).toBe(true);
  });

  it("keeps different types as separate slots", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "penguin-004",
      "orca-001",
    ];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(2);
    expect(slots[0].kind).toBe("stack");
    expect(slots[0].count).toBe(4);
    expect(slots[1].kind).toBe("single");
    expect(slots[1].displayCardID).toBe("orca-001");
    expect(slots[1].realIndexes).toEqual([4]);
  });

  it("respects custom stackThreshold", () => {
    const cardIDs = ["penguin-001", "penguin-002", "penguin-003"];
    const slotsDefault = buildVisualSlots(cardIDs);
    expect(slotsDefault[0].kind).toBe("stack");

    const slotsHigh = buildVisualSlots(cardIDs, { stackThreshold: 5 });
    expect(slotsHigh).toHaveLength(3);
    expect(slotsHigh.every((s) => s.kind === "single")).toBe(true);
  });

  it("preserves original order with non-consecutive identical cards", () => {
    const cardIDs = [
      "penguin-001",
      "orca-001",
      "penguin-002",
      "penguin-003",
    ];
    const slots = buildVisualSlots(cardIDs, { stackThreshold: 5 });
    expect(slots).toHaveLength(4);
    expect(slots[0].realIndexes).toEqual([0]);
    expect(slots[1].realIndexes).toEqual([1]);
    expect(slots[2].realIndexes).toEqual([2]);
    expect(slots[3].realIndexes).toEqual([3]);
  });

  it("stacks only the consecutive run, leaving later identical cards separate", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "orca-001",
      "penguin-004",
      "penguin-005",
    ];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(4);
    expect(slots[0].kind).toBe("stack");
    expect(slots[0].count).toBe(3);
    expect(slots[1].kind).toBe("single");
    expect(slots[1].displayCardID).toBe("orca-001");
    // Later run of 2 is below default threshold 3, so singles
    expect(slots[2].kind).toBe("single");
    expect(slots[2].displayCardID).toBe("penguin-004");
    expect(slots[3].kind).toBe("single");
    expect(slots[3].displayCardID).toBe("penguin-005");
  });

  it("assigns unique ids to separated identical stacks", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "orca-001",
      "penguin-004",
      "penguin-005",
      "penguin-006",
    ];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(3);
    expect(slots[0].kind).toBe("stack");
    expect(slots[0].count).toBe(3);
    expect(slots[1].kind).toBe("single");
    expect(slots[2].kind).toBe("stack");
    expect(slots[2].count).toBe(3);
    // The two separated stacks must have different ids to avoid React key collisions
    expect(slots[0].id).not.toBe(slots[2].id);
  });

  it("embeds the first real index into stack ids for determinism", () => {
    const cardIDs = [
      "penguin-001",
      "penguin-002",
      "penguin-003",
      "orca-001",
      "penguin-004",
      "penguin-005",
      "penguin-006",
    ];
    const slots = buildVisualSlots(cardIDs);
    expect(slots).toHaveLength(3);
    expect(slots[0].id).toBe("stack:penguin:1@0");
    expect(slots[2].id).toBe("stack:penguin:1@4");
  });
});

describe("computeFanTransforms", () => {
  it("returns empty array for slotCount <= 0", () => {
    expect(computeFanTransforms(0, 150)).toEqual([]);
    expect(computeFanTransforms(-1, 150)).toEqual([]);
  });

  it("returns zero transform for a single slot", () => {
    expect(computeFanTransforms(1, 150)).toEqual([
      { x: 0, y: 0, rotation: 0, zIndex: 1 },
    ]);
  });

  it("produces symmetric transforms for odd slotCount", () => {
    const transforms = computeFanTransforms(5, 150);
    expect(transforms).toHaveLength(5);
    // Center should be at index 2
    expect(transforms[2].x).toBe(0);
    expect(transforms[2].rotation).toBe(0);
    expect(transforms[2].y).toBe(0);
    // Left and right should mirror
    expect(transforms[0].x).toBeCloseTo(-transforms[4].x, 5);
    expect(transforms[0].rotation).toBeCloseTo(-transforms[4].rotation, 5);
    expect(transforms[0].y).toBeCloseTo(transforms[4].y, 5);
    // zIndex should increase left-to-right
    expect(transforms[0].zIndex).toBe(1);
    expect(transforms[4].zIndex).toBe(5);
  });

  it("produces symmetric transforms for even slotCount", () => {
    const transforms = computeFanTransforms(4, 150);
    expect(transforms).toHaveLength(4);
    // Centers are between index 1 and 2
    const centerX = (transforms[0].x + transforms[3].x) / 2;
    expect(centerX).toBeCloseTo((transforms[1].x + transforms[2].x) / 2, 5);
    // y should be symmetric
    expect(transforms[0].y).toBeCloseTo(transforms[3].y, 5);
    expect(transforms[1].y).toBeCloseTo(transforms[2].y, 5);
  });

  it("scales x offsets with cardWidth", () => {
    const small = computeFanTransforms(5, 100);
    const large = computeFanTransforms(5, 200);
    // The step (distance between cards) should roughly scale with width
    expect(Math.abs(large[0].x)).toBeGreaterThan(Math.abs(small[0].x));
  });

  it("caps rotation to reasonable limits for many slots", () => {
    const transforms = computeFanTransforms(20, 150);
    const maxRot = Math.max(...transforms.map((t) => Math.abs(t.rotation)));
    // Updated limits for wider, more premium fan arc
    expect(maxRot).toBeLessThanOrEqual(28);
    expect(maxRot).toBeGreaterThan(14);
  });

  it("lifts extremes higher than center for a proper arc", () => {
    const transforms = computeFanTransforms(7, 150);
    const centerY = transforms[3].y;
    const leftY = transforms[0].y;
    const rightY = transforms[6].y;
    // Center should be the lowest point (y closest to 0)
    expect(centerY).toBeLessThan(leftY);
    expect(centerY).toBeLessThan(rightY);
    // Extremes should be roughly symmetrical
    expect(leftY).toBeCloseTo(rightY, 5);
  });

  it("produces larger y offsets with increased liftCurve", () => {
    const oldTransforms = computeFanTransforms(7, 150);
    // With new params, extremes should be noticeably higher
    const maxY = Math.max(...oldTransforms.map((t) => t.y));
    expect(maxY).toBeGreaterThan(22);
  });
});
