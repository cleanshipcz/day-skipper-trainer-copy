import { describe, expect, it } from "vitest";

import safetyQuestions from "./safety";

describe("gas safety knowledge check", () => {
  it("tests the no-start response to a suspected LPG leak", () => {
    const question = safetyQuestions.find(({ id }) => id === "safety-gas3")!;
    const correct = question.options[question.correctAnswer];
    const guidance = `${question.question} ${correct} ${question.explanation}`;

    expect(question.question).toMatch(/before starting the engine/i);
    expect(correct).toMatch(/do not start/i);
    expect(guidance).toMatch(/isolate LPG only if safe/i);
    expect(guidance).toMatch(/without using electrical switches/i);
    expect(guidance).toMatch(/evacuat/i);
    expect(guidance).toMatch(/ventilate naturally from outside/i);
    expect(guidance).toMatch(/summon.*help/i);
    expect(guidance).toMatch(/out of use until.*competent boat-LPG/i);
    expect(guidance).toMatch(/cylinder leak cannot be stopped.*withdraw/i);
  });
});
