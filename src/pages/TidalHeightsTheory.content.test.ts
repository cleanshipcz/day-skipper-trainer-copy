import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(`${process.cwd()}/src/pages/TidalHeightsTheory.tsx`, "utf8");

describe("tidal heights theory content contract", () => {
  it("retains the publication workflow and both solution directions", () => {
    expect(source).toContain("Height at time:");
    expect(source).toContain("Time for height:");
    expect(source).toContain("both adjacent limbs");
    expect(source).toContain("(+1 day)");
  });

  it("retains operational datum, approximation and uncertainty boundaries", () => {
    expect(source).toContain("drying height");
    expect(source).toContain("air draught");
    expect(source).toContain("1, 2, 3, 3, 2, 1");
    expect(source).toContain("does not reproduce a named port's official curve");
    expect(source).toContain("current gauge/harbour observations");
  });

  it("requires meaningful checks in both calculation directions", () => {
    expect(source).toContain('heightAnswer === "3.9" && timeAnswer === "both"');
    expect(source).toContain('evidenceId="two-direction-curve-checks"');
  });
});
