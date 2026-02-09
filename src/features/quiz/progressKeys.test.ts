import { describe, expect, it } from "vitest";
import { canonicalQuizProgressKey, resolveQuizProgressForLoad } from "./progressKeys";

describe("quiz progress keying", () => {
  it("uses canonical quiz-prefixed key", () => {
    expect(canonicalQuizProgressKey("colregs")).toBe("quiz-colregs");
  });

  it("falls back to legacy key and marks migration when canonical is missing", () => {
    const result = resolveQuizProgressForLoad("engine", null, { topic_id: "engine" });

    expect(result.record?.topic_id).toBe("engine");
    expect(result.shouldMigrateFromLegacy).toBe(true);
  });

  it("prefers canonical key when present", () => {
    const result = resolveQuizProgressForLoad(
      "engine",
      { topic_id: "quiz-engine" },
      { topic_id: "engine" }
    );

    expect(result.record?.topic_id).toBe("quiz-engine");
    expect(result.shouldMigrateFromLegacy).toBe(false);
  });
});
