import { describe, expect, it } from "vitest";
import { LIFE_RAFT_RELEASE_REVIEW, LIFE_RAFT_REVIEW_BASIS, actionsInRaftSteps, boardingProcedureSteps, deploymentProcedureSteps, isLifeRaftReleaseApproved, lifeRaftTypes, solasPackContents } from "./lifeRaftProcedures";

describe("life-raft safety guidance", () => {
  it("fails release closed until complete qualified review evidence exists", () => {
    expect(isLifeRaftReleaseApproved(LIFE_RAFT_RELEASE_REVIEW)).toBe(false);
    const approved = { reviewed: true, reviewerName: "Survival craft reviewer", reviewerQualification: "Qualified marine survival-craft specialist", approvalDate: "2026-08-12", sourceEvidence: [...LIFE_RAFT_REVIEW_BASIS] };
    expect(isLifeRaftReleaseApproved(approved)).toBe(true);
    expect(isLifeRaftReleaseApproved({ ...approved, reviewerQualification: " " })).toBe(false);
    expect(isLifeRaftReleaseApproved({ ...approved, approvalDate: "2026-02-31" })).toBe(false);
    expect(isLifeRaftReleaseApproved({ ...approved, sourceEvidence: approved.sourceEvidence.slice(1) })).toBe(false);
  });
  it("preserves critical limitations instead of unsafe universal rules", () => {
    const content = JSON.stringify({ lifeRaftTypes, solasPackContents, deploymentProcedureSteps, boardingProcedureSteps, actionsInRaftSteps });
    expect(content).toMatch(/no universal person/i);
    expect(content).toMatch(/never drink seawater/i);
    expect(content).toMatch(/wind, sea, list, fire, obstructions/i);
    expect(content).toMatch(/certificate.*manual.*service label/i);
    expect(content).not.toMatch(/within 3 nautical miles|must be serviced annually|no food or water for the first 24 hours|strongest person boards first/i);
  });
});
