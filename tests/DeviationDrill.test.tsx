import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DeviationDrill, { deviationAtCompassHeading, normalizeHeading, solveCompassHeading } from "@/components/navigation/DeviationDrill";

describe("DeviationDrill calculation", () => {
  it("applies east and west variation with the correct sign", () => {
    expect(solveCompassHeading(100, 5).magnetic).toBe(95);
    expect(solveCompassHeading(100, -5).magnetic).toBe(105);
  });

  it("wraps headings and interpolation continuously through 000/360", () => {
    expect(normalizeHeading(360)).toBe(0);
    expect(normalizeHeading(-1)).toBe(359);
    expect(deviationAtCompassHeading(337.5)).toBeCloseTo(0, 10);
    expect(deviationAtCompassHeading(360)).toBe(-2);
  });

  it("looks deviation up by the solved compass heading, not the true row", () => {
    const result = solveCompassHeading(90, -5);
    expect(result.compass).toBeCloseTo(99.57, 2);
    expect(result.bracket).toEqual([90, 135]);
    expect(result.deviation).toBeCloseTo(-4.57, 2);
    expect(result.deviation).not.toBe(deviationAtCompassHeading(90));
  });

  it("matches an independently solvable interpolated card example", () => {
    // Halfway from the card's 315°/+2°E entry to 000°/2°W entry, deviation is zero.
    const result = solveCompassHeading(337.5, 0);
    expect(result.magnetic).toBe(337.5);
    expect(result.deviation).toBeCloseTo(0, 10);
    expect(result.compass).toBeCloseTo(337.5, 10);
  });
});

describe("DeviationDrill presentation", () => {
  it("labels the card as compass heading and documents the worked lookup", () => {
    render(<DeviationDrill />);
    expect(screen.getByText((_, element) => element?.tagName === "P" && /first row is compass heading/i.test(element.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, element) => element?.tagName === "P" && /C = M − deviation\(C\)/i.test(element.textContent ?? ""))).toBeDefined();
    expect(screen.getByRole("heading", { name: "Worked first row" })).toBeDefined();
    expect(screen.getByLabelText("Compass heading for 000 degrees true")).toBeDefined();
  });
});
