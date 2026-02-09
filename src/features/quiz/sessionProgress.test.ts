import { describe, expect, it, vi } from "vitest";
import { buildQuizSessionProgress, parseSavedQuizSession, persistQuizSessionProgress } from "./sessionProgress";

describe("quiz session progress helpers", () => {
  it("builds standard payload shape", () => {
    expect(buildQuizSessionProgress([1, null, 2], 1)).toEqual({
      answers: [1, null, 2],
      currentQuestion: 1,
    });
  });

  it("parses valid saved payload", () => {
    expect(parseSavedQuizSession({ answers: [0, 2], currentQuestion: 1 }, 2)).toEqual({
      answers: [0, 2],
      currentQuestion: 1,
    });
  });

  it("normalizes malformed answers and clamps question index", () => {
    expect(
      parseSavedQuizSession(
        {
          answers: [0, "bad", -1, null],
          currentQuestion: 99,
        },
        3
      )
    ).toEqual({
      answers: [0, null, -1],
      currentQuestion: 2,
    });
  });

  it("returns null when no valid payload exists", () => {
    expect(parseSavedQuizSession(undefined, 5)).toBeNull();
    expect(parseSavedQuizSession({ currentQuestion: 1 }, 5)).toBeNull();
  });

  it("persists answer change for authenticated users using canonical key", async () => {
    const saveProgress = vi.fn();

    await persistQuizSessionProgress({
      isAuthenticated: true,
      topicKey: "engine",
      saveProgress,
      progress: { answers: [1, null], currentQuestion: 0 },
    });

    expect(saveProgress).toHaveBeenCalledWith("quiz-engine", false, 0, 0, {
      answers: [1, null],
      currentQuestion: 0,
    });
  });

  it("skips persistence for anonymous users", async () => {
    const saveProgress = vi.fn();

    await persistQuizSessionProgress({
      isAuthenticated: false,
      topicKey: "engine",
      saveProgress,
      progress: { answers: [1, null], currentQuestion: 0 },
    });

    expect(saveProgress).not.toHaveBeenCalled();
  });
});
