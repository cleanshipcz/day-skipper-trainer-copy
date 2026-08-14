import { describe, expect, it } from "vitest";
import { isMobTheoryReleaseApproved, type MobTheoryReleaseReview } from "./mobGuidance";

const valid: MobTheoryReleaseReview = {
  seamanshipReviewer: "Alex Sailor",
  seamanshipQualification: "Yachtmaster Instructor",
  medicalReviewer: "Morgan Medic",
  medicalQualification: "Registered emergency clinician",
  approvalDate: "2026-08-12",
  sourceEvidence: ["RYA MOB advisory", "MCA MGN 570", "Resuscitation Council UK 2025"],
};

describe("MOB theory release review", () => {
  it("accepts a complete, distinct and calendar-valid review", () => {
    expect(isMobTheoryReleaseApproved(valid)).toBe(true);
  });

  it("rejects one person filling both independent reviewer roles", () => {
    expect(isMobTheoryReleaseApproved({ ...valid, medicalReviewer: "  ALEX   SAILOR " })).toBe(false);
  });

  it("rejects duplicate evidence after whitespace and case normalization", () => {
    expect(isMobTheoryReleaseApproved({ ...valid, sourceEvidence: ["RYA MOB advisory", " rya   mob ADVISORY ", "MCA MGN 570"] })).toBe(false);
  });

  it.each(["2026-02-30", "2026-13-01", "2026-00-10", "2026-04-31"])("rejects impossible calendar date %s", (approvalDate) => {
    expect(isMobTheoryReleaseApproved({ ...valid, approvalDate })).toBe(false);
  });
});
