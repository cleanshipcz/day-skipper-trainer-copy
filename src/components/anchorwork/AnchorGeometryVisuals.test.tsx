import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnchorGeometryVisuals } from "./AnchorGeometryVisuals";

describe("AnchorGeometryVisuals", () => {
  it("provides useful accessible names, descriptions, and equivalent worked values", () => {
    render(<AnchorGeometryVisuals />);

    const side = screen.getByRole("img", { name: "Scale side view of the worked scope example" });
    const plan = screen.getByRole("img", { name: "Plan view of vessel swinging room and nearby hazards" });
    expect(side.getAttribute("aria-describedby")).toBe("anchor-side-desc");
    expect(plan.getAttribute("aria-describedby")).toBe("anchor-plan-desc");
    expect(within(side).getByText(/four metres current water depth/i)).toBeTruthy();
    expect(within(plan).getByText(/hatched clearance and uncertainty/i)).toBeTruthy();

    const values = screen.getByLabelText("Diagram values in text");
    expect(within(values).getByText("7 m (4 m depth + 2 m tide + 1 m bow height)")).toBeTruthy();
    expect(within(values).getByText("44.29 m, before clearance and uncertainty")).toBeTruthy();
  });

  it("uses responsive SVGs with readable labels and non-colour encodings", () => {
    const { container } = render(<AnchorGeometryVisuals />);
    const svgs = [...container.querySelectorAll("svg")];

    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg.classList.contains("w-full")).toBe(true);
      expect(svg.classList.contains("h-auto")).toBe(true);
      expect(svg.classList.contains("min-w-[42rem]")).toBe(true);
      expect(svg.querySelectorAll(".text-\\[14px\\]").length).toBeGreaterThan(0);
    }
    expect(screen.getByLabelText("Scrollable side-view diagram").classList.contains("overflow-x-auto")).toBe(true);
    expect(svgs[0].querySelector('[stroke-dasharray="10 6"]')).toBeTruthy();
    expect(svgs[1].querySelector("pattern")).toBeTruthy();
    expect(svgs[1].querySelectorAll("[stroke-dasharray]").length).toBeGreaterThanOrEqual(3);
  });
});
