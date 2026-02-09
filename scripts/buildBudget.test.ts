import { describe, expect, it } from "vitest";
import { evaluateBuildBudget } from "./build-budget-core.mjs";

describe("evaluateBuildBudget", () => {
  it("fails when no entry chunk exists", () => {
    const result = evaluateBuildBudget([], { maxEntryChunkBytes: 1000, minHeadroomBytes: 100 });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing-entry-chunk");
  });

  it("fails when entry chunk exceeds max size", () => {
    const result = evaluateBuildBudget([{ file: "index-a.js", size: 1001 }], {
      maxEntryChunkBytes: 1000,
      minHeadroomBytes: 100,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("over-max");
  });

  it("fails when headroom is below minimum", () => {
    const result = evaluateBuildBudget([{ file: "index-a.js", size: 995 }], {
      maxEntryChunkBytes: 1000,
      minHeadroomBytes: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("headroom-too-small");
  });

  it("passes when max size and minimum headroom constraints are both satisfied", () => {
    const result = evaluateBuildBudget([{ file: "index-a.js", size: 980 }], {
      maxEntryChunkBytes: 1000,
      minHeadroomBytes: 10,
    });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe("ok");
  });
});
