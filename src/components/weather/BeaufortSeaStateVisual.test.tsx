// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { beaufortScale } from "@/data/beaufortScale";
import { BeaufortSeaStateVisual } from "./BeaufortSeaStateVisual";

describe("BeaufortSeaStateVisual", () => {
  it("renders a distinct, responsive accessible observation for every force without naming the answer", () => {
    render(<>{beaufortScale.map((level) => <BeaufortSeaStateVisual key={level.force} level={level} />)}</>);
    const visuals = screen.getAllByRole("img");
    expect(visuals).toHaveLength(13);
    expect(new Set(visuals.map((visual) => visual.getAttribute("aria-label"))).size).toBe(13);
    visuals.forEach((visual, index) => {
      const alternative = visual.getAttribute("aria-label") ?? "";
      expect(alternative).not.toMatch(/Force\s*\d|knots/i);
      expect(alternative.toLowerCase()).not.toContain(beaufortScale[index].description.toLowerCase());
      expect(visual.getAttribute("viewBox")).toBe("0 0 480 180");
      expect(visual.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
      expect(visual.getAttribute("class")).toContain("w-full");
      expect(visual.querySelectorAll("path").length).toBeGreaterThanOrEqual(3);
    });
  });

  it("progressively adds breaking-water and spray cues at stronger states", () => {
    const { rerender } = render(<BeaufortSeaStateVisual level={beaufortScale[0]} />);
    expect(document.querySelectorAll('[data-testid="beaufort-sea-visual"] path')).toHaveLength(3);
    rerender(<BeaufortSeaStateVisual level={beaufortScale[8]} />);
    expect(document.querySelectorAll('[data-testid="beaufort-sea-visual"] path').length).toBeGreaterThan(12);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/breaking crests.*foam streaks.*spray/i);
  });
});
