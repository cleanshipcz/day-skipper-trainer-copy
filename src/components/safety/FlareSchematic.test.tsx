import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FLARE_IDS, type FlareId } from "@/data/flareTypes";
import { FlareSchematic } from "./FlareSchematic";

describe("FlareSchematic", () => {
  const ids = Object.values(FLARE_IDS) as FlareId[];
  it("provides a named, answer-safe accessible equivalent for every distinct plate", () => {
    const html = ids.map((id) => renderToStaticMarkup(<FlareSchematic id={id} label={`${id} recognition`} />));
    expect(new Set(html.map((markup) => markup.match(/data-purpose="([^"]+)/)?.[1])).size).toBe(5);
    for (const [index, markup] of html.entries()) {
      expect(markup).toContain(`data-schematic="${ids[index]}"`);
      expect(markup).toMatch(/data-form="[^"]+"/);
      expect(markup).toMatch(/data-pictogram="[^"]+"/);
      expect(markup).toContain("EXP 2029-06");
      expect(markup).toMatch(/(FIRING END|BURNING END|SMOKE OUTLET|OUTLET)/);
      expect(markup).toContain("READ");
      expect(markup).toContain("not this device’s date");
    }
  });

  it("distinguishes launcher, hand-light, hand-smoke and floating-smoke forms", () => {
    const combined = ids.map((id) => renderToStaticMarkup(<FlareSchematic id={id} label={id} />)).join(" ");
    for (const form of ["Long launcher", "Hand-held light", "Hand smoke", "Floating smoke"]) expect(combined).toContain(form);
    expect(combined).toContain("WATERLINE");
    expect(combined).toContain("GRIP ZONE");
  });
});
