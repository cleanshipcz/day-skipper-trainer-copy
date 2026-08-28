import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sailControls } from "@/data/sailControls";

const source = readFileSync(`${process.cwd()}/src/components/SailControlsDiagram.tsx`, "utf8");

describe("Sail Controls yacht diagram contract", () => {
  it("keeps one keyboard control and touch target for every catalogue item", () => {
    const ids = sailControls.map((control) => control.id);
    ids.forEach((id) => expect(source).toMatch(new RegExp(`(?:"${id}"|${id}):`)));
    expect(source).toContain("sailControls.map");
    expect(source).toContain("data-touch-target={control.id}");
    expect(source).toContain("data-hit-center");
    expect(source).toContain('r="24"');
    expect(source).not.toContain("{...control.target}");
    expect(source).toContain("data-control-artwork={control.id}");
    expect(source).toContain("data-control-affordance={control.id}");
    expect(source).toMatch(/data-control-artwork=\{control\.id\}[^>]*pointerEvents="none"/);
    expect(source).toMatch(/data-control-affordance=\{control\.id\}[^>]*pointerEvents="none"/);
    expect(source).toContain('event.key === "Enter" || event.key === " "');
  });

  it("uses a responsive cutaway whose rig geometry remains readable", () => {
    expect(source).toContain('viewBox="0 0 900 600"');
    expect(source).toContain("Simplified cutaway keeps the rig geometry legible");
    expect(source).not.toContain("<image");
  });

  it("keeps the overlays separate from the base boat artwork", () => {
    expect(source).toContain("overlays.map");
    expect(source).toContain('fill="transparent" stroke="transparent"');
    expect(source).toContain("aria-label");
    expect(source).toContain("data-control-key={control.id}");
    expect(source).toContain("{control.keyNumber}");
    expect(source).toContain("data-pointer-exclusion");
  });

  it("uses explicit practical-size handles instead of overlapping path corridors", () => {
    expect(source).not.toContain("hitPolygons");
    expect(source).not.toContain("hitWidth");
    expect(source).toContain('handle: { x: 442, y: 300 }');
    expect(source).toContain('handle: { x: 458, y: 454 }');
    expect(source).toContain('handle: { x: 304, y: 443 }');
    expect(source).toContain('handle: { x: 340, y: 516 }');
    expect(source).toContain('path: "M430 52 L162 400", handle: { x: 300, y: 221 }');
    expect(source).toContain("focus-visible:");
  });
});
