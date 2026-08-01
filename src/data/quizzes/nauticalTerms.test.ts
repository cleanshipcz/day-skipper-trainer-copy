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

  it("keeps configuration-dependent terms precise and every question single-answer", () => {
    const byId = new Map(nauticalTermsQuestions.map((question) => [question.id, question]));

    expect(byId.get("nt-stern")).toMatchObject({
      question: "What is the rear end of a boat called?",
      options: ["Keel", "Stern", "Beam", "Bow"],
      correctAnswer: 1,
    });
    expect(byId.get("nt-keel")?.explanation).toContain("Some keels contain ballast");
    expect(byId.get("nt-boom")?.explanation).toContain("may be loose-footed");
    expect(byId.get("nt-mainsail")?.question).toContain("luff set on or next to the main mast");
    expect(byId.get("nt-forestay")?.question).toBe("Which standing rigging provides forward support for a mast?");
    expect(byId.get("nt-backstay")?.question).toBe("Which rigging primarily provides aft support for a mast?");

    for (const question of nauticalTermsQuestions) {
      expect(question.options).toHaveLength(4);
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThan(question.options.length);
      expect(new Set(question.options).size).toBe(question.options.length);
    }
  });
});
