import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgress: vi.fn().mockResolvedValue(null), saveProgress: vi.fn() }) }));
const { default: PrepareTheory } = await import("./PrepareTheory");
const { prepareSteps } = await import("@/data/prepareSteps");
const renderPage = () => renderToStaticMarkup(<MemoryRouter><PrepareTheory /></MemoryRouter>);

describe("PrepareTheory", () => {
  it("frames PREPARE and maps the authoritative stages", () => {
    const html = renderPage();
    expect(html).toContain("app memory aid");
    expect(html).toContain("not an authoritative framework");
    for (const stage of ["appraisal", "detailed planning", "execution", "monitoring"]) expect(html).toContain(stage);
  });
  it("distinguishes law, official guidance and good practice", () => {
    const content = prepareSteps.flatMap((step) => step.considerations).join(" ");
    expect(content).toContain("UK legal baseline");
    expect(content).toContain("Official guidance");
    expect(content).toContain("Good practice");
  });

  it("covers Day Skipper factors in the PREPARE checks", () => {
    const content = JSON.stringify(prepareSteps);
    for (const factor of ["crew", "draught", "forecasts", "tidal heights", "fuel", "VHF", "clearing bearings", "course to steer", "abort", "Man overboard", "cross-track error"]) expect(content).toContain(factor);
  });
  it("contains a calculated berth-to-berth example and operational limits", () => {
    const html = renderPage();
    for (const text of ["Worked berth-to-berth", "4 h 48 min", "2.3 m", "30% reserve", "Contingencies", "Brief, execute and monitor"]) expect(html).toContain(text);
  });
  it("cites authoritative current sources and update checks", () => {
    const html = renderPage();
    expect(html).toContain("IMO Resolution A.893(21)");
    expect(html).toContain("MCA MGN 610 (M+F) Amendment 1");
    expect(html).toContain("RYA passage planning guidance");
    expect(html).toContain("Notices to Mariners");
    expect(html).toContain("Check edition, update date, area and validity");
  });
});
