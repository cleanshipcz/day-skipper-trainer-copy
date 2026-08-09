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
    expect(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ questionId, objectiveId }) => [questionId, objectiveId])).toEqual([
      ["cr1", "rule-18-responsibilities"], ["cr2", "rule-13-overtaking"], ["cr3", "rules-7-15-16-crossing-risk"],
      ["cr4", "rule-17-escalation"], ["cr5", "rule-12-sailing"], ["cr6", "rule-6-safe-speed"],
      ["cr7", "rule-14-head-on"], ["cr8", "rule-9-narrow-channel"], ["cr9", "rule-10-tss"],
      ["cr10", "rule-19-restricted-visibility"], ["cr11", "rule-8-verify-action"], ["cr12", "rule-15-applicability"],
      ["cr13", "rule-23-power-lights"], ["cr14", "rule-25-sailing-lights"], ["cr15", "rule-34-starboard-signal"],
      ["cr16", "rule-34-doubt-signal"], ["cr17", "rule-35-making-way"], ["cr18", "rule-35-stopped"],
      ["cr19", "rule-30-anchor-shape"], ["cr20", "rule-27-nuc-lights"],
    ]);
    expect(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ questionId, prerequisite }) => [questionId, prerequisite])).toEqual([
      ...Array.from({ length: 12 }, (_, index) => [`cr${index + 1}`, "Steering & Sailing"]),
      ...Array.from({ length: 8 }, (_, index) => [`cr${index + 13}`, "Lights & Signals"]),
    ]);
    expect(COLREG_QUIZ_OBJECTIVE_MATRIX.map(({ remediationRoute }) => remediationRoute)).toEqual([
      "/rules/colregs#rule-18", "/rules/colregs#rule-13", "/rules/colregs#rule-15", "/rules/colregs#rule-17",
      "/rules/colregs#rule-12", "/rules/colregs#rule-6", "/rules/colregs#rule-14", "/rules/colregs#rule-9",
      "/rules/colregs#rule-10", "/rules/colregs#rule-19", "/rules/colregs#rule-8", "/rules/colregs#rule-15",
      "/rules/lights/theory?section=lights#rule-23", "/rules/lights/theory?section=lights#rule-25",
      "/rules/lights/theory?section=sounds#rule-34", "/rules/lights/theory?section=sounds#rule-34",
      "/rules/lights/theory?section=sounds#rule-35", "/rules/lights/theory?section=sounds#rule-35",
      "/rules/lights/theory?section=shapes#rule-30", "/rules/lights/theory?section=lights#rule-27",
    ]);
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

  it("provides unique, non-answer-bearing structured equivalents for every visual scenario", () => {
    const scenarios = questions.filter(({ scenario }) => scenario);
    expect(scenarios.map(({ id }) => id)).toEqual(["cr2", "cr3", "cr4", "cr5", "cr7", "cr13", "cr14"]);
    expect(new Set(scenarios.map(({ scenario }) => scenario!.accessibleName)).size).toBe(scenarios.length);
    for (const { id, scenario } of scenarios) {
      expect(scenario!.accessibleName).toContain(id);
      expect(scenario!.facts.length).toBeGreaterThanOrEqual(3);
      expect(JSON.stringify(scenario)).not.toMatch(/give[- ]?way|keep out|stand-on|alter (course|to)/i);
    }
  });

  it("makes vessel labels, bearings, side lights, angles and encounter facts explicit", () => {
    const text = (id: string) => JSON.stringify(questions.find((question) => question.id === id)?.scenario);
    expect(text("cr2")).toMatch(/30° abaft.*starboard beam/i);
    expect(text("cr3")).toMatch(/red sidelight.*35°.*starboard bow.*035°.*range decreases/i);
    expect(text("cr3")).toMatch(/course and heading 000°.*35°.*035°/i);
    expect(text("cr5")).toMatch(/Boat A.*windward.*Boat B.*leeward/i);
    expect(text("cr7")).toMatch(/reciprocal.*masthead lights.*both sidelights/i);
    expect(text("cr13")).toMatch(/white masthead.*red sidelight.*green sidelight/i);
  });
});
