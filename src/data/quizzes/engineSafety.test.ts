import { describe, expect, it } from "vitest";
import { engineGuidance } from "../engineGuidance";
import questions from "./engine";

describe("Engine taught-to-assessed safety consistency", () => {
  const answers = Object.fromEntries(questions.map((question) => [question.id, `${question.options[question.correctAnswer]} ${question.explanation}`.toLowerCase()]));
  const taught = engineGuidance.map(({ body }) => body).join(" ").toLowerCase();

  it("assesses installation and manual authority rather than universal routines", () => {
    expect(answers.e13).toMatch(/installation.*manuals.*skipper.*authority/);
    expect(answers.e15).toMatch(/installation-specific.*does not prove absence/);
    expect(answers.e23).toMatch(/different leakage.*never approach live stern gear/);
    expect(answers.e16).toMatch(/wet-exhaust discharge.*tell-tale.*specified indication/);
    expect(taught).toMatch(/inboard diesel.*inboard petrol.*outboard/);
  });

  it("assesses hot cooling, energy isolation and no-restart escalation", () => {
    expect(answers.e16).toMatch(/stop.*isolate.*before restart/);
    expect(answers.e17).toMatch(/stop promptly.*isolate.*never work beside moving machinery/);
    expect(answers.e18).toMatch(/isolate.*restart.*competent/);
  });

  it("contains no retired universal claims", () => {
    const catalogue = questions.map(({ question, explanation }) => `${question} ${explanation}`).join(" ");
    expect(catalogue).not.toMatch(/BWORCA|4 minutes minimum|should drip slightly|pink or green|warm gearbox oil/);
  });
});
