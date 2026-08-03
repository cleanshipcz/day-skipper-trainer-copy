import { describe, expect, it } from "vitest";
import { topics } from "../anchorTopics";
import questions, {
  anchorworkAssessmentCoverage,
  anchorworkOutcomes,
  anchorworkOutcomeSources,
} from "./anchorwork";

describe("Anchorwork taught-to-assessed coverage", () => {
  it("maps every question to a reviewed outcome taught by a parent lesson", () => {
    const questionIds = questions.map(({ id }) => id);
    const outcomeIds = new Set(Object.keys(anchorworkOutcomes));
    const topicIds = new Set(topics.map(({ id }) => id));

    expect(Object.keys(anchorworkAssessmentCoverage).sort()).toEqual([...questionIds].sort());
    for (const questionId of questionIds) {
      const mapped = anchorworkAssessmentCoverage[questionId];
      expect(mapped.length, `${questionId} has no outcome`).toBeGreaterThan(0);
      for (const outcomeId of mapped) {
        expect(outcomeIds.has(outcomeId), `${questionId} uses unknown outcome ${outcomeId}`).toBe(true);
        expect(anchorworkOutcomeSources[outcomeId].length).toBeGreaterThan(0);
        for (const topicId of anchorworkOutcomeSources[outcomeId]) {
          expect(topicIds.has(topicId), `${outcomeId} uses untaught source ${topicId}`).toBe(true);
        }
      }
    }
  });

  it("assesses every reviewed outcome", () => {
    const assessed = new Set(Object.values(anchorworkAssessmentCoverage).flat());
    expect([...assessed].sort()).toEqual(Object.keys(anchorworkOutcomes).sort());
  });
});

describe("Anchorwork question quality", () => {
  it("includes worked scope and swinging-clearance scenarios with units, assumptions and limits", () => {
    const scope = questions.find(({ id }) => id === "a1")!;
    const clearance = questions.find(({ id }) => id === "a3")!;

    expect(scope.question).toMatch(/6 m.*1 m.*35 m/);
    expect(scope.explanation).toMatch(/7 m.*35 m.*5:1/);
    expect(clearance.question).toMatch(/Assume.*35 m.*7 m.*10 m.*40 m/);
    expect(clearance.explanation).toMatch(/44\.3 m.*exceeds.*40 m.*uncertainty/i);
  });

  it("uses operational scenarios and explanations that state the safe decision boundary", () => {
    const requiredScenarioIds = ["a2", "a3", "a5", "a8", "a10", "a12"];
    for (const id of requiredScenarioIds) {
      const question = questions.find((candidate) => candidate.id === id)!;
      expect(question.question.length).toBeGreaterThan(65);
      expect(question.explanation.length).toBeGreaterThan(100);
    }
    expect(questions.find(({ id }) => id === "a8")!.explanation).toMatch(/scenario-dependent.*only when.*safe swing room/i);
  });

  it("avoids absolute shortcut answers for scope, holding, chain and dragging", () => {
    const learnerGuidance = questions.map(({ explanation }) => explanation).join(" ");
    expect(learnerGuidance).not.toMatch(/minimum (?:scope|ratio)|guarantees? holding|chain.*absorbs shock loads/i);
    expect(learnerGuidance).toMatch(/not proof.*safe|No single|catenary reduces|More rode is an option only/i);
  });
});
