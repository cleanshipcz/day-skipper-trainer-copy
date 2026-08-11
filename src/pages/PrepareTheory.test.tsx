import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgress: vi.fn().mockResolvedValue(null), saveProgress: vi.fn() }) }));
const { default: PrepareTheory } = await import("./PrepareTheory");
const { prepareSteps, prepareSupportingRoutes } = await import("@/data/prepareSteps");
const { appRoutes } = await import("@/app/routes");
const renderPage = () => renderToStaticMarkup(<MemoryRouter><PrepareTheory /></MemoryRouter>);

describe("PrepareTheory", () => {
  it("frames PREPARE and maps the authoritative stages", () => {
    const html = renderPage();
    expect(html).toContain("app memory aid");
    expect(html).toContain("not an authoritative framework");
    for (const stage of ["appraisal", "detailed planning", "execution", "monitoring"]) expect(html).toContain(stage);
  });
  it("represents transition and combined operational phases", () => {
    const revise = prepareSteps.find((step) => step.title === "Revise and brief");
    const execute = prepareSteps.find((step) => step.title === "Execute and monitor");
    expect(revise?.phases).toEqual(["Detailed planning", "Execution"]);
    expect(revise?.description).toContain("transitions into execution");
    expect(execute?.phases).toEqual(["Execution", "Monitoring"]);
    expect(execute?.phase).toBe("Execution + Monitoring");
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
  it("teaches risk-based position monitoring instead of a universal clock interval", () => {
    const html = renderPage();
    const monitoring = prepareSteps.find((step) => step.title === "Execute and monitor");
    const content = `${monitoring?.considerations.join(" ")} ${monitoring?.example}`;

    for (const factor of ["speed", "position uncertainty", "fixing method", "hazards", "traffic", "visibility", "tide", "pilotage", "decision point"]) expect(content).toContain(factor);
    for (const trigger of ["hazards", "gates", "alterations", "handovers", "deteriorate"]) expect(content).toContain(trigger);
    for (const comparison of ["position", "XTE", "SOG", "ETA", "depth", "conditions", "recorded"]) expect(content).toContain(comparison);
    expect(content).toContain("frequently or continuously");
    expect(content).toContain("confined pilotage");
    expect(content).toContain("lower-risk open water");
    expect(html).not.toMatch(/fix (?:every|hourly)|hourly (?:fix|position|monitor)/i);
  });
  it("cites authoritative current sources and update checks", () => {
    const html = renderPage();
    expect(html).toContain("IMO Resolution A.893(21)");
    expect(html).toContain("MCA MGN 610 (M+F) Amendment 1");
    expect(html).toContain("RYA passage planning guidance");
    expect(html).toContain("Notices to Mariners");
    expect(html).toContain("Check edition, update date, area and validity");
  });

  it("uses semantic links for the step-specific lessons and applied workflow", () => {
    const html = renderPage();
    expect(prepareSupportingRoutes["Passage appraisal"]).toContainEqual(expect.objectContaining({ label: "Marine Forecasts", route: "/weather/forecasts" }));
    expect(html).toContain('href="/passage-planning/builder"');
    expect(html).toContain('href="/passage-planning/checklist"');
    expect(html).toContain('href="/quiz/passage-planning"');
    expect(html).toContain(">Back to Passage Planning</a>");
    expect(html).not.toContain("See also:");
  });

  it("keeps every curated destination registered to prevent route drift and 404s", () => {
    const configuredPaths = appRoutes.map(({ path }) => path);
    const supportingPaths = Object.values(prepareSupportingRoutes).flatMap((links) => links.map(({ route }) => route));
    const workflowPaths = ["/passage-planning", "/passage-planning/builder", "/passage-planning/checklist", "/quiz/passage-planning"];
    const isRegistered = (route: string) => configuredPaths.includes(route) || (route.startsWith("/quiz/") && configuredPaths.includes("/quiz/:topicId"));

    expect(Object.keys(prepareSupportingRoutes)).toEqual(prepareSteps.map(({ title }) => title));
    expect([...supportingPaths, ...workflowPaths].every(isRegistered)).toBe(true);
  });
});
