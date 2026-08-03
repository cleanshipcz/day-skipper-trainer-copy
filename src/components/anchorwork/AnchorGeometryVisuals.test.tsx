import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnchorGeometryVisuals } from "./AnchorGeometryVisuals";
import { scopeWorkedExample, swingWorkedExample } from "@/features/anchorwork/scopeCalculations";

const numberAttribute = (element: Element, name: string) => Number(element.getAttribute(name));

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
    expect(screen.getByLabelText("Scrollable plan-view diagram").classList.contains("overflow-x-auto")).toBe(true);
    expect(svgs[0].querySelector('[stroke-dasharray="10 6"]')).toBeTruthy();
    expect(svgs[1].querySelector("pattern")).toBeTruthy();
    expect(svgs[1].querySelectorAll("[stroke-dasharray]").length).toBeGreaterThanOrEqual(3);
  });

  it("keeps both diagrams' drawn coordinates reconciled with the reviewed fixtures", () => {
    render(<AnchorGeometryVisuals />);

    const rode = screen.getByTestId("scope-rode");
    const scale = numberAttribute(rode, "data-scale-pixels-per-metre");
    const dx = numberAttribute(rode, "x2") - numberAttribute(rode, "x1");
    const dy = numberAttribute(rode, "y2") - numberAttribute(rode, "y1");
    expect(Math.hypot(dx, dy) / scale).toBeCloseTo(scopeWorkedExample.assumptions.rodeLengthMetres, 1);

    const vertical = screen.getByTestId("maximum-vertical-distance");
    const drawnVerticalMetres = Math.abs(numberAttribute(vertical, "y2") - numberAttribute(vertical, "y1")) / scale;
    expect(drawnVerticalMetres).toBeCloseTo(scopeWorkedExample.maximumVerticalDistanceMetres, 6);
    expect(scopeWorkedExample.assumptions.rodeLengthMetres / drawnVerticalMetres).toBeCloseTo(scopeWorkedExample.ratio, 6);

    const horizontal = screen.getByTestId("horizontal-rode-reach");
    const drawnHorizontalMetres = Math.abs(numberAttribute(horizontal, "x2") - numberAttribute(horizontal, "x1")) / scale;
    expect(drawnHorizontalMetres).toBeCloseTo(swingWorkedExample.horizontalRodeReachMetres, 1);

    const swing = screen.getByTestId("swing-radius");
    const planScale = numberAttribute(swing, "data-scale-pixels-per-metre");
    expect(numberAttribute(swing, "r") / planScale).toBeCloseTo(swingWorkedExample.approximateSwingRadiusMetres, 1);
  });
});
