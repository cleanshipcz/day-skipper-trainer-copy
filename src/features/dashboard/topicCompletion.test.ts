import { describe, expect, it } from "vitest";
import { deriveTopicCompletionState } from "./topicCompletion";

describe("deriveTopicCompletionState", () => {
  it("marks grouped topics complete only when all submodules are complete", () => {
    const groupedTopic = {
      id: "navigation",
      submoduleIds: ["charts-theory", "compass-theory", "position-theory"],
    };

    const progressMap = {
      "charts-theory": { completed: true, score: 100 },
      "compass-theory": { completed: true, score: 90 },
      "position-theory": { completed: true, score: 80 },
    };

    const state = deriveTopicCompletionState(groupedTopic, progressMap);

    expect(state.isCompleted).toBe(true);
    expect(state.score).toBe(90);
  });

  it("keeps grouped topics incomplete if any submodule remains incomplete", () => {
    const groupedTopic = {
      id: "rules-of-the-road",
      submoduleIds: ["colregs-theory", "lights-theory", "colregs"],
    };

    const progressMap = {
      "colregs-theory": { completed: true, score: 100 },
      "lights-theory": { completed: false, score: 70 },
      colregs: { completed: true, score: 85 },
    };

    const state = deriveTopicCompletionState(groupedTopic, progressMap);

    expect(state.isCompleted).toBe(false);
    expect(state.score).toBe(85);
  });

  it("should mark safety complete only when all 6 sub-modules are complete (E1-S7 AC-2)", () => {
    // given
    // - safety root topic with all 6 sub-module IDs
    const safetyTopic = {
      id: "safety",
      submoduleIds: [
        "safety-mob",
        "safety-fire",
        "safety-life-raft",
        "safety-flares",
        "safety-personal",
        "safety-gas",
      ],
    };

    // when - only 4 of 6 are complete
    const partialProgress = {
      "safety-mob": { completed: true, score: 100 },
      "safety-fire": { completed: true, score: 90 },
      "safety-life-raft": { completed: true, score: 85 },
      "safety-flares": { completed: true, score: 80 },
    };
    const partialState = deriveTopicCompletionState(safetyTopic, partialProgress);

    // then
    expect(partialState.isCompleted).toBe(false);
  });

  it("should mark safety complete when all 6 sub-modules are complete (E1-S7 AC-2)", () => {
    // given
    const safetyTopic = {
      id: "safety",
      submoduleIds: [
        "safety-mob",
        "safety-fire",
        "safety-life-raft",
        "safety-flares",
        "safety-personal",
        "safety-gas",
      ],
    };

    // when - all 6 are complete
    const fullProgress = {
      "safety-mob": { completed: true, score: 100 },
      "safety-fire": { completed: true, score: 90 },
      "safety-life-raft": { completed: true, score: 85 },
      "safety-flares": { completed: true, score: 80 },
      "safety-personal": { completed: true, score: 95 },
      "safety-gas": { completed: true, score: 70 },
    };
    const fullState = deriveTopicCompletionState(safetyTopic, fullProgress);

    // then
    expect(fullState.isCompleted).toBe(true);
    expect(fullState.score).toBe(87); // Math.round((100+90+85+80+95+70)/6) = 87
  });

  it("uses direct topic progress for non-grouped topics", () => {
    const state = deriveTopicCompletionState(
      { id: "ropework" },
      {
        ropework: { completed: true, score: 95 },
      }
    );

    expect(state).toEqual({ isCompleted: true, score: 95 });
  });
});
