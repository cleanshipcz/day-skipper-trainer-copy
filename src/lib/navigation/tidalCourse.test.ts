import { describe, expect, it } from "vitest";
import { normalizeBearing, solveCourseToSteer } from "./tidalCourse";

describe("tidal course construction", () => {
  it("solves the worked chart example without premature rounding", () => {
    const result = solveCourseToSteer({ desiredTrackTrue: 90, boatSpeed: 6, streamSetTrue: 180, streamRate: 2, intervalHours: 1, legDistance: 5.7 });
    expect(result).not.toBeNull();
    expect(result?.courseTrue).toBeCloseTo(70.5288, 4);
    expect(result?.distanceMadeGood).toBeCloseTo(Math.sqrt(32), 8);
    expect(result?.speedOverGround).toBeCloseTo(Math.sqrt(32), 8);
    expect(result?.etaMinutes).toBeCloseTo(5.7 / Math.sqrt(32) * 60, 8);
    expect(Math.round(result!.etaMinutes)).toBe(60);
  });

  it("reports an infeasible intersection", () => {
    expect(solveCourseToSteer({ desiredTrackTrue: 90, boatSpeed: 6, streamSetTrue: 180, streamRate: 7, intervalHours: 1, legDistance: 5.7 })).toBeNull();
  });

  it("rejects a zero-progress intersection and avoids an infinite ETA", () => {
    expect(solveCourseToSteer({ desiredTrackTrue: 90, boatSpeed: 6, streamSetTrue: 270, streamRate: 6, intervalHours: 1, legDistance: 5.7 })).toBeNull();
  });

  it("normalizes bearings across north", () => {
    expect(normalizeBearing(358 + 5)).toBe(3);
    expect(normalizeBearing(-1)).toBe(359);
  });
});
