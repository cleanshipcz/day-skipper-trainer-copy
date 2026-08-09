import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
