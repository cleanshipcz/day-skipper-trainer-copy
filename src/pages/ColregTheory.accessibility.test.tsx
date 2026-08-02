import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const gate = {
  canComplete: false, markCompleted: vi.fn(), markSectionVisited: vi.fn(),
  visitedSectionIds: [] as string[], saveState: "idle" as "idle" | "saving" | "saved" | "queued" | "failed",
};
vi.mock("@/features/progress/useTheoryCompletionGate", () => ({ useTheoryCompletionGate: () => gate }));
vi.mock("@/components/colregs/ColregScenarioExercise", () => ({ ColregScenarioExercise: () => <section id="applied-colregs"><h2>Applied encounter exercises</h2></section> }));

import ColregTheory from "./ColregTheory";

const renderPage = () => render(<MemoryRouter initialEntries={["/rules/colregs"]}><Routes><Route path="/rules/colregs" element={<ColregTheory />} /><Route path="/rules-of-the-road" element={<h1>Rules menu</h1>} /></Routes></MemoryRouter>);

describe("COLREG theory accessibility and reflow", () => {
  beforeEach(() => { gate.canComplete = false; gate.visitedSectionIds = []; gate.saveState = "idle"; gate.markCompleted.mockReset().mockResolvedValue(true); });

  it("exposes named landmarks, contents and rule navigation with a predictable return", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Lesson contents" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Rules 5 to 17" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "1. Part B framework" }).getAttribute("href")).toBe("#framework");
    await user.click(screen.getByRole("button", { name: "Back to rules of the road" }));
    expect(screen.getByRole("heading", { name: "Rules menu" })).toBeTruthy();
  });

  it("announces gate and saved completion without moving focus or navigating away", async () => {
    gate.canComplete = true; gate.visitedSectionIds = ["framework", "rules-5-17", "rule-18", "rule-19", "applied"];
    const { rerender } = renderPage();
    expect(screen.getByText("All five objectives are reviewed. Completion is available.").getAttribute("aria-live")).toBe("polite");
    gate.saveState = "saved";
    rerender(<MemoryRouter initialEntries={["/rules/colregs"]}><ColregTheory /></MemoryRouter>);
    expect(screen.getByText(/Completion saved/).getAttribute("aria-live")).toBe("polite");
    expect(screen.getByRole("button", { name: /Return to Rules of the Road/ })).toBeTruthy();
  });

  it("includes narrow-width, touch and forced-colour safeguards", () => {
    const { container } = renderPage();
    expect(container.firstElementChild?.className).toContain("overflow-x-clip");
    expect(screen.getByRole("button", { name: /Back to rules/i }).className).toContain("min-w-11");
    expect(screen.getByRole("navigation", { name: "Lesson contents" }).className).toContain("forced-colors:border-[CanvasText]");
    expect(screen.getByRole("link", { name: "Rule 5" }).className).toContain("min-h-11");
    expect(screen.getByText("Section I").className).toContain("whitespace-normal");
  });
});
