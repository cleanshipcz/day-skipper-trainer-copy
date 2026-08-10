import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClearingBearingTool } from "./ClearingBearingTool";
import { CLEARING_BEARING_SCENARIOS, solutionFor } from "./clearingBearingScenarios";

const solveCurrent = (index: number) => {
  const solution = solutionFor(CLEARING_BEARING_SCENARIOS[index]);
  const assessable = solution.rule === "NLT" ? Math.ceil(solution.bearing) : Math.floor(solution.bearing);
  fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: String(assessable) } });
  fireEvent.click(screen.getByRole("button", { name: solution.rule }));
  fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
};

describe("ClearingBearingTool mastery flow", () => {
  it("does not disclose the solution before assessment and gives retry guidance", () => {
    render(<ClearingBearingTool />);
    expect(screen.queryByText(/Limit \d{3}°T/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "NMT" }));
    fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
    const feedback = screen.getByRole("region", { name: "Answer feedback" });
    expect(feedback.textContent).toMatch(/Replot|inequality/);
    expect(feedback.textContent).toMatch(/test position/i);
  });

  it("calls completion only once after both scenarios are solved", async () => {
    let resolve!: (value: boolean) => void;
    const complete = vi.fn(() => new Promise<boolean>((done) => { resolve = done; }));
    render(<ClearingBearingTool onAllScenariosComplete={complete} />);
    solveCurrent(0);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
    solveCurrent(1);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    fireEvent.click(screen.getByRole("button", { name: "Saving mastery…" }));
    expect(complete).toHaveBeenCalledOnce();
    resolve(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Mastery recorded" })).toBeTruthy());
  });

  it("reports a failed save and permits an explicit retry", async () => {
    const complete = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<ClearingBearingTool onAllScenariosComplete={complete} />);
    solveCurrent(0); fireEvent.click(screen.getByRole("button", { name: "Next scenario" })); solveCurrent(1);
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/not saved/i));
    fireEvent.click(screen.getByRole("button", { name: "Retry saving mastery" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Mastery recorded" })).toBeTruthy());
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("labels chart meaning and bearing direction", () => {
    render(<ClearingBearingTool />);
    const chart = screen.getByRole("img", { name: /Practice chart for/ });
    expect(chart.querySelector("desc")?.textContent).toMatch(/magenta diamond.*dashed red ring.*blue circle.*solid blue line/i);
    expect(screen.getByText(/solid red circle.*dashed red perimeter/i)).toBeTruthy();
    expect(screen.getByText(/measured clockwise at the vessel towards the named mark/i)).toBeTruthy();
    expect(screen.getByLabelText(/Rotate plotting line/).getAttribute("type")).toBe("range");
    const line = screen.getByTestId("plotting-line");
    const before = line.getAttribute("x2");
    fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: "200" } });
    expect(screen.getByTestId("plotting-line").getAttribute("x2")).not.toBe(before);
  });

  it("provides nonvisual measurements and distinguishes crossing, clear and tangent states", () => {
    const { container } = render(<ClearingBearingTool />);
    expect(screen.getByRole("heading", { name: "Chart measurements" })).toBeTruthy();
    expect(screen.getByText(/clearance radius of 40 units/)).toBeTruthy();
    expect(screen.getByText(/Find both zero-margin tangents/)).toBeTruthy();
    expect(screen.getAllByText(/known safe-water observation/).length).toBeGreaterThan(0);
    expect(screen.getByText(/if the safe bearing is numerically greater choose NLT/)).toBeTruthy();
    expect(container.querySelector("ellipse[cx='302'][cy='90'][rx='70'][ry='30']")).toBeTruthy();
    const relation = document.getElementById("clearance-relation");
    expect(relation?.textContent).toMatch(/points away/);
    const control = screen.getByLabelText(/Rotate plotting line/);
    fireEvent.change(control, { target: { value: "300" } });
    expect(relation?.textContent).toMatch(/intersects.*chart units/);
    fireEvent.change(control, { target: { value: "280" } });
    expect(relation?.textContent).toMatch(/clears.*chart units/);
    fireEvent.change(control, { target: { value: "289" } });
    expect(relation?.textContent).toMatch(/clears/);
    fireEvent.keyDown(control, { key: "ArrowRight" });
    expect(relation?.textContent).toMatch(/tangent.*signed margin/);
  });

  it("can solve a scenario with keyboard adjustment without answer leakage", () => {
    render(<ClearingBearingTool />);
    expect(screen.queryByText(/Limit \d{3}°T/)).toBeNull();
    const control = screen.getByLabelText(/Rotate plotting line/);
    fireEvent.change(control, { target: { value: "289" } });
    fireEvent.keyDown(control, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "NMT" }));
    fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
    expect(screen.getByText(/Limit 290°T NMT/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next scenario" })).toBeTruthy();
  });

  it("submits once with Enter and moves focus to a single non-live feedback region", async () => {
    render(<ClearingBearingTool />);
    const control = screen.getByLabelText(/Rotate plotting line/);
    fireEvent.change(control, { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "NMT" }));
    const check = screen.getByRole("button", { name: "Check plotted answer" });
    check.focus();
    fireEvent.submit(check.closest("form")!);
    const feedback = await screen.findByRole("region", { name: "Answer feedback" });
    await waitFor(() => expect(document.activeElement).toBe(feedback));
    expect(feedback.hasAttribute("aria-live")).toBe(false);
    expect(feedback.getAttribute("tabindex")).toBe("-1");
  });

  it.each([375, 768, 1280])("keeps chart, inputs and actions reflowable at %ipx with zoom support", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    window.dispatchEvent(new Event("resize"));
    const { container } = render(<ClearingBearingTool />);
    expect(container.querySelector(".aspect-\\[5\\/3\\]")).toBeTruthy();
    expect(screen.getByLabelText(/Rotate plotting line/).className).toContain("touch-pan-y");
    expect(screen.getByRole("button", { name: "Check plotted answer" }).className).toContain("min-h-11");
    for (const rule of ["NLT", "NMT"]) expect(screen.getByRole("button", { name: rule }).className).toContain("min-h-11");
    expect(container.querySelector(".md\\:grid-cols-\\[minmax\\(0\\,1fr\\)_auto\\]")).toBeTruthy();
  });

  it("returns focus to the next chart task after advancing", async () => {
    render(<ClearingBearingTool />);
    solveCurrent(0);
    fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/Rotate plotting line/)));
    expect(screen.getByText(/Scenario 2 of/)).toBeTruthy();
  });
});
