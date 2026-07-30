import { describe, expect, test } from "vitest";
import { quizRegistry } from "@/data/quizzes";
import { buildReviewQuestionRegistry, selectDueReviews } from "./reviewQuestions";

describe("review question registry", () => {
  test("should resolve every shared quiz question without duplicating definitions", () => {
    const registry = buildReviewQuestionRegistry(quizRegistry);
    const expectedCount = Object.values(quizRegistry).reduce((sum, questions) => sum + questions.length, 0);

    expect(registry.size).toBe(expectedCount);
    expect([...registry.values()][0]).toMatchObject({ topicId: expect.any(String), question: expect.any(Object) });
  });

  test("should reject duplicate stable question ids across topics", () => {
    const duplicate = { ...quizRegistry, duplicate: [Object.values(quizRegistry)[0][0]] };

    expect(() => buildReviewQuestionRegistry(duplicate)).toThrow(/duplicate quiz question id/i);
  });

  test("should filter due records, ignore unknown ids, and order oldest first", () => {
    const now = new Date("2026-07-30T07:00:00.000Z");
    const questionId = Object.values(quizRegistry)[0][0].id;
    const records = [
      { question_id: questionId, next_review_at: "2026-07-30T06:00:00.000Z" },
      { question_id: "removed-question", next_review_at: "2026-07-29T06:00:00.000Z" },
      { question_id: questionId, next_review_at: "2026-07-31T06:00:00.000Z" },
    ];

    const due = selectDueReviews(records, buildReviewQuestionRegistry(quizRegistry), now);

    expect(due).toHaveLength(1);
    expect(due[0].review.next_review_at).toBe("2026-07-30T06:00:00.000Z");
  });
});
