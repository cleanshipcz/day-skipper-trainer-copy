import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TransitExercise, TransitSightPicture } from "./TransitExercise";
import { TRANSIT_SCENARIOS } from "./transitScenarios";

describe("TransitExercise", () => {
  it("presents an observer sight-picture outcome and constrained water claim", () => {
    render(<TransitExercise onComplete={vi.fn()}/>);
    expect(screen.getByRole("img", {name:/observer sight picture/i})).toBeTruthy();
    expect(screen.getByText(/no clearance elsewhere/i)).toBeTruthy();
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

  it("derives the sight picture from alternate scenario dimensions", () => {
    const html = renderToStaticMarkup(<TransitSightPicture scenario={{...TRANSIT_SCENARIOS[0],chartWidth:320,chartHeight:200}}/>);
    expect(html).toContain('viewBox="0 0 320 200"');
    expect(html).toContain('width="320"');
    expect(html).not.toContain("600");
    expect(html).not.toContain("400");
    const svgEnd = html.indexOf("</svg>");
    const qualification = html.indexOf("Assessment applies only");
    expect(qualification).toBeGreaterThan(svgEnd);
    expect(html).toContain("whitespace-normal break-words");
    expect(html).toContain('aria-describedby="transit-safety-aligned"');
  });
});
