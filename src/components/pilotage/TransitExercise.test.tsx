import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransitExercise } from "./TransitExercise";

describe("TransitExercise", () => {
  it("presents an observer sight-picture outcome and constrained water claim", () => {
    render(<TransitExercise onComplete={vi.fn()}/>);
    expect(screen.getByRole("img", {name:/observer sight picture/i})).toBeTruthy();
    expect(screen.getByText(/no claim beyond it/i)).toBeTruthy();
    expect(screen.getByText(/mastery requires all 3/i)).toBeTruthy();
  });

  it("gives explanatory feedback and requires retry after an incorrect side", () => {
    render(<TransitExercise onComplete={vi.fn()}/>);
    fireEvent.click(screen.getByRole("button", {name:"Front mark appears left"}));
    expect(screen.getByRole("status").textContent).toMatch(/not left.*again/i);
    expect(screen.queryByRole("button", {name:/next sight picture/i})).toBeNull();
    fireEvent.click(screen.getByRole("button", {name:"Marks are in line"}));
    expect(screen.getByRole("button", {name:/next sight picture/i})).toBeTruthy();
  });

  it("reports declared mastery only after every scenario is correct", () => {
    const complete = vi.fn();
    render(<TransitExercise onComplete={complete}/>);
    for (const label of ["Marks are in line","Front mark appears left","Front mark appears right"]) {
      fireEvent.click(screen.getByRole("button", {name:label}));
      fireEvent.click(screen.getByRole("button", {name:/next sight picture|complete mastery/i}));
    }
    expect(complete).toHaveBeenCalledWith({correctCount:3,totalExercises:3});
  });
});
