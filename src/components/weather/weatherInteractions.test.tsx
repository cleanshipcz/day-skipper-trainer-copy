// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BeaufortDrill } from "./BeaufortDrill";
import { SynopticChartReader } from "./SynopticChartReader";
import { ForecastAreaMap } from "./ForecastAreaMap";

describe("weather interactions", () => {
  it("supports keyboard answers and advances the synoptic scenario", async () => {
    const user = userEvent.setup();
    const { container } = render(<SynopticChartReader />);
    const integratedChart = screen.getByRole("img", { name: /frontal depression west of ireland.*labelled isobars.*connected fronts.*warm sector/i });
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
      expect(front?.getAttribute("aria-label")).toMatch(/attached/i);
    }
    expect(integratedChart.querySelector('[data-front-type="warm"]')?.getAttribute("aria-label")).toMatch(/semicircles/i);
    expect(integratedChart.querySelector('[data-front-type="cold"]')?.getAttribute("aria-label")).toMatch(/triangles/i);
    expect(integratedChart.querySelector('[data-front-type="occluded"]')?.getAttribute("aria-label")).toMatch(/alternating triangles and semicircles/i);
    expect(container.textContent).not.toContain("▶");

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Low pressure" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await user.click(screen.getByRole("button", { name: "Next chart" }));
    expect(screen.getByRole("img", { name: /cold front moving east.*attached triangles/i })).toBeTruthy();
    const front = document.querySelector('[data-chart-marker="cold-front"]');
    expect(front?.getAttribute("data-direction")).toBe("east");
    expect(front?.querySelectorAll("path")).toHaveLength(2);
    expect(front?.textContent).not.toContain("▶");
  });

  it("gives drill feedback and moves to another observation", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);
    await user.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await user.click(screen.getByRole("button", { name: /next observation/i }));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText(/Wind speed:/)).toBeTruthy();
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
