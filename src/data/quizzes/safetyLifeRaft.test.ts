import { describe, expect, it } from "vitest";
import questions, { LIFE_RAFT_QUIZ_OUTCOME_MAP, LIFE_RAFT_QUIZ_PASS_POLICY, LIFE_RAFT_QUIZ_REVIEW_METADATA } from "./safetyLifeRaft";
import { LIFE_RAFT_RELEASE_REVIEW, LIFE_RAFT_REVIEW_BASIS, actionsInRaftSteps, boardingProcedureSteps, deploymentProcedureSteps, isLifeRaftReleaseApproved, lifeRaftTypes, solasPackContents } from "../lifeRaftProcedures";

describe("life-raft assessment", () => {
  it("uses stable applied questions with traceable remediation", () => {
    expect(questions).toHaveLength(12);
    expect(new Set(questions.map((question) => question.id)).size).toBe(12);
    for (const question of questions) {
      expect(question.id).toMatch(/-v3$/);
      expect(question.learningObjective).toBeTruthy();
      expect(question.prerequisite).toMatch(/qualified-review-gated/i);
      expect(question.remediationRoute).toBe("/safety/life-raft");
      expect(question.options).toHaveLength(4);
      expect(question.explanation.length).toBeGreaterThan(300);
      expect(question.explanation).toMatch(/review/i);
      expect(question.explanation).toMatch(/Source\/review basis:/);
      expect(question.explanation).toMatch(/qualified approval remains pending|approval remains unrecorded|no approval evidence has been fabricated/i);
    }
  });
  it("maps every stable question exactly once across the required survival outcomes", () => {
    const ids = questions.map(({ id }) => id);
    expect(Object.values(LIFE_RAFT_QUIZ_OUTCOME_MAP).flat().sort()).toEqual([...ids].sort());
    expect(Object.keys(LIFE_RAFT_QUIZ_OUTCOME_MAP)).toEqual(expect.arrayContaining(["selection-markings-service", "pack-grab-bag-roles", "deployment-painter-hru-inversion", "dry-boarding-casualty-accounting", "attached-versus-clear", "communications-signals", "exposure-first-aid-repair", "rationing-medical-exceptions", "assessment-limits"]));
  });
  it("consumes the reviewed equipment and procedure model and preserves its release gate", () => {
    expect(lifeRaftTypes.map(({ id }) => id)).toEqual(expect.arrayContaining(["iso-9650-1", "iso-9650-2", "open-reversible"]));
    expect(solasPackContents.map(({ id }) => id)).toEqual(expect.arrayContaining(["inventory", "water-food", "repair", "signalling", "medical"]));
    expect(deploymentProcedureSteps.map(({ id }) => id)).toEqual(expect.arrayContaining(["secure", "inflate", "inspect"]));
    expect(boardingProcedureSteps.map(({ id }) => id)).toEqual(expect.arrayContaining(["dry", "assist", "account", "release"]));
    expect(actionsInRaftSteps.map(({ id }) => id)).toEqual(expect.arrayContaining(["account", "dry", "inspect", "inventory", "signal"]));
    expect(LIFE_RAFT_QUIZ_REVIEW_METADATA.sourceBasis).toEqual(LIFE_RAFT_REVIEW_BASIS);
    expect(LIFE_RAFT_QUIZ_REVIEW_METADATA.status).toBe("release-blocked-pending-qualified-review");
    expect(isLifeRaftReleaseApproved(LIFE_RAFT_RELEASE_REVIEW)).toBe(false);
  });
  it("states a truthful written-scenario pass claim", () => {
    expect(LIFE_RAFT_QUIZ_PASS_POLICY.passingPercentage).toBe(70);
    expect(LIFE_RAFT_QUIZ_PASS_POLICY.claim).toMatch(/written.*scenarios only/i);
    expect(LIFE_RAFT_QUIZ_PASS_POLICY.claim).toMatch(/not survival-craft competence/i);
  });
  it("rejects the superseded unsafe absolutes", () => {
    const content = JSON.stringify(questions);
    expect(content).not.toMatch(/no food or water for the first 24 hours|strongest person boards first|launch from the leeward side|full SOLAS B equipment pack.*extended ocean survival|remain attached regardless|annual service for every raft/i);
  });
});
