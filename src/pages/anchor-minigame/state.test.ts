import { describe, expect, it } from "vitest";
import {
  BOAT_LENGTH,
  MAX_RODE,
  applySettingLoad,
  changeRode,
  checkPlacement,
  createInitialState,
  getHorizontalAllowance,
  getMaximumVerticalDistance,
  getPlannedSwingRadius,
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
  tideRise: 1.4,
  note: "Test",
  rode: "chain and nylon",
  anchorAndVessel: "matched",
  seabed: "firm mud",
  minimumRode: 32,
  availableSwingRadius: 50,
  vesselExtent: 8,
  minimumSetDistance: 3,
  minimumSetLoadSteps: 3,
  guidance: "fixture guidance",
  basis: ["RNLI SAR Unit 9, p. 67"],
};

describe("anchor minigame transitions", () => {
  it("creates and resets the stable starting position", () => {
    expect(createInitialState()).toEqual({
      boatX: 17,
      cameraOrigin: 0,
      rode: 0,
      anchorOnBottom: false,
      anchorX: null,
      setLoadSteps: 0,
      holdingObservationStartedAt: null,
      holdingReferenceBowX: null,
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
      setLoadSteps: 3,
      holdingObservationStartedAt: 0,
      holdingReferenceBowX: 17,
    }, scenario).message).toContain("under/behind");
    expect(checkPlacement({
      ...createInitialState(),
      boatX: 10,
      rode: target,
      anchorOnBottom: true,
      anchorX: 24,
      setLoadSteps: 3,
      holdingObservationStartedAt: 0,
      holdingReferenceBowX: 10,
    }, scenario, 5_000)).toEqual({
      type: "success",
      message: `Modeled checks passed at 4.0:1 at maximum tide with ${target.toFixed(1)}m out. Continue real holding and anchor-watch checks.`,
      status: "Placement accepted: controlled set, scenario guidance and room checks passed.",
      issues: [],
    });
  });

  it("requires a holding check and rejects rode beyond the scenario's safe room", () => {
    const placed = {
      ...createInitialState(), boatX: 10, rode: 40, anchorOnBottom: true, anchorX: 24,
    };
    expect(checkPlacement({ ...placed, setLoadSteps: 3 }, scenario, 5_000).issues).toEqual(["verification"]);
    expect(checkPlacement({
      ...placed,
      rode: 43,
      setLoadSteps: 3,
      holdingObservationStartedAt: 0,
      holdingReferenceBowX: 10,
    }, scenario, 5_000)).toMatchObject({
      type: "failure",
      issues: ["scope"],
    });
  });

  it("uses current depth for touchdown and future high water for scope and swinging room", () => {
    expect(getMaximumVerticalDistance(scenario)).toBe(8);
    expect(changeRode(createInitialState(), 7, 6.6).state.anchorOnBottom).toBe(true);
    expect(getPlannedSwingRadius(42, scenario)).toBeCloseTo(Math.sqrt(42 ** 2 - 8 ** 2) + 8);
  });

  it("requires progressive loading and a timed fixed-position observation", () => {
    const placed = {
      ...createInitialState(), boatX: 10, rode: 40, anchorOnBottom: true, anchorX: 24, setLoadSteps: 3,
      holdingObservationStartedAt: 1_000, holdingReferenceBowX: 10,
    };
    expect(checkPlacement(placed, scenario, 5_999).issues).toEqual(["verification"]);
    expect(checkPlacement(placed, scenario, 6_000).type).toBe("success");
    expect(checkPlacement({ ...placed, boatX: 9.2 }, scenario, 6_000).issues).toContain("verification");
    expect(checkPlacement({ ...placed, setLoadSteps: 2 }, scenario, 6_000).issues).toContain("procedure");
  });

  it("only records progressive setting load after geometry, rode and room checks pass", () => {
    expect(applySettingLoad(createInitialState(), scenario).state.setLoadSteps).toBe(0);
    const ready = { ...createInitialState(), boatX: 10, rode: 40, anchorOnBottom: true, anchorX: 24 };
    expect(applySettingLoad(ready, scenario).state.setLoadSteps).toBe(1);
    expect(applySettingLoad({ ...ready, rode: 43 }, scenario).state.setLoadSteps).toBe(0);
  });
});
