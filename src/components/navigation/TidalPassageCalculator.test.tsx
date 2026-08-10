import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TidalPassageCalculator from "./TidalPassageCalculator";

const change = (id: string, value: string) => {
  fireEvent.change(document.getElementById(id) as HTMLInputElement, { target: { value } });
};

const geometryIsFinite = (svg: SVGSVGElement) => {
  const geometry = [...svg.querySelectorAll("path, line, rect, text")]
    .flatMap((node) => ["d", "x", "y", "x1", "x2", "y1", "y2", "width", "height"].map((name) => node.getAttribute(name)))
    .filter((value): value is string => value !== null);
  return geometry.every((value) => !/NaN|Infinity/.test(value));
};

describe("TidalPassageCalculator rendering contract", () => {
  it("suppresses result geometry for invalid inputs", () => {
    render(<TidalPassageCalculator />);
    expect(screen.getByRole("img")).toBeTruthy();
    change("draft", "");
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("No result or chart is shown");
  });

  it("labels an overnight window on the following day", () => {
    render(<TidalPassageCalculator />);
    change("previousLow-time", "20:00");
    change("high-time", "02:00");
    change("followingLow-time", "08:00");
    expect(screen.getAllByText(/\+1 day/).length).toBeGreaterThan(0);
  });

  it("shows a non-five-minute equality as one exact boundary", () => {
    render(<TidalPassageCalculator />);
    change("high-time", "12:02");
    change("followingLow-time", "18:02");
    change("draft", "3.5");
    change("clearance", "1");
    change("chartedDepth", "0");
    expect(screen.getByText("exact boundary at 12:02")).toBeTruthy();
    expect(screen.queryByText(/12:05.*12:00/)).toBeNull();
  });

  it("does not invent a rounded window when the exact interval is too narrow", () => {
    render(<TidalPassageCalculator />);
    change("high-time", "12:02");
    change("followingLow-time", "18:02");
    change("draft", "4.49999");
    change("clearance", "0");
    change("chartedDepth", "0");
    expect(screen.getByText(/No usable five-minute window/)).toBeTruthy();
    expect(screen.queryByText(/^about /)).toBeNull();
    expect(screen.queryByText(/usable displayed limits are rounded inward/)).toBeNull();
  });

  it("does not call a nonzero interval usable when both inward-rounded endpoints are noon", () => {
    render(<TidalPassageCalculator />);
    change("draft", "4.4999");
    change("clearance", "0");
    change("chartedDepth", "0");
    expect(screen.getByText(/No usable five-minute window/)).toBeTruthy();
    expect(screen.queryByText("exact boundary at 12:00")).toBeNull();
  });

  it("renders low-water equality boundaries as intervals", () => {
    render(<TidalPassageCalculator />);
    change("draft", "0.8");
    change("clearance", "0");
    change("chartedDepth", "0");
    expect(screen.getByText("about 06:00–18:00")).toBeTruthy();
    expect(screen.queryByText(/exact boundary at/)).toBeNull();
  });

  it("keeps finite curve geometry and identifies an off-scale requirement", () => {
    render(<TidalPassageCalculator />);
    change("draft", "30");
    change("clearance", "20");
    change("chartedDepth", "-20");
    const svg = screen.getByRole("img") as unknown as SVGSVGElement;
    expect(geometryIsFinite(svg)).toBe(true);
    expect(screen.getByText(/required-tide line is outside/)).toBeTruthy();
  });

  it("locks a checked attempt, gives worked feedback, and unlocks retry", () => {
    render(<TidalPassageCalculator />);
    const answer = screen.getByLabelText("Required height of tide, in metres") as HTMLInputElement;
    fireEvent.change(answer, { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect((answer.closest("fieldset") as HTMLFieldSetElement).disabled).toBe(true);
    expect(screen.getByRole("alert").textContent).toContain("You entered 1.0 m");
    expect(screen.getByRole("alert").textContent).toContain("= 1.8 m");
    fireEvent.click(screen.getByRole("button", { name: "Retry this scenario" }));
    expect(answer.disabled).toBe(false);
  });

  it("records mastery only for a correct checked answer and advances explicitly", () => {
    const onMastery = vi.fn();
    render(<TidalPassageCalculator onMastery={onMastery} />);
    fireEvent.change(screen.getByLabelText("Required height of tide, in metres"), { target: { value: "1.8" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onMastery).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toContain("margin is 0.6 m");
    fireEvent.click(screen.getByRole("button", { name: "New scenario" }));
    expect(screen.getByText(/Scenario 2 of 3: Drying bank/)).toBeTruthy();
  });

  it("keeps the signed-value convention associated when an error is present", () => {
    render(<TidalPassageCalculator />);
    change("chartedDepth", "");
    const describedBy = screen.getByLabelText("Signed charted value (m)").getAttribute("aria-describedby");
    expect(describedBy).toContain("charted-value-hint");
    expect(describedBy).toContain("chartedDepth-error");
  });

  it("provides an SVG description and structured text alternative", () => {
    render(<TidalPassageCalculator />);
    expect(screen.getByRole("img").getAttribute("aria-labelledby")).toContain("tidal-chart-description");
    expect(screen.getByRole("table", { name: "Text alternative: entered tidal events" })).toBeTruthy();
  });
});
