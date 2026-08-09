import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(`${process.cwd()}/src/pages/ColregTheory.tsx`, "utf8");
const ruleSource = (number: number) => source.split(`{ rule: ${number},`)[1].split("] },")[0];

describe("COLREG Part B rule content", () => {
  it("states the visibility boundary for Rules 5–10 and 12–18", () => {
    for (const number of [5, 6, 7, 8, 9, 10]) expect(ruleSource(number)).toMatch(/scope: "All vessels|scope: "All visibility/);
    for (const number of [12, 13, 14, 15, 16, 17]) expect(ruleSource(number)).toContain('scope: "Vessels in sight');
    expect(source).toContain('RULE_18_SCOPE = "Vessels in sight of one another"');
  });

  it("preserves both Rule 17 intervention stages and crossing proviso", () => {
    expect(ruleSource(17)).toMatch(/may act/i);
    expect(ruleSource(17)).toMatch(/must take/i);
    expect(ruleSource(17)).toMatch(/not alter to port/i);
    expect(ruleSource(17)).toMatch(/not relieved/i);
  });

  it("models Rule 18 as conditional responsibilities", () => {
    const responsibilities = source.split("export const RULE_18_DECISIONS = [")[1].split("];", 1)[0];
    expect(responsibilities).toMatch(/Rules 9, 10 and 13/);
    expect(responsibilities).toMatch(/constrained by her draught/i);
    expect(responsibilities).toMatch(/seaplane/i);
    expect(responsibilities).toMatch(/WIG craft/i);
    expect(responsibilities).not.toMatch(/highest priority|hierarchy/i);
  });

  it("gives the icon-only back control an accessible name", () => {
    expect(source).toContain('aria-label="Back to rules of the road"');
  });
});
