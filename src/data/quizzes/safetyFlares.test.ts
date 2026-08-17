import { describe, expect, it } from "vitest";
import questions, { FLARE_QUIZ_CATALOGUE_REVISION, FLARE_QUIZ_OUTCOME_MAP, FLARE_QUIZ_REVIEW_METADATA } from "./safetyFlares";

describe("review-gated flares quiz", () => {
  it("uses stable versioned identities with complete objective traceability", () => {
    expect(FLARE_QUIZ_CATALOGUE_REVISION).toBe("safety-flares-applied-v2");
    expect(new Set(questions.map(({ id }) => id)).size).toBe(questions.length);
    expect(questions.every(({ id }) => id.endsWith("-v2"))).toBe(true);
    expect(Object.values(FLARE_QUIZ_OUTCOME_MAP).flat().sort()).toEqual(questions.map(({ id }) => id).sort());
    expect(questions.every(({ learningObjective, prerequisite, remediationRoute }) => learningObjective && prerequisite && remediationRoute === "/safety/flares")).toBe(true);
    expect(new Set(questions.map(({ correctAnswer }) => correctAnswer)).size).toBeGreaterThan(1);
    for (const position of [0, 1, 2, 3]) {
      expect(questions.filter(({ correctAnswer }) => correctAnswer === position).length).toBeLessThan(questions.length * 0.5);
    }
  });

  it("keeps release approval fail-closed and cites the inherited source model", () => {
    expect(FLARE_QUIZ_REVIEW_METADATA.status).toBe("release-blocked-pending-qualified-maritime-review");
    expect(FLARE_QUIZ_REVIEW_METADATA.sourceBasis.length).toBeGreaterThan(0);
    expect(questions.every(({ explanation }) => /qualified maritime approval remains pending/i.test(explanation))).toBe(true);
  });

  it("removes universal duration and launch-angle claims and supplies a non-colour recognition equivalent", () => {
    const copy = questions.flatMap(({ question, options, explanation }) => [question, ...options, explanation]).join(" ");
    expect(copy).not.toMatch(/3-minute burn|60-second burn|always use 45/i);
    const recognition = questions.find(({ id }) => id === "flare-applied-labelled-recognition-v2")!;
    expect(recognition.scenario?.facts.map(({ label }) => label)).toEqual(["Form", "Printed signal", "Handling"]);
    expect(recognition.explanation).toMatch(/colour alone is not/i);
  });
});
