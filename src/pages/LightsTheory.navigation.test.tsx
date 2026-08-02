import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LightsTheory from "./LightsTheory";

const markSectionVisited = vi.fn().mockResolvedValue(undefined);
const scrollIntoView = vi.fn();

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: () => ({ canComplete: false, markCompleted: vi.fn(), markSectionVisited }),
}));

describe("LightsTheory remediation navigation", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    markSectionVisited.mockClear();
    scrollIntoView.mockClear();
  });

  it("opens and focuses the requested sound-rule section", async () => {
    render(<MemoryRouter initialEntries={["/rules/lights/theory?section=sounds#rule-35"]}><LightsTheory /></MemoryRouter>);
    const heading = await screen.findByRole("heading", { name: "Restricted Visibility (Rule 35)" });
    const target = heading.closest("div[id='rule-35']");
    expect(screen.getByRole("tab", { name: "Sounds" }).getAttribute("data-state")).toBe("active");
    expect(markSectionVisited).toHaveBeenCalledWith("sounds");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(document.activeElement).toBe(target);
  });

  it("mounts and focuses cr19's Rule 30 anchor-day-shape target", async () => {
    render(<MemoryRouter initialEntries={["/rules/lights/theory?section=shapes#rule-30"]}><LightsTheory /></MemoryRouter>);
    const heading = await screen.findByRole("heading", { name: "Ball" });
    const target = heading.closest("div[id='rule-30']");
    expect(target).not.toBeNull();
    expect(screen.getByRole("tab", { name: "Shapes" }).getAttribute("data-state")).toBe("active");
    expect(markSectionVisited).toHaveBeenCalledWith("shapes");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(document.activeElement).toBe(target);
  });

  it("falls back to Lights for an unknown section", async () => {
    render(<MemoryRouter initialEntries={["/rules/lights/theory?section=unknown"]}><LightsTheory /></MemoryRouter>);
    expect((await screen.findByRole("tab", { name: "Lights" })).getAttribute("data-state")).toBe("active");
  });
});
