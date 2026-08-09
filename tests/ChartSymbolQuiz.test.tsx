import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ChartSymbolQuiz, { chartSymbolQuestions } from "@/components/navigation/ChartSymbolQuiz";

describe("ChartSymbolQuiz", () => {
  it("covers the purposeful symbol set with traceable catalogue references", () => {
    expect(chartSymbolQuestions).toHaveLength(13);
    expect(chartSymbolQuestions.map(q => q.kind)).toEqual(expect.arrayContaining(["sounding", "drying", "rock", "wreck", "obstruction", "lateral", "safe-water", "cardinal", "light", "cable", "pipeline", "anchorage", "chart-note"]));
    expect(chartSymbolQuestions.every(q => /INT 1/.test(q.reference) && /Chart 5011/.test(q.reference))).toBe(true);
    expect(chartSymbolQuestions.some(q => /buoy floats; a beacon is fixed/i.test(q.explanation))).toBe(true);
  });

  it("does not reveal correctness until a keyboard-selectable answer is submitted", async () => {
    const user = userEvent.setup();
    render(<ChartSymbolQuiz/>);
    expect(screen.queryByText(/^Correct$/)).toBeNull();
    const answer = screen.getByRole("radio", { name: chartSymbolQuestions[0].answer });
    answer.focus();
    await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    expect(screen.getByText(/Catalogue:/)).toBeDefined();
  });

  it("gives remediation for an incorrect answer and exposes semantic progress", async () => {
    const user = userEvent.setup();
    render(<ChartSymbolQuiz/>);
    const progress = screen.getByRole("progressbar", { name: "Assessment progress" });
    expect(progress.getAttribute("value")).toBe("1");
    await user.click(screen.getByRole("radio", { name: chartSymbolQuestions[0].options[1] }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain(`Correct answer: ${chartSymbolQuestions[0].answer}`);
    expect(screen.getByRole("status").textContent).toContain("Chart Datum");
  });
});
