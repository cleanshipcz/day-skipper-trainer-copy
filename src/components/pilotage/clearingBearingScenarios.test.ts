import { describe, expect, it } from "vitest";
import { assessClearingBearing, CLEARING_BEARING_SCENARIOS, isWithinSafeTolerance, normalizeBearing, signedBearingDifference, solutionFor, tangentPoint } from "./clearingBearingScenarios";

describe("clearing-bearing geometry", () => {
  it("derives deterministic tangent limits from the chart", () => {
    const expected = [
      { x: 313.9119000573, y: 132.4972129463, bearing: 290.3526594997, safe: 354.4278021960, rule: "NLT" },
      { x: 225.3497606001, y: 151.4751158107, bearing: 58.8613004654, safe: 23.9100923001, rule: "NMT" },
    ] as const;
    CLEARING_BEARING_SCENARIOS.forEach((scenario, index) => {
      const first = solutionFor(scenario);
      expect(solutionFor(scenario)).toEqual(first);
      const tangent = tangentPoint(scenario);
      expect(tangent.x).toBeCloseTo(expected[index].x, 8);
      expect(tangent.y).toBeCloseTo(expected[index].y, 8);
      expect(first.bearing).toBeCloseTo(expected[index].bearing, 8);
      expect(first.safeBearing).toBeCloseTo(expected[index].safe, 8);
      expect(first.rule).toBe(expected[index].rule);
      const distance = Math.hypot(tangent.x - scenario.hazard.position.x, tangent.y - scenario.hazard.position.y);
      expect(distance).toBeCloseTo(scenario.hazard.radius + scenario.hazard.margin, 8);
      const radius = { x: tangent.x - scenario.hazard.position.x, y: tangent.y - scenario.hazard.position.y };
      const line = { x: tangent.x - scenario.landmark.position.x, y: tangent.y - scenario.landmark.position.y };
      expect(radius.x * line.x + radius.y * line.y).toBeCloseTo(0, 8);
      expect(first.rule === "NLT" ? first.safeBearing >= first.bearing : first.safeBearing <= first.bearing).toBe(true);
    });
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
    expect(assessClearingBearing(String(bearing - 0.01), rule, scenario).kind).toBe("incorrect");
  });

  it("keeps wrapped tolerance one-sided at true north", () => {
    expect(isWithinSafeTolerance(0, 359, "NLT", 2)).toBe(true);
    expect(isWithinSafeTolerance(358, 359, "NLT", 2)).toBe(false);
    expect(isWithinSafeTolerance(359, 1, "NMT", 2)).toBe(true);
    expect(isWithinSafeTolerance(2, 1, "NMT", 2)).toBe(false);
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
