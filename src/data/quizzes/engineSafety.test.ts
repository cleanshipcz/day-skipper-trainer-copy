import { describe, expect, it } from "vitest";
import { engineGuidance } from "../engineGuidance";
import questions from "./engine";

describe("Engine taught-to-assessed safety consistency", () => {
  const answers = Object.fromEntries(questions.map((question) => [question.id, `${question.options[question.correctAnswer]} ${question.explanation}`.toLowerCase()]));
  const taught = engineGuidance.map(({ body }) => body).join(" ").toLowerCase();

  it("assesses installation and manual authority rather than universal routines", () => {
    expect(answers.e1).toMatch(/manuals.*installation.*skipper.*competence/);
    expect(answers.e2).toMatch(/installation-specific.*absence of odour/);
    expect(answers.e7).toMatch(/different requirements.*universal drip rule/);
    expect(answers.e12).toMatch(/raw-water.*closed-circuit.*outboard/);
    expect(taught).toMatch(/inboard diesel.*inboard petrol.*outboard/);
  });

  it("assesses hot cooling, energy isolation and no-restart escalation", () => {
    expect(answers.e3).toMatch(/isolate.*never remove a hot.*pressurised/);
    expect(answers.e5).toMatch(/stop and isolate.*do not open.*do not restart/);
    expect(answers.e8).toMatch(/stop.*isolate.*do not restart/);
  });

  it("contains no retired universal claims", () => {
    const catalogue = questions.map(({ question, explanation }) => `${question} ${explanation}`).join(" ");
    expect(catalogue).not.toMatch(/BWORCA|4 minutes minimum|should drip slightly|pink or green|warm gearbox oil/);
  });
});
