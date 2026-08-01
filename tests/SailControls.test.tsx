import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SailControls from "../src/pages/SailControls";
import TestRouter from "./TestRouter";

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress: vi.fn() }),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("SailControls schematic geometry", () => {
  it("aligns the jib luff, halyard, and aft-running sheet/fairlead route with the forestay", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jib = container.querySelector('[data-geometry="jib"]');
    const forestay = container.querySelector('[data-geometry="forestay"]');
    const jibHalyard = container.querySelector('[data-control-id="jib-halyard"]');
    const jibSheet = container.querySelector('[data-control-id="jib-sheet"]');
    const fairlead = container.querySelector('[data-control-id="jib-fairlead"]');

    expect(jib?.getAttribute("d")).toBe("M306,78 L500,540 L410,440 Z");
    expect(forestay?.getAttribute("x1")).toBe("300");
    expect(forestay?.getAttribute("y1")).toBe("60");
    expect(forestay?.getAttribute("x2")).toBe("520");
    expect(forestay?.getAttribute("y2")).toBe("560");
    expect(jibHalyard?.querySelector("line")?.getAttribute("x1")).toBe("306");
    expect(jibHalyard?.querySelector("line")?.getAttribute("y1")).toBe("78");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cx")).toBe("410");
    expect(jibSheet?.querySelector("circle")?.getAttribute("cy")).toBe("440");

    const sheetPoints = jibSheet
      ?.querySelector("[data-sheet-route]")
      ?.getAttribute("points")
      ?.split(" ")
      .map((point) => point.split(",").map(Number));
    const fairleadX = Number(fairlead?.querySelector("[data-fairlead-route]")?.getAttribute("x1"));
    const winchX = Number(fairlead?.querySelector("[data-fairlead-route]")?.getAttribute("x2"));

    expect(sheetPoints).toHaveLength(3);
    expect(sheetPoints?.[0]).toEqual([410, 440]);
    expect(sheetPoints?.[1]?.[0]).toBe(fairleadX);
    expect(sheetPoints?.[2]?.[0]).toBe(winchX);
    expect(sheetPoints?.[0]?.[0]).toBeGreaterThan(fairleadX);
    expect(fairleadX).toBeGreaterThan(winchX);
  });

  it("preserves mobile scale and provides effective touch targets for every diagram control", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const schematic = container.querySelector('[data-schematic-scroll] svg');
    const touchTargets = container.querySelectorAll("[data-touch-target]");

    expect(container.querySelector("[data-schematic-scroll]")?.classList.contains("overflow-x-auto")).toBe(true);
    expect(schematic?.classList.contains("min-w-[600px]")).toBe(true);
    expect(touchTargets).toHaveLength(12);
    touchTargets.forEach((target) => {
      expect(Number(target.getAttribute("width"))).toBeGreaterThanOrEqual(44);
      expect(Number(target.getAttribute("height"))).toBeGreaterThanOrEqual(44);
      expect(target.getAttribute("fill")).toBe("transparent");
    });
  });

  it("keeps touch, click, and highlight behavior on the relocated sheet and fairlead", () => {
    const { container } = render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const jibSheet = container.querySelector<SVGGElement>('[data-control-id="jib-sheet"]');
    const fairleadTarget = container.querySelector<SVGRectElement>('[data-touch-target="jib-fairlead"]');
    const mainHalyard = container.querySelector('[data-touch-target="main-halyard"]')?.parentElement;

    expect(jibSheet).not.toBeNull();
    expect(fairleadTarget).not.toBeNull();
    fireEvent.mouseEnter(jibSheet!);
    expect(jibSheet?.getAttribute("opacity")).toBe("1");
    expect(mainHalyard?.getAttribute("opacity")).toBe("0.4");

    fireEvent.mouseLeave(jibSheet!);
    fireEvent.click(fairleadTarget!);
    expect(screen.getByText("Sets the angle of pull on the jib sheet")).toBeTruthy();
  });

  it("exposes distinct keyboard controls for the diagram and control list", () => {
    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    const diagramControls = screen.getAllByRole("button", { name: /details from diagram/i });
    const listControls = screen.getAllByRole("button", { name: /details from control list/i });
    expect(diagramControls).toHaveLength(12);
    expect(listControls).toHaveLength(12);

    const mainHalyard = screen.getByRole("button", { name: "Show Main Halyard details from diagram" });
    fireEvent.focus(mainHalyard);
    fireEvent.keyDown(mainHalyard, { key: "Enter" });
    expect(screen.getByText("Raises and lowers the mainsail")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close Main Halyard details" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close Main Halyard details" }));
    const jibHalyard = screen.getByRole("button", { name: "Show Jib Halyard details from control list" });
    fireEvent.keyDown(jibHalyard, { key: " " });
    expect(screen.getByText("Raises and lowers the headsail (jib/genoa)")).toBeTruthy();
  });

  it("provides named navigation and programmatic quiz progress and feedback", () => {
    render(
      <TestRouter>
        <SailControls />
      </TestRouter>
    );

    expect(screen.getByRole("button", { name: "Back to nautical terms" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    const progress = screen.getByRole("progressbar", { name: "Quiz progress" });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("0 of 12 questions completed");
    expect(screen.getByRole("status").textContent).toContain("Question 1 of 12");

    const answers = screen.getAllByRole("button").filter((button) =>
      ["Main Halyard", "Jib Halyard", "Mainsheet", "Jib Sheet", "Boom Vang", "Outhaul", "Cunningham", "Topping Lift", "Reefing Lines", "Mainsheet Traveller", "Jib Fairlead", "Backstay Adjuster"].includes(button.textContent ?? "")
    );
    fireEvent.click(answers[0]);
    expect(screen.getByRole("status").textContent).toMatch(/Correct|Incorrect/);
  });
});
