import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("provides a non-visual drill equivalent, withholds the result, and resets keyboard panning", () => {
    render(<VectorTriangleVisualizer waterTrackHeading={180} waterTrackSpeed={5} groundTrackHeading={0} tideSet={90} tideRate={2} mode="drill" drillTarget={0} showDrillResult={false} />);
    const diagram = screen.getByRole("img");
    expect(diagram.getAttribute("aria-label")).toContain("result is hidden");
    expect(screen.queryByText("Ground Track")).toBeNull();
    fireEvent.keyDown(diagram, { key: "ArrowLeft" });
    expect(screen.getByRole("status").textContent).toContain("10 horizontal");
    fireEvent.click(screen.getByRole("button", { name: "Reset diagram position" }));
    expect(screen.getByRole("status").textContent).toContain("0 horizontal");
  });

  it("keeps touch scrolling by default and enables deliberate two-dimensional touch panning", () => {
    render(<VectorTriangleVisualizer waterTrackHeading={0} waterTrackSpeed={5} groundTrackHeading={90} tideSet={180} tideRate={2} />);
    const diagram = screen.getByRole("img");
    expect(diagram.getAttribute("class")).toContain("touch-pan-y");
    fireEvent.pointerDown(diagram, { pointerId: 1, pointerType: "touch", clientX: 10, clientY: 10 });
    fireEvent.pointerMove(diagram, { pointerId: 1, pointerType: "touch", clientX: 60, clientY: 70 });
    expect(screen.getByRole("status").textContent).toContain("0 horizontal, 0 vertical");

    const toggle = screen.getByRole("button", { name: "Pan diagram by touch" });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(diagram.getAttribute("class")).toContain("touch-none");
    fireEvent.pointerDown(diagram, { pointerId: 2, pointerType: "touch", clientX: 10, clientY: 10 });
    fireEvent.pointerMove(diagram, { pointerId: 2, pointerType: "touch", clientX: 60, clientY: 70 });
    expect(screen.getByRole("status").textContent).toContain("50 horizontal, 60 vertical");
    fireEvent.pointerUp(diagram, { pointerId: 2, pointerType: "touch", clientX: 60, clientY: 70 });
  });
});
