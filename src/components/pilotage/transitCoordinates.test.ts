import { describe, expect, it } from "vitest";
import { clientPointToChart } from "./transitCoordinates";

describe("clientPointToChart", () => {
  it("scales pointer coordinates from a reduced responsive chart", () => {
    expect(clientPointToChart(
      160,
      145,
      { left: 10, top: 20, width: 300, height: 250 },
      600,
      500,
    )).toEqual({ x: 300, y: 250 });
  });

  it("clamps pointer positions to the chart viewBox", () => {
    expect(clientPointToChart(-10, 600, { left: 0, top: 0, width: 300, height: 250 }, 600, 500))
      .toEqual({ x: 0, y: 500 });
  });
});
