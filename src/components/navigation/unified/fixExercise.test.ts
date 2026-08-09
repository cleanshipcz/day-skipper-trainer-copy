import { describe, expect, it } from "vitest";
import { angularDifference, clientToSvgPoint, expectedFix, intersectLines, landmarks, lineFromLandmark, magneticToTrue, normalizeBearing, reciprocal, solveFix } from "./fixExercise";

describe("position fix geometry", () => {
  it("normalizes wraparound and reciprocal bearings", () => {
    expect(normalizeBearing(-1)).toBe(359);
    expect(angularDifference(359, 1)).toBe(2);
    expect(reciprocal(306.87)).toBeCloseTo(126.87, 5);
    expect(magneticToTrue(3)).toBe(358);
  });

  it("intersects non-parallel LOPs and rejects parallel evidence", () => {
    const east = lineFromLandmark({ ...landmarks[0], x: 0, y: 0 }, 90);
    const south = lineFromLandmark({ ...landmarks[1], x: 10, y: -10 }, 180);
    const intersection = intersectLines(east, south);
    expect(intersection?.x).toBeCloseTo(10, 6);
    expect(intersection?.y).toBeCloseTo(0, 6);
    expect(intersectLines(east, lineFromLandmark({ ...landmarks[1], x: 0, y: 10 }, 90))).toBeNull();
  });

  it("independently solves the published observations near the scenario fix", () => {
    const lops = landmarks.map((item) => lineFromLandmark(item, reciprocal(magneticToTrue(item.magneticBearing))));
    const solution = solveFix(lops);
    expect(expectedFix()).toEqual(expect.objectContaining({ x: expect.closeTo(300, 1), y: expect.closeTo(300, 1) }));
    expect(solution?.uncertainty).toBeLessThan(0.1);
  });

  it.each([
    [0, 0, 800, 500, 400, 250],
    [10, 20, 375, 240, 197.5, 140],
    [50, 100, 1280, 800, 690, 500],
    [0, 0, 1600, 1000, 800, 500],
  ])("maps client coordinates at responsive and zoomed sizes", (left, top, width, height, clientX, clientY) => {
    expect(clientToSvgPoint(clientX, clientY, { left, top, width, height })).toEqual({ x: 400, y: 250 });
  });
});
