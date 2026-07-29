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
    render(<SynopticChartReader />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Low pressure" }));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await user.click(screen.getByRole("button", { name: "Next chart" }));
    expect(screen.getByText(/blue triangles/i)).toBeTruthy();
    const front = document.querySelector('[data-chart-marker="cold-front"]');
    expect(front?.getAttribute("data-direction")).toBe("east");
    expect(front?.textContent).toContain("▶");
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
  });
});
