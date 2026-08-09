import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CompassReference, { COMPASS_SOURCES } from "@/components/navigation/CompassReference";

describe("CompassReference", () => {
  it("defines variation and deviation with their correct directions and indexes", () => {
    render(<CompassReference />);
    expect(screen.getByText((_, node) => node?.tagName === "P" && /Variation.*angle between true and magnetic north/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /Deviation.*error produced by the vessel’s magnetic fields/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "LI" && /Index the card by compass heading/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /east is positive \(\+\), west is negative/i.test(node.textContent ?? ""))).toBeDefined();
  });

  it("contains both conversion directions, wraparound, and course/bearing definitions", () => {
    render(<CompassReference />);
    expect(screen.getByRole("heading", { name: /Worked C→M→T/ })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Worked T→M→C/ })).toBeDefined();
    expect(screen.getAllByText(/−3° →/)).toHaveLength(2);
    expect(screen.getByText((_, node) => node?.tagName === "P" && /course or heading/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /bearing.*direction from the observer to an object/i.test(node.textContent ?? ""))).toBeDefined();
  });

  it("links dated authoritative sources and gives accessible visual equivalents", () => {
    render(<CompassReference />);
    expect(screen.getByRole("img", { name: /Nautical chart compass rose/ })).toBeDefined();
    expect(screen.getByRole("img", { name: /Example vessel deviation curve/ })).toBeDefined();
    for (const source of COMPASS_SOURCES) {
      expect(screen.getByRole("link", { name: source.label }).getAttribute("href")).toBe(source.href);
      expect(source.label).toMatch(/20\d{2}/);
    }
  });
});
