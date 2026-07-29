import { describe, expect, it } from "vitest";
import { canonicalQuizProgressKey, resolveQuizProgressForLoad } from "./progressKeys";

describe("quiz progress keying", () => {
  const progress = (topic_id: string) => ({
    topic_id,
    score: 0,
    answers_history: null,
    completed: false,
  });
  it("uses canonical quiz-prefixed key", () => {
    expect(canonicalQuizProgressKey("colregs")).toBe("quiz-colregs");
  });

  it("falls back to legacy key and marks migration when canonical is missing", () => {
    const result = resolveQuizProgressForLoad("engine", null, progress("engine"));

    expect(result.record?.topic_id).toBe("engine");
    expect(result.shouldMigrateFromLegacy).toBe(true);
  });

  it("prefers canonical key when present", () => {
    const result = resolveQuizProgressForLoad(
      "engine",
      progress("quiz-engine"),
      progress("engine")
    );

    expect(result.record?.topic_id).toBe("quiz-engine");
    expect(result.shouldMigrateFromLegacy).toBe(false);
  });
});
