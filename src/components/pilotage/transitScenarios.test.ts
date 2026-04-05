/**
 * Unit tests for transit scenario data and geometry helpers.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2, AC-2
 */
import { describe, expect, it } from "vitest";
import {
  TRANSIT_SCENARIOS,
  perpendicularDistance,
  isOnTransit,
  type TransitScenario,
} from "./transitScenarios";

describe("perpendicularDistance", () => {
  it("should return 0 when point is on the line", () => {
    // given
    // - a vertical line from (100, 0) to (100, 200)
    // - a point on the line at (100, 100)
    const point = { x: 100, y: 100 };
    const lineStart = { x: 100, y: 0 };
    const lineEnd = { x: 100, y: 200 };

    // when
    const distance = perpendicularDistance(point, lineStart, lineEnd);

    // then
    expect(distance).toBeCloseTo(0, 5);
  });

  it("should return correct distance for a point perpendicular to a vertical line", () => {
    // given
    // - a vertical line at x=100
    // - a point 50px to the right
    const point = { x: 150, y: 100 };
    const lineStart = { x: 100, y: 0 };
    const lineEnd = { x: 100, y: 200 };

    // when
    const distance = perpendicularDistance(point, lineStart, lineEnd);

    // then
    expect(distance).toBeCloseTo(50, 5);
  });

  it("should return correct distance for a point perpendicular to a horizontal line", () => {
    // given
    // - a horizontal line at y=100
    // - a point 30px below
    const point = { x: 150, y: 130 };
    const lineStart = { x: 0, y: 100 };
    const lineEnd = { x: 200, y: 100 };

    // when
    const distance = perpendicularDistance(point, lineStart, lineEnd);

    // then
    expect(distance).toBeCloseTo(30, 5);
  });

  it("should return correct distance for a diagonal line", () => {
    // given
    // - a 45° line from (0,0) to (100,100)
    // - a point at (0, 100) — distance should be 100/sqrt(2) ≈ 70.71
    const point = { x: 0, y: 100 };
    const lineStart = { x: 0, y: 0 };
    const lineEnd = { x: 100, y: 100 };

    // when
    const distance = perpendicularDistance(point, lineStart, lineEnd);

    // then
    expect(distance).toBeCloseTo(70.71, 1);
  });

  it("should return 0 when line start and end are the same point", () => {
    // given
    // - degenerate line (zero length)
    const point = { x: 50, y: 50 };
    const lineStart = { x: 100, y: 100 };
    const lineEnd = { x: 100, y: 100 };

    // when
    const distance = perpendicularDistance(point, lineStart, lineEnd);

    // then
    expect(distance).toBe(0);
  });
});

describe("isOnTransit", () => {
  // given
  // - a test scenario with a vertical transit line
  const testScenario: TransitScenario = {
    id: "test",
    title: "Test",
    description: "Test scenario",
    difficulty: "Beginner",
    difficultyLevel: 1,
    frontMarker: { x: 200, y: 300 },
    rearMarker: { x: 200, y: 100 },
    vesselStart: { x: 100, y: 350 },
    tolerancePx: 20,
    chartWidth: 400,
    chartHeight: 400,
  };

  it("should return true when vessel is exactly on the transit line", () => {
    // when
    const result = isOnTransit({ x: 200, y: 250 }, testScenario);

    // then
    expect(result).toBe(true);
  });

  it("should return true when vessel is within tolerance", () => {
    // given
    // - vessel is 15px off the line (within 20px tolerance)
    const vesselPos = { x: 215, y: 250 };

    // when
    const result = isOnTransit(vesselPos, testScenario);

    // then
    expect(result).toBe(true);
  });

  it("should return false when vessel is outside tolerance", () => {
    // given
    // - vessel is 25px off the line (outside 20px tolerance)
    const vesselPos = { x: 225, y: 250 };

    // when
    const result = isOnTransit(vesselPos, testScenario);

    // then
    expect(result).toBe(false);
  });

  it("should return true when vessel is exactly at tolerance boundary", () => {
    // given
    // - vessel is exactly 20px off (equal to tolerance)
    const vesselPos = { x: 220, y: 250 };

    // when
    const result = isOnTransit(vesselPos, testScenario);

    // then
    expect(result).toBe(true);
  });
});

describe("TRANSIT_SCENARIOS integration", () => {
  it("should have vessel start positions that are off-transit for each scenario", () => {
    for (const scenario of TRANSIT_SCENARIOS) {
      // when
      const startOnTransit = isOnTransit(scenario.vesselStart, scenario);

      // then
      // - the starting position should NOT be on the transit line
      //   (otherwise the exercise has no challenge)
      expect(startOnTransit).toBe(false);
    }
  });

  it("should have a point on the transit line that passes isOnTransit for each scenario", () => {
    for (const scenario of TRANSIT_SCENARIOS) {
      // given
      // - the midpoint between front and rear markers is on the transit line
      const midpoint = {
        x: (scenario.frontMarker.x + scenario.rearMarker.x) / 2,
        y: (scenario.frontMarker.y + scenario.rearMarker.y) / 2,
      };

      // when
      const midOnTransit = isOnTransit(midpoint, scenario);

      // then
      expect(midOnTransit).toBe(true);
    }
  });
});
