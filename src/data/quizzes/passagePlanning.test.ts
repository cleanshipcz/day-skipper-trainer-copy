import { describe, expect, it } from "vitest";
import questions, { PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX } from "./passagePlanning";

describe("Passage Planning quiz curriculum contract", () => {
  it("traces every question to one of all four taught leaves and a stable objective", () => {
    expect(PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX.map((row) => row.questionId)).toEqual(questions.map((question) => question.id));
    expect(new Set(PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX.map((row) => row.leaf))).toEqual(new Set(["prepare", "calculator", "plan-builder", "pre-departure"]));
    for (const row of PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX) {
      expect(row.objective.length, row.questionId).toBeGreaterThan(18);
      expect(row.sourceRoute, row.questionId).toMatch(/^\/passage-planning\/(?:prepare|calculator|builder|checklist)/);
    }
  });

  it("cannot randomize away a major objective because every attempt uses the complete balanced bank", () => {
    const required = ["appraise", "regulations", "equipment", "plan", "contingencies", "execute-monitor", "time-eta", "fuel", "route-gates", "crew-safety", "vessel-readiness"];
    expect(new Set(PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX.map((row) => row.majorObjective))).toEqual(new Set(required));
    const perLeaf = Object.fromEntries(["prepare", "calculator", "plan-builder", "pre-departure"].map((leaf) => [leaf, PASSAGE_PLANNING_QUIZ_COVERAGE_MATRIX.filter((row) => row.leaf === leaf).length]));
    expect(perLeaf).toEqual({ prepare: 10, calculator: 6, "plan-builder": 6, "pre-departure": 8 });
  });

  it("retains the audited missing applied outcomes and verified arithmetic", () => {
    const byId = new Map(questions.map((question) => [question.id, question]));
    const answer = (id: string) => { const question = byId.get(id)!; return question.options[question.correctAnswer]; };
    for (const id of ["passage-21", "passage-22", "passage-23", "passage-24", "passage-27", "passage-28", "passage-29", "passage-30"]) expect(byId.has(id), id).toBe(true);
    expect(answer("passage-4")).toBe("4 hours");
    expect(answer("passage-24")).toBe("14:23");
    expect(answer("passage-25")).toBe("15:10");
    expect(answer("passage-5")).toBe("12 L");
    expect(answer("passage-6")).toBe("12 L");
    expect(byId.get("passage-24")?.explanation).toMatch(/09:35.*4 hours.*13:35.*48 minutes.*14:23/);
    expect(byId.get("passage-29")?.explanation).toMatch(/stopped, isolated and cool.*critical indications and cooling/i);
  });

  it("uses useful explanations and plausible operational distractors", () => {
    for (const question of questions) {
      expect(question.explanation.length, question.id).toBeGreaterThan(70);
      expect(new Set(question.options).size, question.id).toBe(4);
      expect(question.options[question.correctAnswer], question.id).toBeTruthy();
    }
    expect(questions.flatMap((question) => question.options).join(" ")).not.toMatch(/decoration|paint drying|restaurants|receive music/i);
  });
});
