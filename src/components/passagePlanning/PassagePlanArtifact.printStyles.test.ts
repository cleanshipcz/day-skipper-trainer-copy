import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

describe("passage plan artifact print enforcement",()=>{
  it("replaces every unapproved artifact with its blocked notice at print time",()=>{
    expect(css).toMatch(/@media print[\s\S]*\.passage-plan-artifact\.is-watermarked \.artifact-print-content[\s\S]*display:\s*none !important/);
    expect(css).toMatch(/\.passage-plan-artifact\.is-watermarked \.artifact-print-blocked\s*{\s*display:\s*block/);
    expect(css).toMatch(/\.artifact-print-blocked h2\s*{\s*font-size:\s*24pt/);
  });

  it("keeps multipage route headings and rows print-safe",()=>{
    expect(css).toMatch(/\.passage-plan-artifact thead\s*{\s*display:\s*table-header-group/);
    expect(css).toMatch(/\.passage-plan-artifact tr, \.artifact-signatures\s*{[\s\S]*break-inside:\s*avoid/);
  });
});
