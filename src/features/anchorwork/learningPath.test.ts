import { describe, expect, it } from "vitest";
import questions, { anchorworkAssessmentCoverage, anchorworkOutcomeSources } from "@/data/quizzes/anchorwork";
import { topics } from "@/data/anchorTopics";
import { anchorQuizRemediationByQuestion, anchorQuizRemediationTopic, anchorTheoryRoute } from "./learningPath";

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

  it("provides valid, outcome-aligned runtime remediation for every production question", () => {
    const topicIds = new Set(topics.map(({ id }) => id));
    expect(Object.keys(anchorQuizRemediationByQuestion).sort()).toEqual(questions.map(({ id }) => id).sort());

    for (const question of questions) {
      const remediation = anchorQuizRemediationTopic([question.id], [question.correctAnswer === 0 ? 1 : 0], [question.correctAnswer]);
      const taughtSources = new Set(anchorworkAssessmentCoverage[question.id].flatMap((outcome) => anchorworkOutcomeSources[outcome]));
      expect(topicIds.has(remediation), `${question.id} points outside Anchorwork theory`).toBe(true);
      expect(taughtSources.has(remediation), `${question.id} remediation is unrelated to its assessed outcome`).toBe(true);
    }
  });
});
