import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VirtualChartPlotter, { chartModel, mapClientPoint, PLOTTER_CHALLENGES } from "@/components/navigation/VirtualChartPlotter";

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
  [[375, 300], [768, 480], [1280, 600]].forEach(([width, height]) => it(`maps a non-5:3 ${width}x${height} viewport independently by axis`, () => {
    const mapped = mapClientPoint({ x: width * .8, y: height * .25 }, { left: 0, top: 0, width, height }, { x: 100, y: 50, width: 750, height: 450 });
    expect(mapped.x).toBeCloseTo(700, 10);
    expect(mapped.y).toBeCloseTo(162.5, 10);
  }));

  it("updates the viewBox through pan and zoom controls", () => {
    render(<VirtualChartPlotter />);
    const svg = screen.getByRole("img");
    expect(svg.getAttribute("viewBox")).toBe("0 0 500 300");
    fireEvent.click(screen.getByRole("button", { name: /pan chart east/i }));
    expect(svg.getAttribute("viewBox")).toBe("100 0 500 300");
    fireEvent.click(screen.getByRole("button", { name: /zoom out/i }));
    expect(svg.getAttribute("viewBox")).toBe("100 0 625 375");
  });

  it("supports keyboard form completion and reports wrong tools without leaking answers", () => {
    render(<VirtualChartPlotter />);
    fireEvent.click(screen.getByRole("button", { name: /start \/ retry/i }));
    fireEvent.click(screen.getByRole("button", { name: /^bearing$/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/requires the distance tool/i);
    expect(screen.getByRole("alert").textContent).not.toMatch(/3\.16/);
    fireEvent.change(screen.getByLabelText(/equivalent nonvisual answer/i), { target: { value: "3.1623" } });
    fireEvent.click(screen.getByRole("button", { name: /check answer/i }));
    expect(screen.getAllByText(/correct within/i).length).toBeGreaterThan(0);
    expect((screen.getByRole("button", { name: /check answer/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("completes an active challenge through a touch-like measurement and cleans up cancellation", () => {
    render(<VirtualChartPlotter />);
    const svg = screen.getByRole("img");
    Object.defineProperty(svg, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 500, height: 300, right: 500, bottom: 300, x: 0, y: 0, toJSON() {} }) });
    fireEvent.click(screen.getByRole("button", { name: /start \/ retry/i }));
    fireEvent.click(screen.getByRole("button", { name: /^distance$/i }));
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerMove(svg, { clientX: 400, clientY: 200, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(svg, { clientX: 400, clientY: 200, pointerId: 2, pointerType: "touch" });
    expect(screen.getAllByText(/correct within/i).length).toBeGreaterThan(0);
    fireEvent.pointerCancel(svg, { pointerId: 2, pointerType: "touch" });
    expect(screen.getByText(/one-finger touch always scrolls the page/i)).toBeTruthy();
  });

  it("counts each challenge once and reports exactly 8/8 mastery", () => {
    render(<VirtualChartPlotter />);
    fireEvent.click(screen.getByRole("button", { name: /start \/ retry/i }));
    const answers = ["3.1623", "135", "3.6056", "125.5377", "50.2166667,-1.5333333", "50.2083333,-1.5083333", "50.2466667,-1.575", "315"];
    answers.forEach((value) => {
      const input = screen.getByLabelText(/equivalent nonvisual answer/i);
      fireEvent.change(input, { target: { value } });
      fireEvent.click(screen.getByRole("button", { name: /check answer/i }));
      expect((screen.getByRole("button", { name: /check answer/i }) as HTMLButtonElement).disabled).toBe(true);
      fireEvent.submit(input.closest("form")!); // Guarded: a solved challenge cannot be counted twice.
      fireEvent.click(screen.getByRole("button", { name: /next challenge/i }));
    });
    expect(screen.getAllByText(/mastery achieved: 8\/8/i).length).toBeGreaterThan(0);
  });
});
