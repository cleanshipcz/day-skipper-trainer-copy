import { describe, expect, it } from "vitest";
import questions, { SAFETY_QUIZ_REVIEW_METADATA } from "./safety";

const question = (id: string) => questions.find((candidate) => candidate.id === id)!;

describe("corrected comprehensive Safety bank", () => {
  it("preserves stable IDs while publishing remediation metadata", () => {
    expect(questions).toHaveLength(24);
    questions.forEach(({ id, leaf, learningObjective, remediationRoute, prerequisite }) => {
      expect(id).toMatch(/^safety-(mob|fire|raft|flare|personal|gas)[1-4]$/);
      expect(leaf).toMatch(/^(mob|fire|raft|flare|personal|gas)$/);
      expect(learningObjective).toBeTruthy();
      expect(remediationRoute).toMatch(/^\/safety\//);
      expect(prerequisite).toMatch(/corrected Safety lesson.*vessel\/equipment instructions/i);
    });
  });

  it("corrects raft service, flare scope and MOB recovery without generic claims", () => {
    expect(question("safety-raft3").options[question("safety-raft3").correctAnswer]).toMatch(/manufacturer's schedule.*service label\/certificate.*pack.*regime.*history/i);
    expect(question("safety-raft3").explanation).not.toMatch(/must.*every (?:year|3 years)/i);
    expect(question("safety-flare2").options[question("safety-flare2").correctAnswer]).toMatch(/vessel's use.*jurisdiction.*operating area.*applicable rules or guidance/i);
    expect(question("safety-flare3").explanation).toMatch(/exact label controls.*handling.*orientation.*wind.*misfire/i);
    expect(question("safety-flare4").explanation).toMatch(/vary by product.*exact markings/i);
    expect(question("safety-mob3").options[question("safety-mob3").correctAnswer]).toMatch(/horizontally or near-horizontally/i);
    expect(question("safety-mob3").explanation).toMatch(/collapse and cardiac arrest/i);
    expect(question("safety-mob3").explanation).not.toMatch(/acidic blood|rushes to the core/i);
  });

  it("states review assumptions without fabricating qualified approval", () => {
    expect(SAFETY_QUIZ_REVIEW_METADATA.sharedModels).toHaveLength(6);
    expect(SAFETY_QUIZ_REVIEW_METADATA.status).toMatch(/qualified-review-not-recorded/i);
    expect(SAFETY_QUIZ_REVIEW_METADATA.assumptions).toMatch(/manufacturer.*jurisdiction.*written result does not establish practical competence/i);
  });
});
