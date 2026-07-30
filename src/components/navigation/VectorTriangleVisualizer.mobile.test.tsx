import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VectorTriangleVisualizer } from "./VectorTriangleVisualizer";

describe("VectorTriangleVisualizer mobile interaction", () => {
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
