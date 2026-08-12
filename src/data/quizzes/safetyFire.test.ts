import { describe, expect, it } from "vitest";
import questions, { FIRE_QUIZ_OUTCOME_MAP, FIRE_QUIZ_PASS_POLICY, FIRE_QUIZ_RELEASE_REVIEW, FIRE_QUIZ_REVIEW_BASIS, isFireQuizReleaseApproved } from "./safetyFire";
import { fireExtinguishers, fireResponseScenarios, fireScenarios } from "../fireExtinguishers";

describe("applied fire-safety quiz contract", () => {
  it("maps every stable unique question exactly once to the required outcomes", () => {
    const ids = questions.map((question) => question.id);
    const mapped = Object.values(FIRE_QUIZ_OUTCOME_MAP).flat();
    expect(new Set(ids).size).toBe(ids.length);
    expect(mapped.sort()).toEqual([...ids].sort());
    expect(Object.keys(FIRE_QUIZ_OUTCOME_MAP)).toEqual(expect.arrayContaining(["prevention", "alarm-muster-escape", "distress", "isolation", "equipment-rating", "smoke-propagation", "re-ignition-monitoring", "decision-not-to-fight", "integrated-response"]));
  });

  it("provides diagnostic traceability and substantive applicability, limitation, distractor and remediation text", () => {
    for (const question of questions) {
      expect(question.learningObjective).toBeTruthy();
      expect(question.prerequisite).toContain("Fire Safety lesson");
      expect(question.remediationRoute).toBe("/safety/fire");
      expect(question.explanation.length).toBeGreaterThan(180);
      expect(question.explanation).toMatch(/Review/);
      expect(question.options.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("consumes the inherited fire model rather than inventing incompatible equipment or procedure claims", () => {
    const quizText = JSON.stringify(questions);
    for (const id of ["wet-chemical", "foam", "dry-powder", "co2"]) expect(fireExtinguishers.some((item) => item.id === id)).toBe(true);
    expect(fireScenarios.map((scenario) => scenario.id)).toEqual(expect.arrayContaining(["galley-oil", "engine-diesel", "electrical-panel", "gas-leak-ignition", "bunk-mattress"]));
    expect(fireResponseScenarios.map((scenario) => scenario.id)).toEqual(expect.arrayContaining(["offshore-cabin-smoke", "alongside-fire", "immediate-evacuation", "engine-space-closed", "smoke-entry"]));
    expect(quizText).not.toMatch(/CO2 suffocates fire|engine room.*CO2.*most suitable|remove any one.*fire goes out/i);
  });

  it("states a truthful written-assessment pass claim", () => {
    expect(FIRE_QUIZ_PASS_POLICY.passingPercentage).toBe(70);
    expect(FIRE_QUIZ_PASS_POLICY.claim).toMatch(/written scenarios only/i);
    expect(FIRE_QUIZ_PASS_POLICY.claim).toMatch(/not practical firefighting competence/i);
  });

  it("fails the competent-review gate closed until identity, qualification, date and all sources are recorded", () => {
    expect(isFireQuizReleaseApproved(FIRE_QUIZ_RELEASE_REVIEW)).toBe(false);
    const approved = { reviewed: true, reviewerName: "Marine fire reviewer", reviewerQualification: "Competent marine fire-safety professional", approvalDate: "2026-08-12", sourceEvidence: [...FIRE_QUIZ_REVIEW_BASIS] };
    expect(isFireQuizReleaseApproved(approved)).toBe(true);
    expect(isFireQuizReleaseApproved({ ...approved, approvalDate: null })).toBe(false);
    expect(isFireQuizReleaseApproved({ ...approved, approvalDate: "2026-99-99" })).toBe(false);
    expect(isFireQuizReleaseApproved({ ...approved, approvalDate: "2026-02-31" })).toBe(false);
    expect(isFireQuizReleaseApproved({ ...approved, approvalDate: "2024-02-29" })).toBe(true);
    expect(isFireQuizReleaseApproved({ ...approved, sourceEvidence: approved.sourceEvidence.slice(1) })).toBe(false);
  });
});
