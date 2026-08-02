import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/victualling";
import { selectExamQuestions } from "@/features/exam/examEngine";
import { buildReviewQuestionRegistry, selectDueReviews } from "@/features/spaced-repetition/reviewQuestions";

describe("Victualling corrections across assessment consumers", () => {
  it("uses canonical safe wording in topic, exam and review while dropping withdrawn rows", () => {
    const tin = questions.find(({ id }) => id === "v17");
    const scald = questions.find(({ id }) => id === "v18");
    expect(tin?.explanation).toMatch(/ingredients and allergens.*date mark.*batch\/lot or recall/i);
    expect(scald?.explanation).toMatch(/Eliminate the hazard first.*no-cook.*Ordinary oilskins are not scald PPE/i);

    const exam = selectExamQuestions({ victualling: questions }, questions.length, () => 0);
    expect(exam.map(({ id }) => id)).not.toContain("v6");
    expect(exam.map(({ id }) => id)).not.toContain("v12");
    expect(exam.find(({ id }) => id === "v17")?.explanation).toBe(tin?.explanation);

    const registry = buildReviewQuestionRegistry({ victualling: questions });
    const due = selectDueReviews([
      { question_id: "v6", next_review_at: "2026-01-01T00:00:00Z" },
      { question_id: "v17", next_review_at: "2026-01-01T00:00:00Z" },
    ], registry, new Date("2026-01-02T00:00:00Z"));
    expect(due.map(({ question }) => question.id)).toEqual(["v17"]);
    expect(due[0].question.explanation).toBe(tin?.explanation);
  });
});
