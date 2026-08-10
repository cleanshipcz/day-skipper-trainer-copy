import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClearingBearingTool } from "./ClearingBearingTool";
import { CLEARING_BEARING_SCENARIOS, solutionFor } from "./clearingBearingScenarios";

const solveCurrent = (index: number) => {
  const solution = solutionFor(CLEARING_BEARING_SCENARIOS[index]);
  fireEvent.change(screen.getByLabelText(/Measured bearing/), { target: { value: String(solution.bearing) } });
  fireEvent.click(screen.getByRole("button", { name: solution.rule }));
  fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
};

describe("ClearingBearingTool mastery flow", () => {
  it("does not disclose the solution before assessment and gives retry guidance", () => {
    render(<ClearingBearingTool />);
    expect(screen.queryByText(/Limit \d{3}°T/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Measured bearing/), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "NMT" }));
    fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Replot|inequality/);
    expect(screen.getByRole("alert").textContent).toMatch(/test position/i);
  });

  it("calls completion only after both scenarios are solved and mastery is declared", () => {
    const complete = vi.fn();
    render(<ClearingBearingTool onAllScenariosComplete={complete} />);
    solveCurrent(0);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
    solveCurrent(1);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it("labels chart meaning and bearing direction", () => {
    render(<ClearingBearingTool />);
    expect(screen.getByRole("img", { name: /clearance margin and safe-water area/ })).toBeTruthy();
    expect(screen.getByText(/measured clockwise at the vessel towards the named mark/i)).toBeTruthy();
  });
});
