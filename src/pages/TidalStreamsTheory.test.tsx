import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("enables this lesson's handoff after a keyboard answer while preserving native radio focus", async () => {
    const user = userEvent.setup();
    renderLesson();
    const answer = screen.getByLabelText("071°T");
    answer.focus();
    await user.keyboard(" ");
    const feedback = screen.getByRole("status", { name: "Readiness feedback" });
    expect(feedback.textContent).toMatch(/boat's direction through the water.*leeway/i);
    expect(document.activeElement).toBe(answer);
    expect(screen.getByRole("button", { name: /Open Vector Solution Tool/i }).hasAttribute("disabled")).toBe(false);
  });

  it("exposes an accessible diagram, equivalent table, and calculated outputs", () => {
    renderLesson();
    const diagram = screen.getByRole("img", { name: /Course-to-steer vector triangle/i });
    expect(diagram.getAttribute("aria-labelledby")).toBe("cts-diagram-title cts-diagram-desc");
    expect(document.getElementById("cts-diagram-desc")?.textContent).toMatch(/071 degrees true.*5.7 nautical miles/i);
    const table = screen.getByRole("table", { name: /Structured record matching the diagram; line styles/i });
    expect(table.textContent).toContain("070.5° → 071°");
    expect(screen.getByRole("rowheader", { name: /dotted stream/i })).toBeTruthy();
    expect(diagram.getAttribute("class")).toContain("forced-colors:bg-[Canvas]");
    expect(document.body.textContent).toMatch(/5\.7 NM ÷ 5\.657 kn = 1\.008 h/i);
  });

  it("keeps sticky controls and dense equivalents adaptable without relying on colour", () => {
    renderLesson();
    expect(document.querySelector("header")?.className).toContain("min-height:40rem");
    expect(screen.getByRole("button", { name: /Open Vector Solution Tool/i }).parentElement?.className).toContain("min-height:40rem");
    expect(screen.getByRole("region", { name: /Scrollable structured vector record/i }).getAttribute("tabindex")).toBe("0");
    const paths = [...screen.getByRole("img", { name: /Course-to-steer vector triangle/i }).querySelectorAll("path[stroke-dasharray]")];
    expect(new Set(paths.map((path) => path.getAttribute("stroke-dasharray"))).size).toBe(2);
  });
});
