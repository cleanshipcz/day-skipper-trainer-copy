import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarineLpgInstallationGuide } from "./MarineLpgInstallationGuide";

describe("MarineLpgInstallationGuide", () => {
  it("provides an accessible annotated installation schematic", () => {
    render(<MarineLpgInstallationGuide />);
    const diagram = screen.getByRole("img", { name: /annotated example marine LPG installation arrangement/i });
    expect(diagram.getAttribute("viewBox")).toBe("0 0 900 310");
    expect(screen.getByText(/secured upright vapour-withdrawal cylinder.*installation-specific secondary isolation.*separate labelled closing devices/i, { selector: "desc" })).toBeTruthy();
    expect(screen.getByText(/not a construction drawing/i)).toBeTruthy();
  });

  it("keeps a readable text-equivalent sequence beside the horizontally scrollable drawing", () => {
    render(<MarineLpgInstallationGuide />);
    const scroller = screen.getByLabelText("Scrollable example LPG installation drawing");
    expect(scroller.className).toContain("overflow-x-auto");
    expect(scroller.querySelector("svg")?.getAttribute("class")).toContain("min-w-[760px]");
    const sequence = screen.getByRole("list", { name: "Installation sequence in text" });
    expect(sequence.textContent).toMatch(/cylinder valve is the main supply isolation/i);
    expect(sequence.textContent).toMatch(/secondary tap or solenoid exists only where the installation provides one/i);
    expect(sequence.textContent).toMatch(/separate branch and closing device for each appliance/i);
    expect(sequence.textContent).toMatch(/fixed ventilation kept clear/i);
  });

  it("renders practical routines separately from competent and regulated work", () => {
    render(<MarineLpgInstallationGuide />);
    expect(screen.getByRole("heading", { name: "Practical pre-use checklist" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Practical shutdown checklist" })).toBeTruthy();
    expect(screen.getByText(/Competent-person work:/).parentElement?.textContent).toMatch(/installs or alters.*pressure\/tightness testing/i);
    expect(screen.getByText(/Rented and in-scope boats:/).parentElement?.textContent).toMatch(/Gas Safe registered engineer.*Gas Safety Record/i);
  });
});
