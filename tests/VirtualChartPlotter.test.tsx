import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VirtualChartPlotter, { chartModel, PLOTTER_CHALLENGES } from "@/components/navigation/VirtualChartPlotter";

const expected = [
  3.1622776602,
  135,
  3.6055512755,
  125.537677792,
  { lat: 50 + 13 / 60, lon: -(1 + 32 / 60) },
  { lat: 50 + 12.5 / 60, lon: -(1 + 30.5 / 60) },
  { lat: 50 + 14.8 / 60, lon: -(1 + 34.5 / 60) },
  315,
];

describe("VirtualChartPlotter model", () => {
  it("independently recalculates every challenge and reciprocal bearing", () => {
    PLOTTER_CHALLENGES.forEach((challenge, index) => {
      if (challenge.kind === "plot") {
        const coordinate = chartModel.toCoordinate(challenge.target!);
        expect(coordinate.lat).toBeCloseTo((expected[index] as { lat: number }).lat, 8);
        expect(coordinate.lon).toBeCloseTo((expected[index] as { lon: number }).lon, 8);
      } else {
        const value = challenge.kind === "distance"
          ? chartModel.distance(challenge.start!, challenge.end!)
          : chartModel.bearing(challenge.start!, challenge.end!);
        expect(value).toBeCloseTo(expected[index] as number, 6);
      }
    });
    expect(chartModel.angularDifference(359, 1)).toBe(2);
    expect(chartModel.angularDifference(1, 359)).toBe(2);
  });

  it("round-trips coordinates through the projection", () => {
    const coordinate = { lat: 50.22, lon: -1.51 };
    expect(chartModel.toCoordinate(chartModel.toPoint(coordinate.lat, coordinate.lon))).toEqual(expect.objectContaining({ lat: expect.closeTo(coordinate.lat, 10), lon: expect.closeTo(coordinate.lon, 10) }));
  });
});

describe("VirtualChartPlotter access paths", () => {
  [375, 768, 1280].forEach((width) => it(`renders the chart and nonvisual path at ${width}px`, () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(<VirtualChartPlotter />);
    expect(screen.getByRole("img", { name: /local navigation practice chart/i })).toBeTruthy();
    expect(screen.getByRole("table", { name: /landmark positions/i })).toBeTruthy();
  }));

  it("supports keyboard form completion and reports wrong tools without leaking answers", () => {
    render(<VirtualChartPlotter />);
    fireEvent.click(screen.getByRole("button", { name: /start \/ retry/i }));
    fireEvent.click(screen.getByRole("button", { name: /^bearing$/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/requires the distance tool/i);
    expect(screen.getByRole("alert").textContent).not.toMatch(/3\.16/);
    fireEvent.change(screen.getByLabelText(/equivalent nonvisual answer/i), { target: { value: "3.1623" } });
    fireEvent.click(screen.getByRole("button", { name: /check answer/i }));
    expect(screen.getAllByText(/correct within/i).length).toBeGreaterThan(0);
  });

  it("accepts pointer and touch-like chart paths", () => {
    render(<VirtualChartPlotter />);
    const svg = screen.getByRole("img");
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 500, height: 300, right: 500, bottom: 300, x: 0, y: 0, toJSON() {} }) });
    fireEvent.click(screen.getByRole("button", { name: /^plot$/i }));
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "mouse" });
    fireEvent.click(screen.getByRole("button", { name: /^distance$/i }));
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerMove(svg, { clientX: 400, clientY: 200, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(svg, { clientX: 400, clientY: 200, pointerId: 2, pointerType: "touch" });
    expect(screen.getByText(/measurement:/i)).toBeTruthy();
  });
});
