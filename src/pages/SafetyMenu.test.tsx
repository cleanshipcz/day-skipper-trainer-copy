import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import SafetyMenu from "./SafetyMenu";

vi.mock("@/components/CompletionBadge", () => ({
  CompletionBadge: () => null,
}));

const renderSafetyMenu = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <SafetyMenu />
    </MemoryRouter>,
  );

describe("SafetyMenu", () => {
  it("should render all 6 safety sub-module cards", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Man Overboard (MOB)");
    expect(html).toContain("Fire Safety");
    expect(html).toContain("Life Raft &amp; Abandon Ship");
    expect(html).toContain("Flares &amp; Pyrotechnics");
    expect(html).toContain("Personal Safety");
    expect(html).toContain("Gas Safety");
  });

  it("should render the Personal Safety sub-module with correct description", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Personal Safety");
    expect(html).toContain("Life jackets, harnesses, tethers, jacklines, and kill cords");
  });

  it("should render the Gas Safety sub-module with correct description", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Gas Safety");
    expect(html).toContain("LPG properties, isolation valves, carbon monoxide, and detector placement");
  });

  it("should render the page title and subtitle", () => {
    // given
    const html = renderSafetyMenu();

    // then
    expect(html).toContain("Safety Procedures");
    expect(html).toContain("Emergency protocols and drills");
  });
});
