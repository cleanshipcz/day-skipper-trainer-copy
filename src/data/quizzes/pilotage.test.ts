import { describe, expect, it } from "vitest";
import questions from "./pilotage";
import { validateQuizBank } from "./index";

describe("visual pilotage mastery bank", () => {
  it("keeps 20 valid questions balanced across all four learning leaves", () => {
    expect(validateQuizBank("pilotage", questions)).toBe(questions);
    expect(questions).toHaveLength(20);
    const counts = Object.fromEntries(["buoyage", "transits", "clearing-bearings", "plan-execution"].map((leaf) => [leaf, questions.filter((item) => item.leaf === leaf).length]));
    expect(counts).toEqual({ buoyage: 8, transits: 4, "clearing-bearings": 4, "plan-execution": 4 });
  });

  it("covers representative day/light families plus preferred-channel and new-danger rules", () => {
    const families = new Set(questions.map((item) => item.buoyFamily).filter(Boolean));
    for (const family of ["lateral", "preferred-channel", "cardinal", "isolated-danger", "safe-water", "special", "new-danger"]) expect(families.has(family), family).toBe(true);
    const buoyageText = JSON.stringify(questions.filter((item) => item.leaf === "buoyage"));
    expect(buoyageText).toMatch(/IALA Region A/i);
    expect(buoyageText).toMatch(/entering from seaward/i);
    expect(buoyageText).toMatch(/Fl\(2\+1\)/);
    expect(buoyageText).toMatch(/blue.*yellow.*new wreck/i);
    expect(buoyageText).toMatch(/duplicate identical marks.*racon.*D/i);
  });

  it("provides local visuals with meaningful observable descriptions that do not name the keyed mark", () => {
    const visual = questions.filter((item) => item.image);
    expect(visual.length).toBeGreaterThanOrEqual(7);
    for (const item of visual) {
      expect(item.image).toBe("/images/pilotage/iala-region-a-marks.svg");
      expect(item.imageAlt?.length).toBeGreaterThan(45);
      const answerName = item.buoyFamily?.replace("-", " ");
      if (answerName) expect(item.imageAlt?.toLowerCase()).not.toContain(`${answerName} mark`);
    }
  });
});
