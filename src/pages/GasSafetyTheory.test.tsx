/**
 * Tests for the GasSafetyTheory page component.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1, AC-2, AC-3
 */
import { describe, expect, it, vi } from "vitest";

// Mock useProgress to avoid Supabase + auth context dependency chain
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: vi.fn(),
    loadProgress: vi.fn().mockResolvedValue(null),
    resetProgress: vi.fn(),
  }),
}));

// Mock react-router-dom to avoid needing a Router context
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("GasSafetyTheory", () => {
  it("should export a default component", async () => {
    // given
    const mod = await import("./GasSafetyTheory");

    // then
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("should render theory content covering all required gas safety areas", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    // - page title
    expect(html).toContain("Gas Safety");
    // - LPG properties tab content
    expect(html).toContain("LPG");
    // - isolation valves tab
    expect(html).toContain("Valves");
    // - bilge sniff test tab
    expect(html).toContain("Sniff Test");
    // - gas locker tab
    expect(html).toContain("Locker");
    // - carbon monoxide tab
    expect(html).toContain("CO");
    // - detector placement tab
    expect(html).toContain("Detectors");
  });

  it("should render the Mark as Complete button", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    expect(html).toContain("Mark as Complete");
  });

  it("should render a back navigation button to the safety menu", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    expect(html).toContain("Back to Safety Menu");
  });

  it("should render the first topic (LPG Properties) content by default", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    // - default tab shows LPG properties content
    expect(html).toContain("LPG Properties");
    expect(html).toContain("heavier than air");
  });
});
