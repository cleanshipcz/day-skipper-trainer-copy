import { describe, expect, it } from "vitest";
import { anchorQuizRemediationTopic, anchorTheoryRoute } from "./learningPath";

describe("anchorwork guided learning path", () => {
  it("returns practice learners to the relevant theory topic", () => {
    expect(anchorTheoryRoute("scope", "practice")).toBe("/anchorwork?topic=scope&from=practice");
  });

  it("maps the first missed assessed quiz skill to remediation", () => {
    expect(anchorQuizRemediationTopic(["a1", "a2", "a3"], [0, 1, 0], [0, 2, 0])).toBe("procedure");
  });

  it("uses safe scope remediation for an unknown assessment", () => {
    expect(anchorQuizRemediationTopic(["new-question"], [0], [1])).toBe("scope");
  });
});
