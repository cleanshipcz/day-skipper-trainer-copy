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
