import { describe, expect, it } from "vitest";
import { rigAssessmentCoverage, rigObjectives } from "../rigAssessment";
import questions from "./rig";

describe("Rig theory-to-assessment contract", () => {
  it("maps every retained stable question and assesses every taught objective", () => {
    expect(questions.map(({ id }) => id)).toEqual(Array.from({ length: 12 }, (_, index) => `rg${index + 1}`));
    expect(Object.keys(rigAssessmentCoverage)).toEqual(questions.map(({ id }) => id));
    expect(new Set(Object.values(rigAssessmentCoverage))).toEqual(new Set(rigObjectives.map(({ id }) => id)));
    expect(rigObjectives.every(({ theoryAnchor, questionIds }) => theoryAnchor && questionIds.length > 0)).toBe(true);
  });

  it("assesses safety-first disposition and rejects universal shortcuts", () => {
    const text = questions.map(({ question, explanation, options }) => `${question} ${explanation} ${options.join(" ")}`).join(" ");
    expect(text).toMatch(/keep clear/i);
    expect(text).toMatch(/no-sail|do not sail/i);
    expect(text).toMatch(/secure or unload|positively support/i);
    expect(text).toMatch(/competent assessment/i);
    expect(text).toMatch(/not inspection evidence|learning only/i);
    expect(text).not.toMatch(/inspection before season start|aloft inspection annually|proper rig tension is crucial/i);
  });

  it("explains why distractors are unsafe or unsupported", () => {
    for (const question of questions) {
      expect(question.options).toHaveLength(4);
      expect(question.explanation.length).toBeGreaterThan(150);
      expect(question.explanation).toMatch(/;|while|and|cannot|insufficient/i);
    }
  });
});
