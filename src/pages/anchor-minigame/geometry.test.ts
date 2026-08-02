import { describe, expect, it } from "vitest";
import { calculateSceneGeometry } from "./geometry";
import { createInitialState, type AnchorScenario } from "./state";

const scenario: AnchorScenario = {
  id: 1,
  title: "Test",
  condition: "strong",
  depth: 9.5,
  bowHeight: 1.3,
  note: "Test",
};

describe("anchor scene geometry", () => {
  it("maps the world to a stable responsive SVG coordinate system", () => {
    const geometry = calculateSceneGeometry(createInitialState(), scenario);
    expect([geometry.viewWidth, geometry.viewHeight, geometry.surfaceY]).toEqual([760, 400, 82]);
    expect(geometry.toX(0)).toBe(28);
    expect(geometry.toX(42)).toBe(732);
    expect(geometry.chainPath.split("L")).toHaveLength(19);
    expect(geometry.boatPath).toContain("Z");
  });

  it("keeps physical distance invariants independent of camera movement", () => {
    const state = { ...createInitialState(), boatX: 8, cameraOrigin: -4, rode: 40, anchorOnBottom: true, anchorX: 28 };
    const first = calculateSceneGeometry(state, scenario);
    const shifted = calculateSceneGeometry({ ...state, cameraOrigin: 9 }, scenario);
    expect(first.horizontalDistance).toBeCloseTo(12.3, 6);
    expect(first.straightLineDistance).toBeCloseTo(Math.hypot(12.3, 10.8), 6);
    expect(first.slack).toBeCloseTo(40 - Math.hypot(12.3, 10.8), 6);
    expect(shifted.horizontalDistance).toBeCloseTo(first.horizontalDistance, 10);
    expect(shifted.straightLineDistance).toBeCloseTo(first.straightLineDistance, 10);
    expect(shifted.slack).toBeCloseTo(first.slack, 10);
  });

  it.each([
    { depth: 1, bowHeight: 0.5, rode: 0, anchorOnBottom: false },
    { depth: 20, bowHeight: 3, rode: 120, anchorOnBottom: true },
  ])("keeps extreme scene geometry finite and bounded %#", (extreme) => {
    const geometry = calculateSceneGeometry({ ...createInitialState(), rode: extreme.rode, anchorOnBottom: extreme.anchorOnBottom, anchorX: extreme.anchorOnBottom ? 30 : null }, { ...scenario, depth: extreme.depth, bowHeight: extreme.bowHeight });
    expect([geometry.surfaceY, geometry.seabedY, geometry.anchorPoint.x, geometry.anchorPoint.y, geometry.straightLineDistance, geometry.slack].every(Number.isFinite)).toBe(true);
    expect(geometry.seabedY).toBeLessThan(geometry.viewHeight);
    expect(geometry.anchorPoint.y).toBeLessThanOrEqual(geometry.seabedY);
    expect(geometry.slack).toBeGreaterThanOrEqual(0);
  });

  it("keeps a slack grounded chain at or above the seabed", () => {
    const geometry = calculateSceneGeometry({
      ...createInitialState(),
      boatX: 10,
      rode: 40,
      anchorOnBottom: true,
      anchorX: 24.7,
    }, scenario);
    const ys = [...geometry.chainPath.matchAll(/(?:M|L) [-\d.]+ ([-\d.]+)/g)].map((match) => Number(match[1]));
    expect(Math.max(...ys)).toBeCloseTo(geometry.seabedY, 1);
    expect(geometry.anchorPoint.y).toBe(geometry.seabedY);
  });
});
