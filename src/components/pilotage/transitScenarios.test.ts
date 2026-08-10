import { describe, expect, it } from "vitest";
import { TRANSIT_SCENARIOS, classifyTransit, isOnUsableSegment, signedCrossTrack, type TransitScenario } from "./transitScenarios";

describe("transit competency geometry", () => {
  it("classifies both sides and the tolerance boundary independent of pixels", () => {
    const base = TRANSIT_SCENARIOS[0];
    expect(classifyTransit({...base, observer:{x:.5,y:.78}})).toBe("aligned");
    expect(classifyTransit({...base, observer:{x:.525,y:.78}})).toBe("aligned");
    expect(classifyTransit({...base, observer:{x:.6,y:.78}})).toBe("left");
    expect(classifyTransit({...base, observer:{x:.4,y:.78}})).toBe("right");
  });

  it("rejects invalid geometry and observers beyond terminal endpoints", () => {
    expect(isOnUsableSegment({x:.2,y:.78}, TRANSIT_SCENARIOS[0].usableSegment)).toBe(true);
    expect(isOnUsableSegment({x:.81,y:.78}, TRANSIT_SCENARIOS[0].usableSegment)).toBe(false);
    expect(() => classifyTransit({...TRANSIT_SCENARIOS[0], observer:{x:.9,y:.78}})).toThrow(/outside/);
    expect(signedCrossTrack({x:0,y:0},{x:1,y:1},{x:1,y:1})).toBeNaN();
  });

  it("declares deterministic, valid scenario answers and side-specific feedback", () => {
    for (const scenario of TRANSIT_SCENARIOS) {
      expect(classifyTransit(scenario)).toBe(scenario.answer);
      expect(new Set(Object.values(scenario.feedback)).size).toBe(3);
      expect(isOnUsableSegment(scenario.observer, scenario.usableSegment)).toBe(true);
    }
  });
});
