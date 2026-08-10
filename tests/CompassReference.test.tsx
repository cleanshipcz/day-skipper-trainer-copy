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

  it("contains both conversion directions, wraparound, and separate navigation definitions", () => {
    render(<CompassReference />);
    expect(screen.getByRole("heading", { name: /Worked C→M→T/ })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Worked T→M→C/ })).toBeDefined();
    expect(screen.getAllByText(/−3° →/)).toHaveLength(2);
    expect(screen.queryByText(/course or heading/i)).toBeNull();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /heading.*direction in which the vessel’s bow points/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /course to steer.*heading-to-maintain/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /Course made good.*actual direction of travel over the ground/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /Wind and current.*desired track.*differ from the heading to steer/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /true CTS.*T→M→C.*compass CTS is the compass heading\/course the helm maintains/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /deviation card is indexed by the current estimated or actual compass heading/i.test(node.textContent ?? ""))).toBeDefined();
    expect(screen.getByText((_, node) => node?.tagName === "P" && /Never index.*unconverted true or magnetic plotted course, CTS, or course made good/i.test(node.textContent ?? ""))).toBeDefined();
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
    expect(screen.getByRole("link", { name: /NOAA.*revision 02 August 2026.*paragraphs 134–135/ })).toBeDefined();
    expect(screen.getByText(/Accessed 9 August 2026.*revision 02 August 2026.*paragraphs 134–135/i)).toBeDefined();
  });
});
