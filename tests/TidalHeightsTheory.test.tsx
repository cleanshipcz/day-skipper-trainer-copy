import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TidalHeightsTheory from "@/pages/TidalHeightsTheory";

const progress = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    ownerId: "account-a",
    loadProgressDetailed: progress.load,
    saveProgressDetailed: progress.save,
    saveProgress: vi.fn(),
  }),
}));

const renderLesson = () =>
  render(
    <MemoryRouter>
      <TidalHeightsTheory />
    </MemoryRouter>,
  );

describe("Calculating Tidal Heights accessibility", () => {
  beforeEach(() => {
    localStorage.clear();
    progress.load
      .mockReset()
      .mockResolvedValue({ status: "missing", record: null });
    progress.save.mockReset().mockResolvedValue("remote");
  });

  it("provides named navigation, figure alternatives, and coherent calculation structures", async () => {
    renderLesson();
    expect(
      screen.getByRole("button", { name: "Back to Tides overview" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("figure").querySelector("figcaption")?.textContent,
    ).toMatch(/solid blue curve.*dashed green/i);
    expect(
      screen.getByRole("img", { name: /falling tidal curve/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("table", { name: /share of total range/i }),
    ).toBeTruthy();
    expect(screen.getByText(/Add charted depth 1.4 metres/)).toBeTruthy();
    expect(screen.getByText(/Sign convention/)).toBeTruthy();
  });

  it("supports calculation-check activation with visible keyboard focus styling", async () => {
    const user = userEvent.setup();
    renderLesson();
    const height = await screen.findByLabelText("3.9 m above CD");
    expect(height.closest("label")?.className).toContain("focus-within:ring-2");
    await user.click(height);
    expect(screen.getByText(/Correct — enter at 12:00/)).toBeTruthy();
    await user.click(screen.getByLabelText(/Adequate before 13:00/));
    expect(screen.getByText(/Correct — on the falling limb/)).toBeTruthy();
    await waitFor(() => expect(progress.save).toHaveBeenCalled());
  });

  it("uses responsive wrapping and touch-sized interactive controls", () => {
    renderLesson();
    expect(document.querySelector("header > div")?.className).toContain(
      "flex-col",
    );
    expect(document.querySelector("header > div")?.className).toContain(
      "sm:flex-row",
    );
    expect(
      screen.getByRole("button", { name: "Back to Tides overview" }).className,
    ).toContain("min-h-11");
    expect(
      screen.getByLabelText("3.9 m above CD").closest("label")?.className,
    ).toContain("min-h-11");
  });
});
