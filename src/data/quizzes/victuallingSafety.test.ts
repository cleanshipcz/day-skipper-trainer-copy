import { describe, expect, it } from "vitest";
import victuallingQuestions from "./victualling";

describe("Victualling safety assessment", () => {
  it("uses hazard elimination and engineered controls instead of ordinary oilskins for scalds", () => {
    const scaldQuestion = victuallingQuestions.find(({ id }) => id === "v18");

    expect(scaldQuestion).toBeDefined();
    expect(scaldQuestion?.options[scaldQuestion.correctAnswer]).toMatch(/Stop unsafe cooking.*lids.*restraints.*locks.*handholds.*keep people clear/i);
    expect(scaldQuestion?.explanation).toMatch(/Ordinary oilskins are not scald PPE/i);
    expect(scaldQuestion?.explanation).toMatch(/manufacturer-rated protective equipment/i);
  });
});
