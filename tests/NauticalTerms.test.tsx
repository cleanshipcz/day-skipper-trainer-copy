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

  it("moves focus into the answer panel and restores it on close", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    marker.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /marker 1, guessing/i }).getAttribute("data-marker-state")).toBe(
      "guessing"
    );

    await user.click(screen.getByRole("button", { name: /close answer choices/i }));
    expect(marker).toBe(document.activeElement);
    expect(screen.getByRole("button", { name: /marker 1, undiscovered/i })).toBeTruthy();
  });

  it("supports Space and exposes wrong and correct outcomes with progress updates", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <NauticalTerms />
      </TestRouter>
    );

    const marker = screen.getByRole("button", { name: /marker 1, undiscovered/i });
    marker.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("heading", { name: /what is this part/i })).toBe(document.activeElement);

    const answerButtons = screen.getAllByRole("button").filter((button) =>
      ["Bow", "Stern", "Hull", "Deck", "Mast", "Boom", "Mainsail", "Jib", "Forestay", "Backstay", "Rudder", "Tiller", "Keel", "Cockpit", "Telltales"].includes(
        button.textContent ?? ""
      )
    );
    const wrongAnswer = answerButtons.find((button) => button.textContent !== "Bow");
    expect(wrongAnswer).toBeTruthy();
    await user.click(wrongAnswer!);

    expect(screen.getByRole("button", { name: /marker 1, wrong, selected for another guess/i })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Bow" }));

    expect(screen.getByRole("button", { name: /marker 1, correct/i })).toBe(document.activeElement);
    const progress = screen.getByRole("progressbar", { name: /boat parts identified/i });
    expect(progress.getAttribute("aria-valuenow")).toBe("1");
    expect(progress.getAttribute("aria-valuemax")).toBe("20");
    expect(progress.getAttribute("aria-valuetext")).toBe("1 of 20 boat parts identified");
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
