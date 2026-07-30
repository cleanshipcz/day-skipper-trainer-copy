import { describe, expect, it } from "vitest";
import { formatTypeMismatch } from "./type-mismatch-diagnostic.mjs";

describe("Supabase type mismatch diagnostic", () => {
  it("shows bounded, numbered context around the first mismatch", () => {
    const expected = Array.from({ length: 40 }, (_, index) => `expected ${index}`).join("\n");
    const actual = expected.replace("expected 8", "actual 8");
    const diagnostic = formatTypeMismatch(expected, actual);

    expect(diagnostic).toContain("Generated types (expected):");
    expect(diagnostic).toContain("+    9 | expected 8");
    expect(diagnostic).toContain("-    9 | actual 8");
    expect(diagnostic).not.toContain("expected 39");
  });

  it("redacts database URLs and token-shaped values", () => {
    const diagnostic = formatTypeMismatch(
      "postgresql://user:password@db.example/schema",
      "sb_secret_token_value_that_must_not_be_logged",
    );

    expect(diagnostic).toContain("[REDACTED]");
    expect(diagnostic).not.toContain("password");
    expect(diagnostic).not.toContain("sb_secret");
  });
});
