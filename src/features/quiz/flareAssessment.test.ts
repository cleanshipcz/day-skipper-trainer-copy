import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/safetyFlares";
import { FLARE_CRITICAL_QUESTION_IDS, flareQuizCompletionOutcome } from "./flareAssessment";

describe("flare quiz critical mastery", () => {
  it("requires both 70 percent and every critical outcome", () => {
    const correct = questions.map(({ correctAnswer }) => correctAnswer);
    expect(flareQuizCompletionOutcome(correct, questions).passed).toBe(true);
    const missedCritical = [...correct];
    const criticalIndex = questions.findIndex(({ id }) => id === FLARE_CRITICAL_QUESTION_IDS[0]);
    missedCritical[criticalIndex] = (questions[criticalIndex].correctAnswer + 1) % questions[criticalIndex].options.length;
    expect(flareQuizCompletionOutcome(missedCritical, questions)).toMatchObject({ passed: false, missedCriticalIds: [FLARE_CRITICAL_QUESTION_IDS[0]] });
  });

  it("does not pass an incomplete or high-critical-only attempt", () => {
    expect(flareQuizCompletionOutcome([], questions).passed).toBe(false);
    const criticalOnly = questions.map(({ id, correctAnswer }) => FLARE_CRITICAL_QUESTION_IDS.includes(id as typeof FLARE_CRITICAL_QUESTION_IDS[number]) ? correctAnswer : null);
    expect(flareQuizCompletionOutcome(criticalOnly, questions).passed).toBe(false);
  });
});
