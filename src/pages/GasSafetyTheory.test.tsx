/**
 * Tests for the GasSafetyTheory page component.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1, AC-2, AC-3
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock useProgress to avoid Supabase + auth context dependency chain
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: vi.fn(),
    loadProgress: vi.fn().mockResolvedValue(null),
    resetProgress: vi.fn(),
  }),
}));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: null }) }));

// Mock react-router-dom to avoid needing a Router context
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
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
    // - gas leak warning and response tab
    expect(html).toContain("Leak Response");
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

  it("labels tabs descriptively, hides their icons and supports Radix arrow-key navigation", async () => {
    const user = userEvent.setup(); const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    const { container } = render(<GasSafetyTheory/>);
    const list = screen.getByRole("tablist", { name: "Gas safety lesson sections" });
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6); expect(tabs[0].getAttribute("aria-controls")).toBeTruthy();
    expect(container.querySelectorAll('[aria-hidden="true"]')).not.toHaveLength(0);
    tabs[0].focus(); await user.keyboard("{ArrowRight}"); expect(document.activeElement).toBe(tabs[1]);
    expect(list.className).toContain("grid-cols-2"); expect(tabs[0].className).toContain("min-h-11");
  });
});
