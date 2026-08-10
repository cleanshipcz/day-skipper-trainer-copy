import { describe, expect, it } from "vitest";
import { solveCourseToSteer } from "./vectorSolver";
import { describeVectorDrillReasoning, scoreVectorDrillAnswer, VECTOR_DRILL_SCENARIOS, VECTOR_DRILL_TOLERANCE_DEG } from "./vectorDrill";

describe("vector drill assessment", () => {
  it("accepts solver headings across the reproducible feasible catalogue", () => {
    for (const scenario of VECTOR_DRILL_SCENARIOS) {
      const solution = solveCourseToSteer(scenario);
      if (!solution.feasible) continue;
      expect(scoreVectorDrillAnswer(scenario, { kind: "heading", headingDeg: solution.courseToSteerDeg }).correct, scenario.id).toBe(true);
    }
  });

  it("scores circular bearings at the declared inclusive boundary", () => {
    const scenario = { id: "exact-wrap-boundary", desiredTrackDeg: 359, boatSpeedKn: 5, tideSetDeg: 0, tideRateKn: 0 };
    const atBoundary = scoreVectorDrillAnswer(scenario, { kind: "heading", headingDeg: 4 });
    expect(atBoundary.errorDeg).toBe(VECTOR_DRILL_TOLERANCE_DEG);
    expect(atBoundary.correct).toBe(true);
    expect(scoreVectorDrillAnswer(scenario, { kind: "heading", headingDeg: 4.1 }).correct).toBe(false);
  });

  it("distinguishes infeasible routes from merely incorrect headings", () => {
    const impossible = VECTOR_DRILL_SCENARIOS.find(({ id }) => id === "cross-stream-impossible")!;
    expect(scoreVectorDrillAnswer(impossible, { kind: "infeasible" }).correct).toBe(true);
    expect(scoreVectorDrillAnswer(impossible, { kind: "heading", headingDeg: 0 }).correct).toBe(false);
    expect(scoreVectorDrillAnswer(VECTOR_DRILL_SCENARIOS[0], { kind: "infeasible" }).correct).toBe(false);
    expect(describeVectorDrillReasoning(impossible)).toContain("cross-track tide exceeds");
  });
});
