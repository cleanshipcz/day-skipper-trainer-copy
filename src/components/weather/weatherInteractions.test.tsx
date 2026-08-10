// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { BeaufortDrill } from "./BeaufortDrill";
import { SynopticChartReader } from "./SynopticChartReader";
import { ForecastAreaMap } from "./ForecastAreaMap";

type Point = readonly [number, number];

const expectSymbolPointsTowardMovement = (line: readonly [Point, Point], base: readonly [Point, Point], symbolPoint: Point, movement: Point) => {
  const midpoint: Point = [(base[0][0] + base[1][0]) / 2, (base[0][1] + base[1][1]) / 2];
  const symbolVector: Point = [symbolPoint[0] - midpoint[0], symbolPoint[1] - midpoint[1]];
  expect(symbolVector[0] * movement[0] + symbolVector[1] * movement[1]).toBeGreaterThan(0);
  const lineVector: Point = [line[1][0] - line[0][0], line[1][1] - line[0][1]];
  const cross = ([x1, y1]: Point, [x2, y2]: Point) => x1 * y2 - y1 * x2;
  expect(Math.sign(cross(lineVector, symbolVector))).toBe(Math.sign(cross(lineVector, movement)));
};

describe("weather interactions", () => {
  beforeEach(() => window.localStorage.clear());

  it("supports keyboard answers and advances the synoptic scenario", async () => {
    const user = userEvent.setup();
    const { container } = render(<SynopticChartReader />);
    const integratedChart = screen.getByRole("img", { name: /988 hPa centre inside 992 and 996 hPa isobars.*semicircle front.*triangle front.*warm sector/i });
    expect(integratedChart.tagName).toBe("svg");
    expect(integratedChart.getAttribute("viewBox")).toBe("0 0 600 300");
    expect(integratedChart.getAttribute("class")).toContain("w-full");
    expect(integratedChart.querySelector('[data-chart-layer="geography"]')).toBeTruthy();
    expect(integratedChart.querySelectorAll("[data-isobar]")).toHaveLength(3);
    expect(integratedChart.textContent).toContain("988");
    expect(integratedChart.textContent).toContain("992");
    expect(integratedChart.textContent).toContain("996 hPa");
    expect(integratedChart.querySelector('[data-warm-sector="true"]')).toBeTruthy();

    for (const type of ["warm", "cold", "occluded"]) {
      const front = integratedChart.querySelector(`[data-front-type="${type}"]`);
      expect(front?.getAttribute("data-connected-to")).toBe("low");
      expect(front?.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
    }
    const warm = integratedChart.querySelector('[data-front-type="warm"]')!;
    const cold = integratedChart.querySelector('[data-front-type="cold"]')!;
    const occluded = integratedChart.querySelector('[data-front-type="occluded"]')!;
    expect(warm.querySelectorAll("path")[0].getAttribute("d")).toBe("M220 131C300 139 368 145 485 151");
    expect(warm.querySelectorAll("path")[1].getAttribute("d")).toContain("M273 136Q286 112 299 138");
    expect(cold.querySelectorAll("path")[0].getAttribute("d")).toBe("M196 138C171 174 139 211 91 273");
    expect(cold.querySelectorAll("path")[1].getAttribute("d")).toContain("M169 176l18 13-27 8z");
    expect(occluded.querySelectorAll("path")[0].getAttribute("d")).toBe("M199 102C191 72 180 43 163 18");
    expect(occluded.querySelectorAll("path")[1].getAttribute("d")).toBe("M190 75L205 66 186 59ZM178 47Q197 48 196 35");
    expectSymbolPointsTowardMovement([[220, 131], [485, 151]], [[273, 136], [299, 138]], [286, 112], [0, -1]);
    expectSymbolPointsTowardMovement([[196, 138], [91, 273]], [[169, 176], [160, 197]], [187, 189], [1, 0]);
    expectSymbolPointsTowardMovement([[199, 102], [163, 18]], [[190, 75], [186, 59]], [205, 66], [1, 0]);
    expectSymbolPointsTowardMovement([[199, 102], [163, 18]], [[178, 47], [196, 35]], [197, 48], [1, 0]);
    expect(warm.getAttribute("data-direction")).toBe("north");
    expect(cold.getAttribute("data-direction")).toBe("east");
    expect(occluded.getAttribute("data-direction")).toBe("east");
    expect(integratedChart.querySelector('[data-front-type="occluded"]')?.getAttribute("aria-label")).toMatch(/alternating triangles and semicircles/i);
    expect(container.textContent).not.toContain("▶");

    await user.tab();
    const correct = screen.getByRole("button", { name: /pressure bottoms then rises/i });
    expect(document.activeElement).toBe(correct);
    await user.keyboard("{Enter}");
    expect(correct.getAttribute("aria-pressed")).toBe("true");
    expect(correct.getAttribute("data-answer-state")).toBe("selected");
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    expect(screen.getByRole("status").textContent).toContain("Correct.");
    expect(correct.getAttribute("data-answer-state")).toBe("correct");
    expect((correct as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Next chart" }));
    expect(screen.getByRole("img", { name: /front line running west-southwest.*triangle apexes point north/i })).toBeTruthy();
    const front = document.querySelector('[data-chart-marker="cold-front"]');
    expect(front?.getAttribute("data-direction")).toBe("north");
    expect(front?.querySelectorAll("path")).toHaveLength(2);
    expect(front?.querySelectorAll("path")[0].getAttribute("d")).toBe("M105 165C220 145 338 160 505 125");
    expect(front?.querySelectorAll("path")[1].getAttribute("d")).toContain("M165 155l18-22 11 19z");
    expectSymbolPointsTowardMovement([[105, 165], [505, 125]], [[165, 155], [194, 152]], [183, 133], [0, -1]);
    expect(front?.textContent).not.toContain("▶");
  });

  it("blocks unanswered progression and exposes locked incorrect feedback", async () => {
    const user = userEvent.setup();
    render(<SynopticChartReader />);
    const next = screen.getByRole("button", { name: "Next chart" });
    expect((next as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /check answer/i }) as HTMLButtonElement).disabled).toBe(true);

    const wrong = screen.getByRole("button", { name: /pressure stays steady/i });
    await user.click(wrong);
    expect(wrong.getAttribute("data-answer-state")).toBe("selected");
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    expect(screen.getByRole("status").textContent).toMatch(/not quite.*steady pressure and light variable wind.*best answer/is);
    expect(wrong.getAttribute("data-answer-state")).toBe("incorrect");
    expect((wrong as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);
  });

  it("persists progress through the final scenario and supports restart after reload", async () => {
    const user = userEvent.setup();
    const view = render(<SynopticChartReader />);
    const correctAnswers = [/pressure bottoms then rises/i, /allow timing margin/i, /surface true wind circulates anticlockwise/i];
    for (let index = 0; index < correctAnswers.length; index += 1) {
      expect(screen.getByText(`Chart ${index + 1} of 3`)).toBeTruthy();
      await user.click(screen.getByRole("button", { name: correctAnswers[index] }));
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      expect(screen.getByRole("status").textContent).toContain("Correct.");
      await user.click(screen.getByRole("button", { name: index === 2 ? "Finish reader" : "Next chart" }));
    }
    expect(screen.getByRole("status").textContent).toContain("completed all 3");
    expect(screen.getByText(/does not mark.*theory lesson complete/i)).toBeTruthy();

    view.unmount();
    render(<SynopticChartReader />);
    expect(screen.getByRole("heading", { name: /chart reader complete/i })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /restart chart reader/i }));
    expect(screen.getByText("Chart 1 of 3")).toBeTruthy();
  });

  it("requires Beaufort drill submission before moving to another recall direction", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);
    await user.click(screen.getByRole("button", { name: "0" }));
    expect(screen.queryByRole("status")).toBeNull();
    expect((screen.getByRole("button", { name: /next question/i }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await user.click(screen.getByRole("button", { name: /next question/i }));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: /^Which Beaufort force/ }).textContent).toMatch(/sea description/i);
    expect(screen.getByRole("button", { name: "11" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "12" })).toBeTruthy();
  });

  it("exposes all forecast areas as focusable controls", async () => {
    const user = userEvent.setup();
    render(<ForecastAreaMap />);
    const dogger = screen.getByRole("button", { name: "Dogger" });
    await user.click(dogger);
    expect(dogger.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("North Sea east");
    expect(screen.getByText("Great Britain")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Dogger: North Sea east/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("selected-area-marker").getAttribute("data-area")).toBe("Dogger");
    expect(screen.getByTestId("selected-area-marker").textContent).toContain("Dogger");
    expect(screen.getByRole("group", { name: "Shipping forecast area list" })).toBeTruthy();
  });
});
