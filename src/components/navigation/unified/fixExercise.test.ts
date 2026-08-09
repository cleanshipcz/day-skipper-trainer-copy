import { describe, expect, it } from "vitest";
import { angularDifference, clientToSvgPoint, intersectLines, landmarks, lineFromLandmark, magneticToTrue, minutesApart, normalizeBearing, reciprocal, SCENARIO_ORACLE, solveFix } from "./fixExercise";

describe("position fix geometry", () => {
  it("normalizes wraparound and reciprocal bearings", () => {
    expect(normalizeBearing(-1)).toBe(359);
    expect(angularDifference(359, 1)).toBe(2);
    expect(reciprocal(306.87)).toBeCloseTo(126.87, 5);
    expect(magneticToTrue(3)).toBe(358);
  });

  it("treats observations either side of midnight as near-simultaneous", () => {
    expect(minutesApart(23 * 60 + 59, 0)).toBe(1);
    expect(minutesApart(23 * 60 + 58, 1)).toBe(3);
  });

  it("intersects non-parallel LOPs and rejects parallel evidence", () => {
    const east = lineFromLandmark({ ...landmarks[0], x: 0, y: 0 }, 90);
    const south = lineFromLandmark({ ...landmarks[1], x: 10, y: -10 }, 180);
    const intersection = intersectLines(east, south);
    expect(intersection?.x).toBeCloseTo(10, 6);
    expect(intersection?.y).toBeCloseTo(0, 6);
    expect(intersectLines(east, lineFromLandmark({ ...landmarks[1], x: 0, y: 10 }, 90))).toBeNull();
  });

  it("solves the published observations near the independently specified oracle", () => {
    const lops = landmarks.map((item) => lineFromLandmark(item, reciprocal(magneticToTrue(item.magneticBearing))));
    const solution = solveFix(lops);
    expect(SCENARIO_ORACLE).toEqual({ x: 300, y: 300 });
    expect(solution?.fix.x).toBeCloseTo(SCENARIO_ORACLE.x, 1);
    expect(solution?.fix.y).toBeCloseTo(SCENARIO_ORACLE.y, 1);
    expect(solution?.uncertainty).toBeLessThan(0.1);
  });

  it("checks the scenario observations against oracle arithmetic without production helpers", () => {
    const bearing = (object: { x: number; y: number }) => {
      const degrees = Math.atan2(object.x - 300, 300 - object.y) * 180 / Math.PI;
      return (degrees + 360) % 360 + 5;
    };
    expect(landmarks.map(bearing)).toEqual([expect.closeTo(311.87, 2), expect.closeTo(39.29, 2), expect.closeTo(109.04, 2)]);
  });

  it.each([
    [0, 0, 800, 500, 400, 250],
    [10, 20, 375, 240, 197.5, 140],
    [50, 100, 1280, 800, 690, 500],
    [0, 0, 1600, 1000, 800, 500],
    [0, 0, 1000, 500, 500, 250],
    [0, 0, 800, 800, 400, 400],
  ])("maps client coordinates at responsive and zoomed sizes", (left, top, width, height, clientX, clientY) => {
    expect(clientToSvgPoint(clientX, clientY, { left, top, width, height })).toEqual({ x: 400, y: 250 });
  });

  it("removes horizontal letterboxing before independently scaling x and y", () => {
    const rect = { left: 20, top: 30, width: 1000, height: 500 };
    expect(clientToSvgPoint(120, 30, rect)).toEqual({ x: 0, y: 0 });
    expect(clientToSvgPoint(320, 130, rect)).toEqual({ x: 200, y: 100 });
    expect(clientToSvgPoint(920, 530, rect)).toEqual({ x: 800, y: 500 });
  });

  it("removes vertical letterboxing at chart edges and off-centre points", () => {
    const rect = { left: 10, top: 20, width: 800, height: 800 };
    expect(clientToSvgPoint(10, 170, rect)).toEqual({ x: 0, y: 0 });
    expect(clientToSvgPoint(210, 370, rect)).toEqual({ x: 200, y: 200 });
    expect(clientToSvgPoint(810, 670, rect)).toEqual({ x: 800, y: 500 });
  });

  it("maps asymmetric points correctly at two-times rendered size", () => {
    expect(clientToSvgPoint(440, 360, { left: 40, top: 60, width: 1600, height: 1000 })).toEqual({ x: 200, y: 150 });
  });
});
