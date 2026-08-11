import { describe, expect, it } from "vitest";
import type { Question } from "@/data/quizzes/types";
import { buildQuizSession } from "./buildQuizSession";

const questions: readonly Question[] = Array.from({ length: 12 }, (_, index) => ({
  id: `question-${index + 1}`,
  question: `Question ${index + 1}`,
  options: [`wrong-a-${index}`, `correct-${index}`, `wrong-b-${index}`, `wrong-c-${index}`],
  correctAnswer: 1,
  explanation: `Explanation ${index + 1}`,
}));

describe("buildQuizSession", () => {
  it("deterministically shuffles questions and options for the same seed", () => {
    const first = buildQuizSession(questions, 42);
    const second = buildQuizSession(questions, 42);
    expect(first).toEqual(second);
    expect(first.map(({ id }) => id)).not.toEqual(questions.map(({ id }) => id));
    expect(first.some((question) => question.options.join("|") !== questions.find(({ id }) => id === question.id)?.options.join("|"))).toBe(true);
  });

  it("changes runtime order across seeds without sampling questions out", () => {
    const first = buildQuizSession(questions, 1);
    const second = buildQuizSession(questions, 2);
    expect(first.map(({ id }) => id)).not.toEqual(second.map(({ id }) => id));
    expect(new Set(first.map(({ id }) => id))).toEqual(new Set(questions.map(({ id }) => id)));
    expect(new Set(second.map(({ id }) => id))).toEqual(new Set(questions.map(({ id }) => id)));
  });

  it("remaps every correct index to the original keyed answer after option shuffling", () => {
    const keyedAnswers = new Map(questions.map((question) => [question.id, question.options[question.correctAnswer]]));
    for (const question of buildQuizSession(questions, 731)) {
      expect(question.options[question.correctAnswer], question.id).toBe(keyedAnswers.get(question.id));
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThan(question.options.length);
    }
  });

  it("handles empty and single-question catalogues without mutating their inputs", () => {
    expect(buildQuizSession([], 0)).toEqual([]);
    const single: readonly Question[] = [{ id: "only", question: "Only?", options: ["yes"], correctAnswer: 0, explanation: "Only answer" }];
    const snapshot = structuredClone(single);
    expect(buildQuizSession(single, 9)).toEqual(single);
    expect(single).toEqual(snapshot);
  });
});
