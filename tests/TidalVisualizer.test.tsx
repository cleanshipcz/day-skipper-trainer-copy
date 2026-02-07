import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TidalVisualizer from "@/components/navigation/TidalVisualizer";

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
});
