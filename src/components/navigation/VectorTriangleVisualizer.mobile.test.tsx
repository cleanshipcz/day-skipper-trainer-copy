import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VectorTriangleVisualizer } from "./VectorTriangleVisualizer";

describe("VectorTriangleVisualizer mobile interaction", () => {
  it("renders the shared solver result and suppresses stale output when infeasible", () => {
    const { rerender } = render(<VectorTriangleVisualizer waterTrackHeading={0} waterTrackSpeed={6} groundTrackHeading={90} tideSet={180} tideRate={2} />);
    expect(screen.getByText("71°T")).toBeTruthy();
    expect(screen.getByText("5.7 kn")).toBeTruthy();

    rerender(<VectorTriangleVisualizer waterTrackHeading={0} waterTrackSpeed={5} groundTrackHeading={0} tideSet={90} tideRate={6} />);
    expect(screen.getByText("Impossible scenario!")).toBeTruthy();
    expect(screen.queryByText("71°T")).toBeNull();
  });

  it("supports pointer dragging and keyboard panning without losing accessible semantics", () => {
    render(<VectorTriangleVisualizer waterTrackHeading={90} waterTrackSpeed={5} groundTrackHeading={100} tideSet={180} tideRate={1} />);
    const diagram = screen.getByRole("img", { name: /vector triangle/i });

    fireEvent.pointerDown(diagram, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(diagram, { pointerId: 1, clientX: 130, clientY: 120 });
    fireEvent.pointerUp(diagram, { pointerId: 1 });
    fireEvent.keyDown(diagram, { key: "ArrowRight" });

    expect(diagram.getAttribute("tabindex")).toBe("0");
    expect(diagram.querySelector("g")?.getAttribute("transform")).toBe("translate(20, 20)");
  });
});
