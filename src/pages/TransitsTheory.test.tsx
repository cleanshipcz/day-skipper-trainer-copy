/**
 * Tests for the TransitsTheory page.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2, AC-1, AC-4
 *
 * AC-1: Route /pilotage/transits renders theory covering:
 *       what a transit is, how leading lines guide approach,
 *       natural vs charted transits, maintaining a transit,
 *       clearing transits.
 * AC-4: Completing theory marks pilotage-transits as complete; points awarded.
 */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

// Mock the progress hook so the page renders without Supabase
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: vi.fn().mockResolvedValue({ pointsAwarded: false, completionAwarded: false }),
  }),
}));

// Must import after mocks
const { default: TransitsTheory } = await import("./TransitsTheory");

describe("TransitsTheory", () => {
  const renderPage = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={["/pilotage/transits"]}>
        <TransitsTheory />
      </MemoryRouter>,
    );

  it("should render the page title", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Transits &amp; Leading Lines");
  });

  it("should cover what a transit is (AC-1)", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("What is a Transit");
  });

  it("should cover how leading lines guide approach (AC-1)", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Leading Lines");
  });

  it("should cover natural vs charted transits (AC-1)", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Natural");
    expect(html).toContain("Charted");
  });

  it("should cover maintaining a transit (AC-1)", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Maintaining a Transit");
  });

  it("labels both off-track observer views and corrections correctly", () => {
    const html = renderPage();

    expect(html).toContain("LEFT OF LINE");
    expect(html).toContain("rear appears left");
    expect(html).toContain("You are left of the line — alter course to starboard");
    expect(html).toContain("RIGHT OF LINE");
    expect(html).toContain("rear appears right");
    expect(html).toContain("You are right of the line — alter course to port");
    expect(html).toContain("Observer view of transit mark alignment");
  });

  it("should cover clearing transits (AC-1)", () => {
    // when
    const html = renderPage();

    // then
    expect(html).toContain("Clearing Transit");
  });

  it("qualifies alignment and clearing-line safety", () => {
    const html = renderPage();

    expect(html).toContain("not necessarily in safe water");
    expect(html).toContain("south of the line as the safe");
    expect(html).toContain("Alignment is the limit");
    expect(html).toContain("Open</strong> only describes separation");
    expect(html).toContain("largest-scale current official chart");
    expect(html).toContain("List of Lights");
    expect(html).toContain("Training sketches are not navigation data");
  });

  it("cites current authoritative publication and update sources", () => {
    const html = renderPage();

    expect(html).toContain("MCA MGN 610");
    expect(html).toContain("UKHO ADMIRALTY general publications");
    expect(html).toContain("UKHO ADMIRALTY Notices to Mariners");
  });

  it("should render a Complete Module button (AC-4)", () => {
    // when
    const html = renderPage();

    // then
    // - button text depends on canComplete state; initially should prompt to read
    expect(html).toContain("Scroll through module to complete");
  });

  it("should include the TransitExercise interactive component (AC-2)", () => {
    // when
    const html = renderPage();

    // then
    // - the exercise should be embedded in the theory page
    expect(html).toContain("Exercise");
    expect(html).toContain("Check Alignment");
  });

  it("should render a back navigation button to pilotage menu", () => {
    // when
    const html = renderPage();

    // then
    // - should have a back arrow/button
    expect(html).toContain("Pilotage");
  });
});
