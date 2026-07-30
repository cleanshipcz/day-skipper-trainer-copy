import { describe, expect, it } from "vitest";
import { formatTypeMismatch } from "./type-mismatch-diagnostic.mjs";

describe("Supabase type mismatch diagnostic", () => {
  it("shows the complete generated file when it is within the hard cap", () => {
    const expected = Array.from({ length: 40 }, (_, index) => `expected ${index}`).join("\n");
    const actual = expected.replace("expected 8", "actual 8");
    const diagnostic = formatTypeMismatch(expected, actual);

    expect(diagnostic).toContain("Complete generated types (expected");
    expect(diagnostic).toContain("+    9 | expected 8");
    expect(diagnostic).toContain("-    9 | actual 8");
    expect(diagnostic).toContain("+   40 | expected 39");
  });

  it("falls back to a bounded mismatch window above 64 KiB", () => {
    const expected = Array.from({ length: 5_000 }, (_, index) => `expected ${index} ${"x".repeat(20)}`).join("\n");
    const actual = expected.replace("expected 8", "actual 8");
    const diagnostic = formatTypeMismatch(expected, actual);

    expect(diagnostic).toContain("Generated types (expected, first mismatch window):");
    expect(diagnostic).toContain("+    9 | expected 8");
    expect(diagnostic).not.toContain("expected 4999");
  });

  it("accounts for line-number prefixes in the final 64 KiB limit", () => {
    const expected = Array.from({ length: 7_000 }, () => "x").join("\n");
    const diagnostic = formatTypeMismatch(expected, expected.replace(/^x$/m, "y"));

    expect(diagnostic).toContain("first mismatch window");
    expect(Buffer.byteLength(diagnostic, "utf8")).toBeLessThanOrEqual(64 * 1024);
  });

  it("bounds the final diagnostic for multibyte generated content", () => {
    const expected = Array.from({ length: 1_000 }, () => "⛵".repeat(100)).join("\n");
    const diagnostic = formatTypeMismatch(expected, expected.replace("⛵", "⚓"));

    expect(diagnostic).toContain("first mismatch window");
    expect(Buffer.byteLength(diagnostic, "utf8")).toBeLessThanOrEqual(64 * 1024);
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
