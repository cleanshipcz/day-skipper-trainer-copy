import { describe, it, expect, vi } from "vitest";
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

  it("runs all six questions once, guards settled questions, teaches awash, and supports mastery retry", async () => {
    const user = userEvent.setup();
    const onMastery = vi.fn();
    render(<TidalVisualizer onMastery={onMastery} />);
    await user.click(screen.getByRole("button", { name: /start drill/i }));
    const answers = ["4.6", "1.2", "0", "0", "4.0", "0"];

    for (let question = 0; question < answers.length; question += 1) {
      const input = screen.getByRole("textbox", { name: "Water depth (m)" });
      await user.type(input, answers[question]);
      await user.click(screen.getByRole("button", { name: "Check" }));
      expect(screen.getByText(new RegExp(`score ${question + 1}/${question + 1}`, "i"))).toBeTruthy();
      expect(screen.getByRole("button", { name: /skip/i }).hasAttribute("disabled")).toBe(true);
      if (question === 0) {
        await user.click(screen.getByRole("button", { name: /skip/i }));
        expect(screen.getByText(/question 1 of 6/i)).toBeTruthy();
        expect(screen.getByText(/score 1\/1/i)).toBeTruthy();
      }
      if (question === 5) {
        expect(screen.getByRole("status").textContent).toMatch(/awash.*0.0 m water depth/i);
        expect(screen.getByRole("img").getAttribute("aria-labelledby")).toBeTruthy();
        expect(screen.getByRole("img", { name: /awash, with zero metres of water depth/i })).toBeTruthy();
      } else {
        await user.click(screen.getByRole("button", { name: /next question/i }));
      }
    }

    expect(screen.getByText(/complete: 6\/6.*mastery achieved/i)).toBeTruthy();
    expect(onMastery).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: /retry drill/i }));
    expect(screen.getByText(/question 1 of 6.*score 0\/0/i)).toBeTruthy();
  });

  it("responds to actual resize events with an observable layout contract", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    render(<TidalVisualizer />);
    const layout = screen.getByTestId("tidal-layout");
    expect(layout.getAttribute("data-layout")).toBe("compact");
    expect(layout.className).toContain("grid-cols-1");
    expect(layout.className).toContain("gap-4");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 768 });
    fireEvent(window, new Event("resize"));
    expect(layout.getAttribute("data-layout")).toBe("standard");
    expect(layout.className).toContain("minmax(17rem,0.8fr)");
    expect(layout.className).toContain("gap-5");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    fireEvent(window, new Event("resize"));
    expect(layout.getAttribute("data-layout")).toBe("wide");
    expect(layout.className).toContain("minmax(20rem,0.8fr)");
    expect(layout.className).toContain("gap-8");
    expect(screen.getByTestId("tidal-figure").className).toContain("overflow-hidden");
    expect(screen.getByRole("img").classList.contains("w-full")).toBe(true);
    expect(screen.getByRole("img").classList.contains("min-w-0")).toBe(true);
  });

  it("supports keyboard slider adjustment and pointer-driven drill entry", async () => {
    const user = userEvent.setup();
    render(<TidalVisualizer />);
    const slider = screen.getByRole("slider", { name: /height of tide/i });
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuenow")).toBe("2.6");
    await user.click(screen.getByRole("button", { name: /start drill/i }));
    expect(screen.getByText(/question 1 of 6/i)).toBeTruthy();
  });
});
