import { describe, expect, it } from "vitest";
import questions, { LIGHTS_SIGNALS_OBJECTIVE_MATRIX, LIGHTS_SIGNALS_REVIEWED_SCOPE } from "./lightsSignals";
import { validateQuizBank } from "./index";

describe("Lights and signals mastery bank", () => {
  it("publishes one objective row per parent question and covers the reviewed Rules 20–36 plus distress scope", () => {
    expect(questions).toHaveLength(20);
    expect(LIGHTS_SIGNALS_OBJECTIVE_MATRIX).toHaveLength(questions.length);
    expect(new Set(LIGHTS_SIGNALS_OBJECTIVE_MATRIX.map(({ questionId }) => questionId))).toEqual(new Set(questions.map(({ id }) => id)));
    const covered = new Set(LIGHTS_SIGNALS_OBJECTIVE_MATRIX.flatMap(({ ruleCoverage }) => ruleCoverage));
    LIGHTS_SIGNALS_REVIEWED_SCOPE.forEach((rule) => expect(covered.has(rule), `${rule} is not assessed`).toBe(true));
  });

  it("keeps every authored choice uniquely valid and accepted by the shared quiz contract", () => {
    expect(validateQuizBank("lights-signals", questions)).toBe(questions);
    questions.forEach(({ id, options, correctAnswer, explanation, prerequisite, remediationRoute }) => {
      expect(options[correctAnswer], `${id} has no valid key`).toBeTruthy();
      expect(new Set(options.map((option) => option.toLocaleLowerCase())).size, `${id} repeats an option`).toBe(options.length);
      expect(explanation.length, `${id} remediation is too thin`).toBeGreaterThan(100);
      expect(prerequisite).toBe("Lights, Shapes & Sounds theory");
      expect(remediationRoute).toMatch(/^\/rules\/lights\/theory/);
    });
  });

  it("states the Rule 34 minimum/context and removes the standalone-diamond ambiguity", () => {
    const ls14 = questions.find(({ id }) => id === "ls14")!;
    expect(ls14.question).toMatch(/in sight/i);
    expect(ls14.options[ls14.correctAnswer]).toBe("At least five short and rapid blasts");
    expect(ls14.explanation).toMatch(/minimum, not an exact count/i);
    const ls19 = questions.find(({ id }) => id === "ls19")!;
    expect(ls19.question).toMatch(/towing astern.*exceeds 200 m/i);
    expect(ls19.explanation).toMatch(/without those facts is ambiguous/i);
  });

  it("provides nonvisual equivalents for applied aspect, placement and timed-signal assessments", () => {
    for (const id of ["ls4", "ls8", "ls16"]) {
      const scenario = questions.find((item) => item.id === id)?.scenario;
      expect(scenario?.accessibleName).toBeTruthy();
      expect(scenario?.description).toBeTruthy();
      expect(scenario?.facts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
