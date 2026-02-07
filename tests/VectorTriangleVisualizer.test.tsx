import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VectorTriangleVisualizer } from "@/components/navigation/VectorTriangleVisualizer";

describe("VectorTriangleVisualizer Component", () => {
  it("renders with valid inputs", () => {
    // Valid Scenario: Boat Speed 5kn, Tide 2kn, going East (90), Tide South (180).
    // Should be solvable.
    render(
      <VectorTriangleVisualizer
        waterTrackHeading={0}
        waterTrackSpeed={5}
        groundTrackHeading={90}
        tideSet={180}
        tideRate={2}
      />
    );

    // Check if results are displayed
    expect(screen.getByText(/CTS \(Heading\):/i)).toBeDefined();
    expect(screen.getByText(/Ground Track/i)).toBeDefined();
    expect(screen.getByText("Water Track")).toBeDefined();
  });

  it("handles impossible scenarios gracefully", () => {
    // Impossible: Tide 6kn, Boat 2kn, trying to go UP stream directly.
    render(
      <VectorTriangleVisualizer
        waterTrackHeading={0}
        waterTrackSpeed={2}
        groundTrackHeading={0} // North
        tideSet={180} // South (Against)
        tideRate={6}
      />
    );

    expect(screen.getByText(/Impossible scenario!/i)).toBeDefined();
  });
});
