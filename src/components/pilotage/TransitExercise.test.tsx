import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it.each([375, 768, 1280])("keeps a scalable graphic and 44px controls at %ipx", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const { container } = render(<TransitExercise onComplete={vi.fn()}/>);
    expect(screen.getByRole("img", {name:/observer sight picture/i}).getAttribute("viewBox")).toBe("0 0 600 400");
    expect(container.querySelector(".min-h-11")).toBeTruthy();
    expect((container.querySelector('[style*="touch-action"]') as HTMLElement).style.touchAction).toBe("pan-y pinch-zoom");
  });

  it("announces feedback, then tabs forward into the retry choices", async () => {
    const user = userEvent.setup();
    render(<TransitExercise onComplete={vi.fn()}/>);
    const choice = screen.getByRole("button", {name:"Front mark appears left"});
    choice.focus();
    await user.keyboard("{Enter}");
    const status = screen.getByRole("status");
    expect(document.activeElement).toBe(status);
    expect(choice.getAttribute("aria-pressed")).toBe("true");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.compareDocumentPosition(screen.getByRole("button", {name:"Front mark appears left"})) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", {name:"Front mark appears left"}));
  });

  it("captures a touch swipe and ignores cancelled gestures", () => {
    const { container } = render(<TransitExercise onComplete={vi.fn()}/>);
    const surface = container.querySelector('[style*="touch-action"]') as HTMLDivElement;
    let captured:number|null = null;
    surface.setPointerCapture = vi.fn(id => { captured = id; });
    surface.hasPointerCapture = vi.fn(id => captured === id);
    surface.releasePointerCapture = vi.fn(() => { captured = null; });

    fireEvent.pointerDown(surface, {pointerId:3,pointerType:"touch",isPrimary:true,clientX:120,clientY:80});
    fireEvent.pointerCancel(surface, {pointerId:3,pointerType:"touch",isPrimary:true,clientX:20,clientY:80});
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.pointerDown(surface, {pointerId:4,pointerType:"touch",isPrimary:true,clientX:120,clientY:80});
    fireEvent.pointerUp(surface, {pointerId:4,pointerType:"touch",isPrimary:true,clientX:20,clientY:82});
    expect(screen.getByRole("status").textContent).toMatch(/not left/i);
  });

  it("describes each rendered mark relationship without adding a navigation conclusion", () => {
    const descriptions = TRANSIT_SCENARIOS.map(scenario => {
      const html = renderToStaticMarkup(<TransitSightPicture scenario={scenario}/>);
      return html.match(/<desc[^>]*>(.*?)<\/desc>/)?.[1];
    });
    expect(descriptions).toEqual([
      "A nearer red front mark and a farther purple rear mark. In this sight picture, marks are in line.",
      "A nearer red front mark and a farther purple rear mark. In this sight picture, front mark appears left.",
      "A nearer red front mark and a farther purple rear mark. In this sight picture, front mark appears right.",
    ]);
    expect(descriptions.join(" ")).not.toMatch(/safe|steer|alter/i);
  });
});
