import { describe, expect, it } from "vitest";
import { sailControls } from "../sailControls";
import nauticalTermsQuestions, { nauticalTermsCoverage } from "./nauticalTerms";

describe("full nautical terms quiz coverage", () => {
  it("covers all 20 Boat Parts and all 12 Sail Controls exactly once", () => {
    expect(Object.keys(nauticalTermsCoverage.boatParts)).toHaveLength(20);
    expect(Object.keys(nauticalTermsCoverage.sailControls)).toHaveLength(12);
    expect(Object.keys(nauticalTermsCoverage.sailControls)).toEqual(sailControls.map(({ id }) => id));

    const mappedIds = [
      ...Object.values(nauticalTermsCoverage.boatParts),
      ...Object.values(nauticalTermsCoverage.sailControls),
    ];
    expect(new Set(mappedIds).size).toBe(32);
    expect(new Set(mappedIds)).toEqual(new Set(nauticalTermsQuestions.map(({ id }) => id)));
  });

  it("keeps stable, leaf-specific unique IDs", () => {
    expect(Object.values(nauticalTermsCoverage.boatParts).every((id) => id.startsWith("nt-") && !id.startsWith("nt-control-"))).toBe(true);
    expect(Object.values(nauticalTermsCoverage.sailControls).every((id) => id.startsWith("nt-control-"))).toBe(true);
  });
});
