import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NauticalTerms from "../src/pages/NauticalTerms";
import TestRouter from "./TestRouter";

const saveProgressMock = vi.fn();
const loadProgressMock = vi.fn().mockResolvedValue(null);

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: saveProgressMock,
    loadProgress: loadProgressMock,
  }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NauticalTerms progress writes", () => {
  beforeEach(() => {
    saveProgressMock.mockClear();
    loadProgressMock.mockClear();
  });

  it("does not write completion for unrelated modules when resetting", async () => {
    const user = userEvent.setup();

    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const resetButtons = await screen.findAllByRole("button", { name: /reset/i });
    await user.click(resetButtons[0]);

    const forbiddenModules = new Set(["lights-theory", "colregs-theory"]);
    const wroteForbiddenModule = saveProgressMock.mock.calls.some(([module]) => forbiddenModules.has(module));

    expect(wroteForbiddenModule).toBe(false);
  });

  it("exposes marker instructions, state, progress, and icon-only control labels", async () => {
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    expect(screen.getByText(/use enter or space with a keyboard/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /back to nautical terms/i })).toBeTruthy();

    const markers = screen.getAllByRole("button", {
      name: /marker \d+, undiscovered\. activate to identify this boat part/i,
    });
    expect(markers).toHaveLength(20);
    expect(markers[0].getAttribute("tabindex")).toBe("0");
    expect(markers[0].getAttribute("data-marker-state")).toBe("undiscovered");

    expect(screen.getByRole("progressbar", { name: /boat parts identified/i }).getAttribute("aria-valuetext")).toBe(
      "0 of 20 boat parts identified"
    );
  });

  it("operates a marker with the keyboard and exposes guessing state", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    marker.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: /marker 1, guessing/i })).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /close answer choices/i })).toBeTruthy();
  });

  it("preserves mobile scale for 44px touch targets without covering the diagram", () => {
    const { container } = render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const markerHitAreas = container.querySelectorAll('[role="button"] > circle[r="28"]');
    expect(markerHitAreas).toHaveLength(20);
    markerHitAreas.forEach((hitArea) => expect(hitArea.getAttribute("fill")).toBe("transparent"));
    expect(container.querySelector('svg[viewBox="0 0 600 400"]')?.classList.contains("min-w-[550px]")).toBe(true);
    expect(container.querySelector('svg[viewBox="0 0 400 400"]')?.classList.contains("min-w-[400px]")).toBe(true);
  });
});
