import { describe, expect, it } from "vitest";
import questions from "./safetyLifeRaft";

describe("life-raft assessment", () => {
  it("uses stable applied questions with traceable remediation", () => {
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(10);
    for (const question of questions) {
      expect(question.id).toMatch(/-v2$/);
      expect(question.learningObjective).toBeTruthy();
      expect(question.prerequisite).toMatch(/qualified-review-gated/i);
      expect(question.remediationRoute).toBe("/safety/life-raft");
      expect(question.options).toHaveLength(4);
      expect(question.explanation).toMatch(/Review/);
    }
  });
  it("rejects the superseded unsafe absolutes", () => {
    const content = JSON.stringify(questions);
    expect(content).not.toMatch(/no food or water for the first 24 hours|strongest person boards first|launch from the leeward side|full SOLAS B equipment pack.*extended ocean survival/i);
  });
});
