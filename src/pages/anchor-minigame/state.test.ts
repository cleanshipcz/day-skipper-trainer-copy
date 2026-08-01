import { describe, expect, it } from "vitest";
import {
  BOAT_LENGTH,
  MAX_RODE,
  changeRode,
  checkPlacement,
  createInitialState,
  getHorizontalAllowance,
  getTargetRode,
  moveBoat,
  type AnchorScenario,
} from "./state";

const scenario: AnchorScenario = {
  id: 1,
  title: "Test cove",
  condition: "mild",
  depth: 5.5,
  bowHeight: 1.1,
  note: "Test",
};

describe("anchor minigame transitions", () => {
  it("creates and resets the stable starting position", () => {
    expect(createInitialState()).toEqual({
      boatX: 17,
      cameraOrigin: 0,
      rode: 0,
      anchorOnBottom: false,
      anchorX: null,
    });
  });

  it("places the anchor at the bow and respects rode boundaries", () => {
    const initial = createInitialState();
    expect(changeRode(initial, -1, 6.6).state.rode).toBe(0);
    const placed = changeRode(initial, 7, 6.6);
    expect(placed.event).toBe("anchor-bottom");
    expect(placed.state.anchorX).toBe(initial.boatX + BOAT_LENGTH - 0.3);
    expect(changeRode({ ...initial, rode: 119 }, 10, 6.6).state.rode).toBe(MAX_RODE);
  });

  it("clamps boat movement to the swinging circle and prevents anchor teleporting", () => {
    const anchored = { ...createInitialState(), rode: 10, anchorOnBottom: true, anchorX: 24.7 };
    const allowance = getHorizontalAllowance(anchored, 6.6);
    const moved = moveBoat(anchored, -1, 6.6).state;
    expect(Math.abs(anchored.anchorX! - (moved.boatX + BOAT_LENGTH - 0.3))).toBeLessThanOrEqual(allowance);

    const taut = changeRode({ ...moved, rode: 10 }, -10, 6.6);
    expect(taut.state.anchorX).toBe(24.7);
    expect(taut.state.rode).toBeGreaterThan(6.6);
  });

  it("tracks the camera in both directions and permits lifting above the anchor", () => {
    const initial = createInitialState();
    const left = moveBoat({ ...initial, boatX: 9 }, -1, 6.6);
    expect(left.state.cameraOrigin).toBeLessThan(0);
    const right = moveBoat({ ...initial, boatX: 31 }, 1, 6.6);
    expect(right.state.cameraOrigin).toBeGreaterThan(0);

    const lifted = changeRode({
      ...initial,
      rode: 6.6,
      anchorOnBottom: true,
      anchorX: initial.boatX + BOAT_LENGTH - 0.3,
    }, -1, 6.6);
    expect(lifted.state.anchorOnBottom).toBe(false);
    expect(lifted.state.anchorX).toBeNull();
  });

  it("scores only a grounded anchor ahead of the bow with enough scope", () => {
    const target = getTargetRode(scenario);
    expect(checkPlacement(createInitialState(), scenario).type).toBe("failure");
    expect(checkPlacement({
      ...createInitialState(),
      rode: target,
      anchorOnBottom: true,
      anchorX: 20,
    }, scenario).message).toContain("under/behind");
    expect(checkPlacement({
      ...createInitialState(),
      boatX: 10,
      rode: target,
      anchorOnBottom: true,
      anchorX: 24,
    }, scenario)).toEqual({
      type: "success",
      message: `Scope 4.0x with ${target.toFixed(1)}m out.`,
      status: "Secure: anchor is ahead with enough scope.",
      issues: [],
    });
  });
});
