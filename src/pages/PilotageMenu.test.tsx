/**
 * Tests for the PilotageMenu page.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2
 */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

// Mock progress loading
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: vi.fn(),
  }),
}));

const { default: PilotageMenu } = await import("./PilotageMenu");

describe("PilotageMenu", () => {
  const renderPage = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={["/pilotage"]}>
        <PilotageMenu />
      </MemoryRouter>,
    );

  it("should render the Pilotage module title", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Pilotage");
  });

  it("should display the Transits & Leading Lines sub-module", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Transits");
    expect(html).toContain("Leading Lines");
  });

  it("should render the Transits sub-module card with a start button", () => {
    // when
    const html = renderPage();

    // then
    // - the module card renders a CTA button for the sub-module
    expect(html).toContain("Start Learning");
  });
});
