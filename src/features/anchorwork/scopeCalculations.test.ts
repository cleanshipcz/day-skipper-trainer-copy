import { describe, expect, it } from "vitest";
import {
  approximateSwingRadius,
  maximumVerticalDistance,
  scopeRatio,
  scopeWorkedExample,
  swingWorkedExample,
} from "./scopeCalculations";

describe("reviewed anchorwork calculation fixtures", () => {
  it("includes tide allowance in maximum bow-roller-to-seabed distance and scope", () => {
    expect(maximumVerticalDistance(scopeWorkedExample.assumptions)).toBe(scopeWorkedExample.maximumVerticalDistanceMetres);
    expect(scopeRatio(scopeWorkedExample.assumptions)).toBe(scopeWorkedExample.ratio);
  });

  it("reproduces the plan-view swinging-room example", () => {
    const { rodeLengthMetres, maximumVerticalDistanceMetres, bowToFurthestPointMetres } = swingWorkedExample.assumptions;
    expect(Math.sqrt(rodeLengthMetres ** 2 - maximumVerticalDistanceMetres ** 2)).toBeCloseTo(swingWorkedExample.horizontalRodeReachMetres, 2);
    expect(approximateSwingRadius(swingWorkedExample.assumptions)).toBeCloseTo(swingWorkedExample.approximateSwingRadiusMetres, 2);
  });

  it("rejects impossible straight-line geometry", () => {
    expect(() => approximateSwingRadius({ rodeLengthMetres: 6, maximumVerticalDistanceMetres: 7, bowToFurthestPointMetres: 10 })).toThrow(RangeError);
  });
});
