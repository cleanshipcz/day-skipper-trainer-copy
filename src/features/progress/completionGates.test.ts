import { describe, expect, it } from "vitest";
import { deriveCompletionGateDecision } from "./completionGates";

describe("deriveCompletionGateDecision", () => {
  it("stays not_started with no meaningful interaction", () => {
    const decision = deriveCompletionGateDecision({
      visitedSectionIds: [],
      requiredSectionIds: ["a", "b", "c"],
    });

    expect(decision).toEqual({
      state: "not_started",
      score: 0,
      canComplete: false,
    });
  });

  it("transitions to in_progress after partial evidence", () => {
    const decision = deriveCompletionGateDecision({
      visitedSectionIds: ["a"],
      requiredSectionIds: ["a", "b", "c"],
    });

    expect(decision.state).toBe("in_progress");
    expect(decision.score).toBe(33);
    expect(decision.canComplete).toBe(false);
  });

  it("requires full evidence before completion", () => {
    const decision = deriveCompletionGateDecision({
      visitedSectionIds: ["a", "b"],
      requiredSectionIds: ["a", "b", "c"],
    });

    expect(decision.state).toBe("in_progress");
    expect(decision.canComplete).toBe(false);
  });

  it("reaches completed only when all required sections are visited", () => {
    const decision = deriveCompletionGateDecision({
      visitedSectionIds: ["a", "b", "c"],
      requiredSectionIds: ["a", "b", "c"],
    });

    expect(decision).toEqual({
      state: "completed",
      score: 100,
      canComplete: true,
    });
  });

  it("prevents completion from scroll-only signals", () => {
    const decision = deriveCompletionGateDecision({
      visitedSectionIds: [],
      requiredSectionIds: ["a", "b"],
      scrollPercent: 100,
    });

    expect(decision.state).toBe("in_progress");
    expect(decision.canComplete).toBe(false);
  });
});
