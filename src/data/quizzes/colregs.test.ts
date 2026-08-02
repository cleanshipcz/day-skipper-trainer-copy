import { describe, expect, it } from "vitest";
import questions, { COLREG_QUIZ_OBJECTIVE_MATRIX } from "./colregs";

describe("combined Rules diagnostic curriculum", () => {
  it("publishes one taught objective and remediation route for every question", () => {
    expect(questions).toHaveLength(20);
    expect(COLREG_QUIZ_OBJECTIVE_MATRIX).toHaveLength(questions.length);
    expect(new Set(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ questionId }) => questionId)).size).toBe(questions.length);
    expect(new Set(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ learningObjective }) => learningObjective)).size).toBe(questions.length);
    expect(new Set(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ prerequisite }) => prerequisite))).toEqual(
      new Set(["Steering & Sailing", "Lights & Signals"]),
    );
    for (const row of COLREG_QUIZ_OBJECTIVE_MATRIX) {
      expect(row.remediationRoute).toBe(row.prerequisite === "Steering & Sailing" ? "/rules/colregs" : "/rules/lights/theory");
    }
  });

  it("preserves the safety-critical Rule 18, crossing-risk, Rule 17 and mnemonic answers", () => {
    const byId = new Map(questions.map((question) => [question.id, question]));
    expect(byId.get("cr1")?.options[byId.get("cr1")!.correctAnswer]).toMatch(/power-driven vessel keeps out/i);
    expect(byId.get("cr1")?.explanation).toMatch(/Rules 9, 10 and 13.*conditional responsibility/i);
    expect(byId.get("cr3")?.question).toMatch(/power-driven.*bearings remain.*range decreases/i);
    expect(byId.get("cr3")?.explanation).toMatch(/sidelight colour alone would not establish/i);
    expect(byId.get("cr4")?.options[byId.get("cr4")!.correctAnswer]).toMatch(/may act.*must act/i);
    expect(byId.get("cr4")?.explanation).toMatch(/avoid altering to port/i);
    expect(byId.get("cr12")?.options[byId.get("cr12")!.correctAnswer]).toMatch(/not a 'danger side' rule/i);
  });

  it("uses plausible alternatives instead of joke or slogan answers", () => {
    const distractors = questions.flatMap(({ options, correctAnswer }) => options.filter((_, index) => index !== correctAnswer));
    expect(distractors.every((option) => option.length >= 12)).toBe(true);
    expect(distractors.join(" ")).not.toMatch(/Right is Might|more sails|doesn't matter/i);
  });
});
