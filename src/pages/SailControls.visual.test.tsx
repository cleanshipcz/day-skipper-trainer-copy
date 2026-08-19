import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sailControls } from "@/data/sailControls";

const source = readFileSync(`${process.cwd()}/src/pages/SailControls.tsx`, "utf8");

describe("Sail Controls yacht diagram contract", () => {
  it("keeps one keyboard control and touch target for every catalogue item", () => {
    const controls = [...source.matchAll(/getDiagramControlProps\("([^"]+)"/g)].map((match) => match[1]);
    const targets = [...source.matchAll(/data-touch-target="([^"]+)"/g)].map((match) => match[1]);
    const ids = sailControls.map((control) => control.id);
    expect(controls).toEqual(ids);
    expect(targets).toEqual(ids);
    expect(source).toContain('event.key === "Enter" || event.key === " "');
  });

  it("retains fixed rig geometry while adding dimensional yacht rendering", () => {
    expect(source).toContain('viewBox="0 0 600 700"');
    expect(source).toContain('data-geometry="jib"');
    expect(source).toContain('data-geometry="forestay"');
    expect(source).toContain('id="skyGradient"');
    expect(source).toContain('id="seaGradient"');
    expect(source).toContain('id="hullGradient"');
    expect(source).toContain('id="boatShadow"');
    expect(source).toMatch(/>\s*MAST\s*<\/text>/);
    expect(source).toMatch(/>\s*BOOM\s*<\/text>/);
  });

  it("paints the opaque backdrop from dark-mode and forced-color tokens", () => {
    for (const token of ["sky-top", "sky-bottom", "sea-top", "sea-bottom", "coast"]) {
      expect(source).toContain(`[--diagram-${token}:`);
      expect(source).toContain(`dark:[--diagram-${token}:`);
      expect(source).toContain(`forced-colors:[--diagram-${token}:`);
      expect(source).toContain(`var(--diagram-${token})`);
    }
    expect(source).toMatch(/fill="url\(#skyGradient\)" className="forced-colors:fill-\[Canvas\]"/);
    expect(source).toMatch(/fill="url\(#seaGradient\)" className="forced-colors:fill-\[Canvas\]"/);
    expect(source).not.toMatch(/<rect x="0" y="0"[^>]+fill="#[0-9a-f]+"/i);
  });
});
