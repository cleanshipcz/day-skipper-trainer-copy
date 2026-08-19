import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GasLockerDrainDiagram } from "./GasLockerDrainDiagram";

describe("GasLockerDrainDiagram", () => {
  it("pairs a responsive correct-versus-incorrect diagram with a complete text alternative", () => {
    render(<GasLockerDrainDiagram />);
    const diagram = screen.getByRole("img", { name: /Correct and incorrect LPG locker drain arrangements/i });
    expect(diagram.getAttribute("viewBox")).toBe("0 0 760 360");
    expect(screen.getByText(/unobstructed pipe falls continuously.*at least 75 millimetres above/i, { selector: "desc" })).toBeTruthy();
    expect(screen.getByText(/Correct:/).parentElement?.textContent).toMatch(/continuously falling.*75 mm above.*away from hull openings/i);
    expect(screen.getByText(/Incorrect:/).parentElement?.textContent).toMatch(/obstructed.*below the waterline/i);
  });

  it("anchors the 75 mm dimension between the outlet and at-rest waterline elevations", () => {
    render(<GasLockerDrainDiagram />);

    expect(screen.getByTestId("correct-drain-outlet").getAttribute("cy")).toBe("220");
    expect(screen.getByTestId("correct-waterline").getAttribute("d")).toBe("M35 250H345");
    const dimensionPaths = screen.getByTestId("outlet-clearance-dimension").querySelectorAll("path");
    expect(dimensionPaths[0].getAttribute("d")).toBe("M290 220H318M290 250H318");
    expect(dimensionPaths[1].getAttribute("d")).toBe("M310 220V250M302 220H318M302 250H318");
    expect(screen.getByTestId("outlet-clearance-label").getAttribute("y")).toBe("241");
    expect(screen.getByTestId("outlet-clearance-label").textContent).toContain("≥ 75 mm");
  });
});
