import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sailControls } from "@/data/sailControls";

const source = readFileSync(`${process.cwd()}/src/components/SailControlsDiagram.tsx`, "utf8");
const plate = readFileSync(`${process.cwd()}/public/images/sail-controls/cruising-sloop-controls.png`);

describe("Sail Controls yacht diagram contract", () => {
  it("keeps one keyboard control and touch target for every catalogue item", () => {
    const controls = [...source.matchAll(/id: "([^"]+)", name:/g)].map((match) => match[1]);
    const ids = sailControls.map((control) => control.id);
    expect(controls).toEqual(ids);
    expect(source).toContain("data-touch-target={control.id}");
    expect(source).toContain('data-hit-polygons={control.hitPolygons.join("|")}');
    expect(source).not.toContain("{...control.target}");
    expect(source).toContain("data-control-artwork={control.id}");
    expect(source).toContain('data-pointer-exclusion="presentation outside owned hotspot"');
    expect(source.match(/pointerEvents="none"/g)).toHaveLength(3);
    expect(source).toContain('event.key === "Enter" || event.key === " "');
  });

  it("uses a full-resolution generated raster plate without embedded diagram text", () => {
    expect(source).toContain('viewBox="0 0 600 700"');
    expect(source).toContain('href="/images/sail-controls/cruising-sloop-controls.png"');
    expect(source).not.toContain("<text");
    expect(plate.subarray(1, 4).toString()).toBe("PNG");
    expect(plate.readUInt32BE(16)).toBe(1163);
    expect(plate.readUInt32BE(20)).toBe(1352);
  });

  it("keeps the overlays separate from the artwork and label-free", () => {
    expect(source).toContain("overlays.map");
    expect(source).toContain("fill=\"transparent\"");
    expect(source).toContain("aria-label");
    expect(source).not.toMatch(/<text|labelled control/);
  });
});
