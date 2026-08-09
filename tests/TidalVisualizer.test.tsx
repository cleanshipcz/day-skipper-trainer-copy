import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TidalVisualizer from "@/components/navigation/TidalVisualizer";
import { validateDepthAnswer, waterOverFeature } from "@/components/navigation/tidalDepth";

describe("TidalVisualizer Component", () => {
  it("renders the main elements", () => {
    render(<TidalVisualizer />);
    expect(screen.getByText("Interactive Tidal Curves")).toBeDefined();
    // Use getAllByText because "Height of Tide" appears in Label and SVG
    expect(screen.getAllByText(/Height of Tide/i).length).toBeGreaterThan(0);
    // Check for the "Start Drill" button
    expect(screen.getByRole("button", { name: /Start Drill/i })).toBeDefined();
  });

  it("activates drill mode when Start Drill is clicked", () => {
    render(<TidalVisualizer />);
    const startButton = screen.getByRole("button", { name: /Start Drill/i });
    fireEvent.click(startButton);

    // Should now see the input and "Check" button
    expect(screen.getByPlaceholderText("Depth (m)")).toBeDefined();
    expect(screen.getByRole("button", { name: "Check" })).toBeDefined();
  });

  it("calculates soundings and covered, awash, and uncovered drying features", () => {
    expect(waterOverFeature({ id: "s", tide: 1.4, chartValue: 3.2, feature: "sounding" })).toBeCloseTo(4.6);
    expect(waterOverFeature({ id: "d", tide: 2.3, chartValue: 1.1, feature: "drying" })).toBeCloseTo(1.2);
    expect(waterOverFeature({ id: "a", tide: 1.7, chartValue: 1.7, feature: "drying" })).toBe(0);
    expect(waterOverFeature({ id: "u", tide: 0.8, chartValue: 1.4, feature: "drying" })).toBeCloseTo(-0.6);
  });

  it("rejects blank, non-finite, negative, implausible, and over-precise answers", () => {
    expect(validateDepthAnswer("", 2)).toMatch(/enter a value/i);
    expect(validateDepthAnswer("Infinity", 2)).toMatch(/finite/i);
    expect(validateDepthAnswer("-0.6", -0.6)).toMatch(/cannot be negative/i);
    expect(validateDepthAnswer("31", 2)).toMatch(/not plausible/i);
    expect(validateDepthAnswer("2.00", 2)).toMatch(/one decimal/i);
    expect(validateDepthAnswer("2.1", 2)).toMatch(/recheck/i);
    expect(validateDepthAnswer("2.0", 2)).toBeNull();
  });

  it("keeps the question, diagram, checker, and accessible numeric description in sync", async () => {
    const user = userEvent.setup();
    render(<TidalVisualizer />);
    await user.click(screen.getByRole("button", { name: /start drill/i }));
    expect(screen.getByText(/charted sounding 3.2 m; tide 1.4 m/i)).toBeTruthy();
    expect(screen.getByRole("img", { name: /scenario A.*1.4 metres.*sounding.*3.2.*4.6 metres/is })).toBeTruthy();
    await user.type(screen.getByLabelText(/water depth/i), "4.6");
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toMatch(/4.6 m of water/i);
    await user.click(screen.getByRole("button", { name: /next question/i }));
    expect(screen.getByText(/drying height 1.1 m; tide 2.3 m/i)).toBeTruthy();
  });

  it.each([375, 768, 1280])("remains operable at %ipx with keyboard and pointer input", async (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(<TidalVisualizer />);
    const slider = screen.getByRole("slider", { name: /height of tide/i });
    slider.focus();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.pointerDown(screen.getByRole("button", { name: /start drill/i }), { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: /start drill/i }));
    expect(slider.getAttribute("aria-valuenow")).not.toBeNull();
    expect(screen.getByRole("img").getAttribute("viewBox")).toBe("0 0 600 390");
  });
});
