import { describe, expect, it } from "vitest";
import { resolveModuleMeta } from "./moduleMenuMeta";

describe("resolveModuleMeta", () => {
  it("returns default badge and button labels by module type", () => {
    expect(resolveModuleMeta({ type: "learn" })).toEqual({ badgeLabel: "Learn", buttonLabel: "Start Learning" });
    expect(resolveModuleMeta({ type: "quiz" })).toEqual({ badgeLabel: "Quiz", buttonLabel: "Take Quiz" });
    expect(resolveModuleMeta({ type: "practice" })).toEqual({ badgeLabel: "Practice", buttonLabel: "Start Practice" });
  });

  it("allows per-module overrides", () => {
    expect(resolveModuleMeta({ type: "quiz", badgeLabel: "Assessment", buttonLabel: "Start Assessment" })).toEqual({
      badgeLabel: "Assessment",
      buttonLabel: "Start Assessment",
    });
  });
});
