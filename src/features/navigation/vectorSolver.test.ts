import { describe, expect, it } from "vitest";
import { resultingTrack, scoreCourse, solveCourseToSteer } from "./vectorSolver";

describe("course-to-steer vector solver", () => {
  it.each([
    ["zero tide", { desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 0, tideRateKn: 0 }, 0, 5],
    ["following", { desiredTrackDeg: 90, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 2 }, 90, 7],
    ["head", { desiredTrackDeg: 90, boatSpeedKn: 5, tideSetDeg: 270, tideRateKn: 2 }, 90, 3],
    ["cardinal cross", { desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 3 }, 323.130102, 4],
    ["oblique", { desiredTrackDeg: 45, boatSpeedKn: 6, tideSetDeg: 180, tideRateKn: 2 }, 31.366977, 4.416738],
    ["bearing wrap", { desiredTrackDeg: 359, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 1 }, 347.465, 4.878],
  ])("solves independently calculated %s fixture", (_name, input, course, sog) => {
    const result = solveCourseToSteer(input);
    expect(result.feasible).toBe(true);
    if (!result.feasible) return;
    expect(result.courseToSteerDeg).toBeCloseTo(course, 2);
    expect(result.speedOverGroundKn).toBeCloseTo(sog, 2);
    expect(Math.hypot(result.throughWater.eastKn, result.throughWater.northKn)).toBeCloseTo(input.boatSpeedKn, 10);
    expect(result.overGround.eastKn).toBeCloseTo(result.throughWater.eastKn + result.tide.eastKn, 10);
  });

  it("accepts a tangent boundary and diagnoses cross-current infeasibility", () => {
    expect(solveCourseToSteer({ desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 45, tideRateKn: Math.sqrt(50) }).feasible).toBe(true);
    const impossible = solveCourseToSteer({ desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 5.01 });
    expect(impossible.feasible).toBe(false);
    if (!impossible.feasible) expect(impossible.reason).toContain("cross-track tide exceeds");
  });

  it("rejects an opposing boundary with no forward motion and nonfinite inputs", () => {
    expect(solveCourseToSteer({ desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 180, tideRateKn: 5 }).feasible).toBe(false);
    expect(solveCourseToSteer({ desiredTrackDeg: Number.NaN, boatSpeedKn: 5, tideSetDeg: 0, tideRateKn: 0 }).feasible).toBe(false);
  });

  it("uses the same forward model for scoring and exact solver output", () => {
    const input = { desiredTrackDeg: 90, boatSpeedKn: 6, tideSetDeg: 180, tideRateKn: 2 };
    const solved = solveCourseToSteer(input);
    expect(solved.feasible).toBe(true);
    if (!solved.feasible) return;
    expect(resultingTrack(solved.courseToSteerDeg, 6, 180, 2).trackDeg).toBeCloseTo(90, 10);
    expect(scoreCourse(solved.courseToSteerDeg, input).correct).toBe(true);
  });
});
