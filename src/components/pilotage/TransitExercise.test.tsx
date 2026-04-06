/**
 * Tests for the TransitExercise component.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2, AC-2, AC-3
 *
 * AC-2: Interactive TransitExercise.tsx — harbour chart view where user drags
 *       vessel to align with transit markers. Minimum 3 exercises of
 *       increasing difficulty.
 * AC-3: Visual feedback shows when vessel is on/off the transit line.
 */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TransitExercise } from "./TransitExercise";
import { TRANSIT_SCENARIOS } from "./transitScenarios";

describe("TransitExercise", () => {
  it("should render the first scenario description and harbour chart area", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    // - should contain scenario prompt text
    expect(html).toContain(TRANSIT_SCENARIOS[0].title);
    // - should contain an SVG-based harbour chart view
    expect(html).toContain("<svg");
  });

  it("should render transit markers on the chart", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    // - should render markers (front and rear transit markers)
    expect(html).toContain("front-marker");
    expect(html).toContain("rear-marker");
  });

  it("should render a draggable vessel element", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    // - should render the vessel with a data attribute for identification
    expect(html).toContain("data-testid=\"vessel\"");
  });

  it("should render a Check Alignment button", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    expect(html).toContain("Check Alignment");
  });

  it("should display the current exercise number and total count", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    // - should show progress indicator like "Exercise 1 of 3"
    expect(html).toContain("Exercise 1");
    expect(html).toContain(`of ${TRANSIT_SCENARIOS.length}`);
  });

  it("should show difficulty indicator for each scenario", () => {
    // given
    const noop = vi.fn();

    // when
    const html = renderToStaticMarkup(<TransitExercise onComplete={noop} />);

    // then
    // - first scenario should show its difficulty level
    expect(html).toContain(TRANSIT_SCENARIOS[0].difficulty);
  });
});

describe("transitScenarios", () => {
  it("should define at least 3 scenarios (AC-2)", () => {
    expect(TRANSIT_SCENARIOS.length).toBeGreaterThanOrEqual(3);
  });

  it("should have scenarios with increasing difficulty", () => {
    // given
    const difficulties = TRANSIT_SCENARIOS.map((s) => s.difficultyLevel);

    // then
    // - difficulty should be non-decreasing (1, 2, 3, ...)
    for (let i = 1; i < difficulties.length; i++) {
      expect(difficulties[i]).toBeGreaterThanOrEqual(difficulties[i - 1]);
    }
  });

  it("should define required properties for each scenario", () => {
    for (const scenario of TRANSIT_SCENARIOS) {
      // - every scenario must have a unique id
      expect(scenario.id).toBeDefined();
      expect(typeof scenario.id).toBe("string");

      // - every scenario must have a title and description
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(0);

      // - every scenario must have a difficulty label
      expect(scenario.difficulty.length).toBeGreaterThan(0);

      // - every scenario must have a numeric difficulty level
      expect(scenario.difficultyLevel).toBeGreaterThanOrEqual(1);
      expect(scenario.difficultyLevel).toBeLessThanOrEqual(3);

      // - every scenario must have front and rear marker positions
      expect(scenario.frontMarker).toBeDefined();
      expect(typeof scenario.frontMarker.x).toBe("number");
      expect(typeof scenario.frontMarker.y).toBe("number");
      expect(scenario.rearMarker).toBeDefined();
      expect(typeof scenario.rearMarker.x).toBe("number");
      expect(typeof scenario.rearMarker.y).toBe("number");

      // - every scenario must have a vessel start position
      expect(scenario.vesselStart).toBeDefined();
      expect(typeof scenario.vesselStart.x).toBe("number");
      expect(typeof scenario.vesselStart.y).toBe("number");

      // - every scenario must have alignment tolerance in pixels
      expect(typeof scenario.tolerancePx).toBe("number");
      expect(scenario.tolerancePx).toBeGreaterThan(0);
    }
  });

  it("should have unique IDs across all scenarios", () => {
    // given
    const ids = TRANSIT_SCENARIOS.map((s) => s.id);

    // when
    const unique = new Set(ids);

    // then
    expect(unique.size).toBe(ids.length);
  });
});
