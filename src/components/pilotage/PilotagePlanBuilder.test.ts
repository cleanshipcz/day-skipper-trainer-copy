import { describe, expect, it } from "vitest";
import { calculatePlanSummary, GUIDED_WAYPOINTS, validatePilotageWaypoint, type PilotageWaypoint } from "./pilotagePlan";

const leg = (overrides: Partial<PilotageWaypoint> = {}): PilotageWaypoint => ({
  id: "a", name: "Outer mark to entrance", bearing: 30, distance: 1,
  speedOverGround: 5, mark: "Safe-water mark", hazards: "Shoal",
  safeLimits: "Keep in channel", monitoring: "Watch transit", depthAndTide: "3 m, rising",
  communications: "Call harbour", abortAndContingency: "Return seaward", notes: "", ...overrides,
});

describe("pilotage plan model", () => {
  it("derives time per leg from SOG and rounds only the total", () => {
    const waypoints = [leg(), leg({ id: "b", distance: 1.5, speedOverGround: 4 })];
    expect(calculatePlanSummary(waypoints)).toEqual({ waypoints, totalDistance: 2.5, estimatedMinutes: 35 });
  });

  it("accepts operational boundary values", () => {
    expect(validatePilotageWaypoint(leg({ bearing: 0, distance: 0.001, speedOverGround: 0.1 }))).toBeNull();
    expect(validatePilotageWaypoint(leg({ bearing: 359.999, distance: 100, speedOverGround: 50 }))).toBeNull();
  });

  it.each([
    ["bearing NaN", { bearing: Number.NaN }], ["bearing infinity", { bearing: Infinity }],
    ["negative bearing", { bearing: -0.1 }], ["360 bearing", { bearing: 360 }],
    ["zero distance", { distance: 0 }], ["excessive distance", { distance: 100.001 }],
    ["infinite distance", { distance: Infinity }], ["zero SOG", { speedOverGround: 0 }],
    ["excessive SOG", { speedOverGround: 50.001 }], ["NaN SOG", { speedOverGround: Number.NaN }],
    ["blank name", { name: "   " }],
  ])("rejects hostile or operationally invalid %s", (_case, overrides) => {
    const invalid = leg(overrides);
    expect(validatePilotageWaypoint(invalid)).not.toBeNull();
    expect(() => calculatePlanSummary([invalid])).toThrow(RangeError);
  });

  it("ships a coherent explicitly fictional Region A example", () => {
    const text = GUIDED_WAYPOINTS.map((item) => Object.values(item).join(" ")).join(" ");
    expect(GUIDED_WAYPOINTS.every((item) => validatePilotageWaypoint(item) === null)).toBe(true);
    expect(text).toContain("safe-water mark");
    expect(text).toContain("Iso.W.10s");
    expect(text).toContain("Red can Fl.R.4s");
    expect(text).toContain("green cone Fl.G.4s");
  });
});
