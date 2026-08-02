import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/engine";
import { engineObjectives, engineQuestionMappings, engineTheoryRoute } from "@/data/engineAssessment";
import { engineSources } from "@/data/engineGuidance";
import { selectExamQuestions } from "@/features/exam/examEngine";
import { buildReviewQuestionRegistry, selectDueReviews } from "@/features/spaced-repetition/reviewQuestions";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260802181500_retire_unsafe_engine_reviews.sql"), "utf8");

describe("Engine assessment contract", () => {
  it("covers every stable objective exactly once with sources and remediation", () => {
    expect(Object.keys(engineQuestionMappings)).toEqual(questions.map(({ id }) => id));
    expect(Object.values(engineQuestionMappings).map(({ objectiveId }) => objectiveId)).toEqual(engineObjectives.map(({ id }) => id));
    const sourceIds = new Set(engineSources.map(({ id }) => id));
    for (const [questionId, mapping] of Object.entries(engineQuestionMappings)) {
      expect(mapping.sourceIds.length).toBeGreaterThan(0);
      expect(mapping.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(engineTheoryRoute(questionId)).toBe(`/engine#${mapping.theoryAnchor}`);
    }
    expect(engineTheoryRoute("retired-or-unknown")).toBe("/engine");
  });

  it("assesses stop, isolate and escalation decisions instead of unsafe recall", () => {
    const assessedText = questions.map(({ question, explanation }) => `${question} ${explanation}`).join(" ");
    expect(assessedText).toMatch(/stop promptly|stop as the fitted manual/i);
    expect(assessedText).toMatch(/isolate/i);
    expect(assessedText).toMatch(/escalate|competent/i);
    expect(assessedText).not.toMatch(/every type must drip slightly|universal annual interval|pink or green/i);
  });

  it("uses the same corrected bank for topic, exam and review", () => {
    const exam = selectExamQuestions({ engine: questions }, questions.length, () => 0);
    expect(exam.map(({ id }) => id).sort()).toEqual(questions.map(({ id }) => id).sort());
    const registry = buildReviewQuestionRegistry({ engine: questions });
    const due = selectDueReviews([
      { question_id: "e1", next_review_at: "2026-01-01T00:00:00Z" },
      { question_id: "e13", next_review_at: "2026-01-01T00:00:00Z" },
    ], registry, new Date("2026-01-02T00:00:00Z"));
    expect(due.map(({ question }) => question.id)).toEqual(["e13"]);
    expect(due[0].question).toBe(questions[0]);
  });

  it("retires every stale Engine identity and activates only replacements", () => {
    expect(migration).toContain("generate_series(13, 24)");
    expect(migration).toContain("set active = false");
    expect(migration.match(/\^e\(\[1-9\]\|1\[0-2\]\)\$/g)).toHaveLength(2);
    expect(questions.map(({ id }) => id)).toEqual(Array.from({ length: 12 }, (_, index) => `e${index + 13}`));
  });
});
