import { describe, expect, it } from "vitest";
import { resolveModuleButtonLabel } from "./moduleMenuCta";

describe("resolveModuleButtonLabel", () => {
  it("uses module-specific button labels when no completion state is provided", () => {
    expect(resolveModuleButtonLabel({ defaultButtonLabel: "Take Quiz" })).toBe("Take Quiz");
  });

  it("keeps module-specific button labels for incomplete modules", () => {
    expect(resolveModuleButtonLabel({ defaultButtonLabel: "Start Practice", completion: { isCompleted: false } })).toBe(
      "Start Practice",
    );
  });

  it("switches to Review for completed modules", () => {
    expect(resolveModuleButtonLabel({ defaultButtonLabel: "Take Quiz", completion: { isCompleted: true, score: 80 } })).toBe(
      "Review",
    );
  });
});
