import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/victualling";
import { WITHDRAWN_VICTUALLING_QUESTION_IDS, victuallingObjectiveByQuestion, victuallingQuizRemediationRoute } from "./learningPath";

describe("Victualling assessment learning path", () => {
  it("maps every retained objective and keeps withdrawn unsafe identities out", () => {
    expect(Object.keys(victuallingObjectiveByQuestion).sort()).toEqual(questions.map(({ id }) => id).sort());
    expect(questions.some(({ id }) => WITHDRAWN_VICTUALLING_QUESTION_IDS.includes(id as "v6" | "v12"))).toBe(false);
  });

  it("returns a failed attempt to its first missed objective", () => {
    expect(victuallingQuizRemediationRoute(["v1", "v17"], [1, 0], [1, 1]))
      .toBe("/victualling#victualling-traceability");
  });
});
