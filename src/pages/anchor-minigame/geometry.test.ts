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
    expect([geometry.viewWidth, geometry.viewHeight, geometry.surfaceY]).toEqual([760, 360, 70]);
    expect(geometry.toX(0)).toBe(28);
    expect(geometry.toX(42)).toBe(732);
    expect(geometry.chainPath.split("L")).toHaveLength(19);
    expect(geometry.boatPath).toContain("Z");
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
