import { describe, expect, it } from "vitest";
import { mobQuizCompletionOutcome, MOB_CRITICAL_QUESTION_IDS } from "./mobAssessment";

const questions = [
  ...MOB_CRITICAL_QUESTION_IDS.map((id) => ({ id, correctAnswer: 1 })),
  ...Array.from({ length: 9 }, (_, index) => ({ id: `non-critical-${index}`, correctAnswer: 1 })),
];

describe("MOB completion outcome", () => {
  it("does not pass a 9/12 attempt that misses all critical safety outcomes", () => {
    const outcome = mobQuizCompletionOutcome([0, 0, 0, ...Array(9).fill(1)], questions);

    expect(outcome.percentage).toBe(75);
    expect(outcome.passed).toBe(false);
    expect(outcome.missedCriticalIds).toEqual(MOB_CRITICAL_QUESTION_IDS);
  });

  it("requires both the score threshold and every critical safety outcome", () => {
    expect(mobQuizCompletionOutcome(Array(12).fill(1), questions).passed).toBe(true);
    expect(mobQuizCompletionOutcome([1, 1, 1, ...Array(9).fill(0)], questions).passed).toBe(false);
  });
});
