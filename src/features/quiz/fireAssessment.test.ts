import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/safetyFire";
import { FIRE_CRITICAL_QUESTION_IDS, fireQuizCompletionOutcome } from "./fireAssessment";

const testQuestions = questions.map((question) => ({ id: question.id, correctAnswer: question.correctAnswer }));
describe("Fire quiz completion policy", () => {
  it("gates every safety-critical decision in the revised bank", () => {
    expect(FIRE_CRITICAL_QUESTION_IDS).toEqual([
      "fire-applied-offshore-alarm-v2",
      "fire-applied-distress-v2",
      "fire-applied-engine-space-v2",
      "fire-applied-gas-isolation-v2",
      "fire-applied-smoke-boundary-v2",
      "fire-applied-withdraw-v2",
    ]);
    expect(FIRE_CRITICAL_QUESTION_IDS.every((id) => testQuestions.some((question) => question.id === id))).toBe(true);
  });

  it("fails an otherwise passing score when any safety-critical decision is missed", () => {
    for (const criticalId of FIRE_CRITICAL_QUESTION_IDS) {
      const answers = testQuestions.map((question) => question.correctAnswer); answers[testQuestions.findIndex((question) => question.id === criticalId)] = null;
      expect(fireQuizCompletionOutcome(answers, testQuestions)).toMatchObject({ percentage: 92, passed: false, missedCriticalIds: [criticalId] });
    }
  });
  it("passes only when the score threshold and every critical decision are satisfied", () => {
    expect(fireQuizCompletionOutcome(testQuestions.map((question) => question.correctAnswer), testQuestions)).toMatchObject({ percentage: 100, passed: true, missedCriticalIds: [] });
    expect(fireQuizCompletionOutcome(testQuestions.map((question) => question.correctAnswer === 0 ? 1 : 0), testQuestions).passed).toBe(false);
  });
});
