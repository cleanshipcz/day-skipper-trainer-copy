import { describe, expect, it } from "vitest";
import { COLREG_RULES, RULE_18_DECISIONS } from "./ColregTheory";

const rule = (number: number) => COLREG_RULES.find(item => item.rule === number)!;
const text = (number: number) => rule(number).points.join(" ");

describe("COLREG Part B rule content", () => {
  it("states the visibility boundary for Rules 5–10 and 12–18", () => {
    for (const number of [5, 6, 7, 8, 9, 10]) expect(rule(number).scope).toMatch(/All vessels|All visibility/);
    for (const number of [12, 13, 14, 15, 16, 17]) expect(rule(number).scope).toContain("Vessels in sight");
  });

  it("preserves both Rule 17 intervention stages and crossing proviso", () => {
    expect(text(17)).toMatch(/may act/i);
    expect(text(17)).toMatch(/must take/i);
    expect(text(17)).toMatch(/not alter to port/i);
    expect(text(17)).toMatch(/not relieved/i);
  });

  it("models Rule 18 as conditional responsibilities", () => {
    const responsibilities = RULE_18_DECISIONS.join(" ");
    expect(responsibilities).toMatch(/Rules 9, 10 and 13/);
    expect(responsibilities).toMatch(/constrained by her draught/i);
    expect(responsibilities).toMatch(/seaplane/i);
    expect(responsibilities).toMatch(/WIG craft/i);
    expect(responsibilities).not.toMatch(/highest priority|hierarchy/i);
  });
});
