import { describe, expect, it } from "vitest";
import { remainingSeconds, scoreExam, selectExamQuestions } from "./examEngine";
import safetyQuestions from "@/data/quizzes/safety";

const question = (id: string, correctAnswer = 0) => ({
  id, question: id, options: ["a", "b"], correctAnswer, explanation: "why",
});

describe("exam engine", () => {
  it("selects unique questions across topics and respects the requested limit", () => {
    const selected = selectExamQuestions({ colregs: [question("1"), question("2")], victualling: [question("1")] }, 3, () => 0);
    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((item) => `${item.topicId}:${item.id}`)).size).toBe(3);
  });

  it("clamps invalid counts, skips empty banks, and handles random upper bounds", () => {
    expect(selectExamQuestions({ empty: [], custom: [question("1")] }, 1, () => 1))
      .toEqual([{ ...question("1"), topicId: "custom" }]);
    expect(selectExamQuestions({ custom: [question("1")] }, Number.NaN, () => 0)).toEqual([]);
    expect(selectExamQuestions({}, 10, () => 0)).toEqual([]);
  });

  it("scores overall and by topic, treating incomplete answers as incorrect", () => {
    const result = scoreExam([
      { ...question("1"), topicId: "a" },
      { ...question("2", 1), topicId: "a" },
      { ...question("3"), topicId: "b" },
    ], [0, null, 1], 65);
    expect(result).toMatchObject({ score: 1, percentage: 33, passed: false });
    expect(result.topicBreakdown.a).toEqual({ correct: 1, total: 2, percentage: 50 });
  });

  it("never returns a negative timer value", () => {
    expect(remainingSeconds(1_000, 10, 15_000)).toBe(0);
    expect(remainingSeconds(1_000, 10, 5_000)).toBe(6);
  });

  it("returns a passing empty-safe score", () => {
    expect(scoreExam([], [], 0)).toEqual({ score: 0, percentage: 0, passed: true, topicBreakdown: {}, safetyEvidence: { status: "sampled", masteryEligible: false, passed: false, failedLeaves: [], missedCriticalIds: [] } });
  });

  it("classifies sampled Safety questions as non-mastery even when the overall exam passes", () => {
    const result = scoreExam([{ ...question("safety-mob3"), topicId: "safety", leaf: "mob" }], [0], 65);
    expect(result).toMatchObject({ passed: true, safetyEvidence: { status: "sampled", masteryEligible: false, passed: false } });
  });

  it("enforces leaf and critical remediation when a full Safety block is present", () => {
    const questions = safetyQuestions.map((item) => ({ ...item, topicId: "safety" }));
    const answers = questions.map(({ correctAnswer }) => correctAnswer);
    answers[questions.findIndex(({ id }) => id === "safety-mob3")] = 0;
    const result = scoreExam(questions, answers, 65);
    expect(result.passed).toBe(true);
    expect(result.safetyEvidence).toMatchObject({ status: "full-bank", masteryEligible: false, passed: false, missedCriticalIds: ["safety-mob3"] });
  });

  it("rejects substituted and duplicate IDs as sampled rather than full-bank evidence", () => {
    const canonical = safetyQuestions.map((item) => ({ ...item, topicId: "safety" }));
    const answers = canonical.map(({ correctAnswer }) => correctAnswer);
    const substituted = canonical.map((question, index) => index === 0 ? { ...question, id: "safety-retired-forged" } : question);
    expect(scoreExam(substituted, answers, 65).safetyEvidence).toMatchObject({ status: "sampled", masteryEligible: false });
    const duplicated = canonical.map((question, index) => index === 0 ? { ...question, id: canonical[1].id } : question);
    expect(scoreExam(duplicated, answers, 65).safetyEvidence).toMatchObject({ status: "sampled", masteryEligible: false });
  });

  it("ignores forged session leaf metadata and evaluates canonical Safety metadata", () => {
    const forged = safetyQuestions.map((item) => ({ ...item, leaf: "forged-pass-leaf", topicId: "safety" }));
    const answers = safetyQuestions.map(({ correctAnswer }) => correctAnswer);
    const missed = safetyQuestions.findIndex(({ id }) => id === "safety-mob3");
    answers[missed] = (answers[missed] + 1) % safetyQuestions[missed].options.length;
    expect(scoreExam(forged, answers, 65).safetyEvidence).toMatchObject({
      status: "full-bank", masteryEligible: false, missedCriticalIds: ["safety-mob3"],
    });
  });
});
