import { describe, expect, it } from "vitest";
import { calculatePlanSummary, type PilotageWaypoint } from "./pilotagePlan";

describe("calculatePlanSummary", () => {
  it("calculates cumulative distance and time with tidal adjustments", () => {
    const waypoints: PilotageWaypoint[] = [
      { id: "a", name: "Outer mark", bearing: 30, distance: 1, tidalOffset: 3, notes: "" },
      { id: "b", name: "Entrance", bearing: 60, distance: 1.5, tidalOffset: -1, notes: "" },
    ];

    expect(calculatePlanSummary(waypoints, 5)).toEqual({
      waypoints,
      totalDistance: 2.5,
      estimatedMinutes: 32,
    });
  });

  it("does not produce invalid time when speed is zero", () => {
    expect(calculatePlanSummary([], 0)).toMatchObject({ totalDistance: 0, estimatedMinutes: 0 });
  });
});
