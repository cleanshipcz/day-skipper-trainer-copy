import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import TidalStreamsTheory from "./TidalStreamsTheory";

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: () => ({ canComplete: false, markCompleted: vi.fn(), markSectionVisited: vi.fn(), saveState: "idle", isHydrated: true, isCompletionDurable: false }),
}));

const renderLesson = () => render(<MemoryRouter><TidalStreamsTheory /></MemoryRouter>);

describe("chart-ready course-to-steer lesson", () => {
  it("explains a wrong answer and keeps this lesson's tool handoff disabled", () => {
    renderLesson();
    const handoff = screen.getByRole("button", { name: /Open Vector Solution Tool/i });
    expect(handoff.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByLabelText("090°T"));
    expect(screen.getByRole("status", { name: "Readiness feedback" }).textContent).toMatch(/ground track A→G.*Measure T→G/i);
    expect(handoff.hasAttribute("disabled")).toBe(true);
  });

  it("enables this lesson's handoff after the correct answer with explanatory feedback", () => {
    renderLesson();
    fireEvent.click(screen.getByLabelText("071°T"));
    expect(screen.getByRole("status", { name: "Readiness feedback" }).textContent).toMatch(/boat's direction through the water.*leeway/i);
    expect(screen.getByRole("button", { name: /Open Vector Solution Tool/i }).hasAttribute("disabled")).toBe(false);
  });

  it("exposes an accessible diagram, equivalent table, and calculated outputs", () => {
    renderLesson();
    const diagram = screen.getByRole("img", { name: /Course-to-steer vector triangle/i });
    expect(diagram.getAttribute("aria-labelledby")).toBe("cts-diagram-title cts-diagram-desc");
    expect(document.getElementById("cts-diagram-desc")?.textContent).toMatch(/071 degrees true.*5.7 nautical miles/i);
    expect(screen.getByRole("table", { name: "Structured record matching the diagram" }).textContent).toContain("070.5° → 071°");
    expect(document.body.textContent).toMatch(/5\.7 NM ÷ 5\.657 kn = 1\.008 h/i);
  });
});
