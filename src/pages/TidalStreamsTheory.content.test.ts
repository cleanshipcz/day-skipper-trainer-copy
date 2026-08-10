import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(`${process.cwd()}/src/pages/TidalStreamsTheory.tsx`, "utf8");

describe("tidal streams theory content contract", () => {
  it("keeps the complete internally consistent worked construction", () => {
    expect(source).toContain("set 180°T, rate 2.0 kn");
    expect(source).toContain("√(6² − 2²) = 5.657 NM");
    expect(source).toContain("070.5°T");
    expect(source).toContain("5.7 kn");
    expect(source).toContain("1300");
    expect(source).toContain("1 cm = 1 NM");
  });

  it("retains reference, rounding, changing-stream and feasibility boundaries", () => {
    expect(source).toContain("067°T + 3° =");
    expect(source).toContain("070°M − 2° =");
    expect(source).toContain("358° + 5°");
    expect(source).toContain("Net drift is 0.5 NM south");
    expect(source).toContain("No CTS exists");
    expect(source).toContain("Invented teaching data only");
  });

  it("requires explanatory readiness evidence before opening the tool", () => {
    expect(source).toContain('evidenceId="chart-ready-cts-check"');
    expect(source).toContain("disabled={!readinessPassed}");
    expect(source).toContain("Measure T→G");
    expect(source).toContain('role="status"');
  });

  it("provides an accessible diagram and equivalent structured record", () => {
    expect(source).toContain('aria-labelledby="cts-diagram-title cts-diagram-desc"');
    expect(source).toContain("Structured record matching the diagram");
    expect(source).not.toContain("Diagram Placeholder");
  });
});
