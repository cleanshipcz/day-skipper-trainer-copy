import { describe, expect, it } from "vitest";
import { assessClearingBearing, CLEARING_BEARING_SCENARIOS, normalizeBearing, signedBearingDifference, solutionFor, tangentPoint, trueBearing } from "./clearingBearingScenarios";

describe("clearing-bearing geometry", () => {
  it("derives deterministic tangent limits from the chart", () => {
    for (const scenario of CLEARING_BEARING_SCENARIOS) {
      const first = solutionFor(scenario);
      expect(solutionFor(scenario)).toEqual(first);
      const tangent = tangentPoint(scenario);
      const distance = Math.hypot(tangent.x - scenario.hazard.position.x, tangent.y - scenario.hazard.position.y);
      expect(distance).toBeCloseTo(scenario.hazard.radius + scenario.hazard.margin, 8);
      expect(first.bearing).toBeCloseTo(trueBearing(tangent, scenario.landmark.position), 8);
    }
  });

  it("handles north wrap without treating opposite bearings as close", () => {
    expect(normalizeBearing(360)).toBe(0);
    expect(signedBearingDifference(1, 359)).toBe(2);
    expect(signedBearingDifference(359, 1)).toBe(-2);
    expect(Math.abs(signedBearingDifference(180, 0))).toBe(180);
  });

  it("accepts the declared tolerance boundary and rejects beyond it", () => {
    const scenario = CLEARING_BEARING_SCENARIOS[0];
    const { bearing, rule } = solutionFor(scenario);
    expect(assessClearingBearing(String(bearing + 2), rule, scenario).kind).toBe("correct");
    expect(assessClearingBearing(String(bearing + 2.01), rule, scenario).kind).toBe("incorrect");
  });

  it("requires the directional rule, not a symmetric bearing match", () => {
    const scenario = CLEARING_BEARING_SCENARIOS[1];
    const { bearing, rule } = solutionFor(scenario);
    expect(assessClearingBearing(String(bearing), rule === "NLT" ? "NMT" : "NLT", scenario).kind).toBe("incorrect");
  });

  it.each(["", "north", "-1", "360", "12degrees"])("rejects invalid input %j", (input) => {
    expect(assessClearingBearing(input, "NLT", CLEARING_BEARING_SCENARIOS[0]).kind).toBe("invalid");
  });
});
