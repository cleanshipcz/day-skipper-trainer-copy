import { describe, expect, it } from "vitest";
import questions, { SAFETY_QUIZ_CRITICAL_IDS, SAFETY_QUIZ_OBJECTIVE_MATRIX } from "@/data/quizzes/safety";
import { safetyQuizCompletionOutcome } from "./safetyAssessment";

describe("comprehensive Safety mastery policy", () => {
  it("publishes a stable 4x6 objective matrix with leaf remediation", () => {
    expect(SAFETY_QUIZ_OBJECTIVE_MATRIX).toHaveLength(24);
    for (const leaf of ["mob", "fire", "raft", "flare", "personal", "gas"]) {
      const rows = SAFETY_QUIZ_OBJECTIVE_MATRIX.filter((row) => row.leaf === leaf);
      expect(rows).toHaveLength(4);
      expect(new Set(rows.map(({ objectiveId }) => objectiveId)).size).toBe(4);
      rows.forEach(({ remediationRoute }) => expect(remediationRoute).toMatch(/^\/safety\//));
    }
    const stableIds = ["mob", "fire", "raft", "flare", "personal", "gas"].flatMap((leaf) => [1, 2, 3, 4].map((number) => `safety-${leaf}${number}`));
    expect(questions.map(({ id }) => id)).toEqual(stableIds);
    const objectives = SAFETY_QUIZ_OBJECTIVE_MATRIX.map(({ objectiveId }) => objectiveId).join(" ");
    expect(objectives).toMatch(/sequence/);
    expect(objectives).toMatch(/stop|escalate/);
    expect(objectives).toMatch(/manufacturer/);
    expect(objectives).toMatch(/boundary/);
  });

  it("requires three of four in every leaf and every critical boundary", () => {
    const allCorrect = questions.map(({ correctAnswer }) => correctAnswer);
    expect(safetyQuizCompletionOutcome(allCorrect, questions).passed).toBe(true);
    for (const criticalId of SAFETY_QUIZ_CRITICAL_IDS) {
      const answers = [...allCorrect];
      const index = questions.findIndex(({ id }) => id === criticalId);
      answers[index] = (questions[index].correctAnswer + 1) % questions[index].options.length;
      expect(safetyQuizCompletionOutcome(answers, questions)).toMatchObject({ passed: false, missedCriticalIds: [criticalId] });
    }
    const weakLeaf = [...allCorrect];
    questions.forEach((question, index) => { if (question.leaf === "mob" && question.id !== "safety-mob3") weakLeaf[index] = null; });
    expect(safetyQuizCompletionOutcome(weakLeaf, questions)).toMatchObject({ passed: false, failedLeaves: ["mob"] });
  });
});
