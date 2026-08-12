import { describe, expect, it } from "vitest";
import { FIRE_CRITICAL_QUESTION_IDS, fireQuizCompletionOutcome } from "./fireAssessment";

const questions = [...FIRE_CRITICAL_QUESTION_IDS, ...Array.from({ length: 8 }, (_, index) => `other-${index}`)].map((id) => ({ id, correctAnswer: 1 }));
describe("Fire quiz completion policy", () => {
  it("fails an otherwise passing score when any safety-critical decision is missed", () => {
    for (const criticalId of FIRE_CRITICAL_QUESTION_IDS) {
      const answers = Array(12).fill(1); answers[questions.findIndex((question) => question.id === criticalId)] = 0;
      expect(fireQuizCompletionOutcome(answers, questions)).toMatchObject({ percentage: 92, passed: false, missedCriticalIds: [criticalId] });
    }
  });
  it("passes only when the score threshold and every critical decision are satisfied", () => {
    expect(fireQuizCompletionOutcome(Array(12).fill(1), questions)).toMatchObject({ percentage: 100, passed: true, missedCriticalIds: [] });
    expect(fireQuizCompletionOutcome([...Array(4).fill(1), ...Array(8).fill(0)], questions).passed).toBe(false);
  });
});
