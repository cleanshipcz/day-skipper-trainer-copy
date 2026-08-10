import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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

  it("keeps the final panel inside the viewBox and outlines yellow topmarks for contrast", () => {
    const svg = readFileSync(`${process.cwd()}/public/images/pilotage/iala-region-a-marks.svg`, "utf8");
    expect(svg).toContain('viewBox="0 0 800 300"');
    expect(svg).toContain('data-panel="H" transform="translate(730 35)"');
    expect(svg).toMatch(/data-topmark-outline="special"[^>]+stroke="#111827"[^>]+stroke-width="16"/);
    expect(svg).toMatch(/data-topmark-outline="emergency-wreck"[^>]+stroke="#111827"[^>]+stroke-width="15"/);
  });

  it("keys the transit correction to a specific direction and explains the track geometry", () => {
    const correction = questions.find((item) => item.id === "pilotage-9");

    expect(correction).toBeDefined();
    expect(correction?.question).toMatch(/(?:heading|proceeding|steering).*(?:towards?|at) (?:the )?(?:leading )?marks/i);
    expect(correction?.question).toMatch(/(?:approximately|roughly|substantially).*(?:along|parallel to).*(?:intended )?(?:leading[- ]line|track|course)/i);
    expect(correction?.question).toMatch(/rear mark.*left.*front mark/i);

    const keyedOption = correction?.options[correction.correctAnswer] ?? "";
    const starboardDirection = /\b(?:starboard|right(?:ward|wards)?)\b/i;
    expect(keyedOption).toMatch(starboardDirection);
    expect(keyedOption).not.toMatch(/towards?.*(line|alignment)|restores? .*alignment/i);
    expect(correction?.options.filter((option) => starboardDirection.test(option))).toEqual([keyedOption]);

    expect(correction?.explanation).toMatch(/rear(?: mark)?[- ]left.*(?:vessel|boat).*(?:left|port) of (?:the )?(?:track|line)/i);
    expect(correction?.explanation).toMatch(/(?:starboard|right(?:ward|wards)?).*(?:back )?towards? (?:the )?(?:leading )?line/i);
  });
});
