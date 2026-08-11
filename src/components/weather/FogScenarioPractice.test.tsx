// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FogScenarioPractice, fogScenarios } from "./FogScenarioPractice";

describe("FogScenarioPractice", () => {
  it("requires a choice, gives diagnostic feedback and supports retry", () => {
    const complete = vi.fn();
    render(<FogScenarioPractice completedIds={[]} enabled onComplete={complete} />);
    fireEvent.click(screen.getByRole("button", { name: "Check decision" }));
    expect(screen.getByRole("status").textContent).toMatch(/choose an action/i);
    fireEvent.click(screen.getByRole("radio", { name: /depart because/i }));
    fireEvent.click(screen.getByRole("button", { name: "Check decision" }));
    expect(screen.getByRole("alert").textContent).toMatch(/review:.*advection-fog risk/i);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry scenario" }));
    expect(screen.getByRole("status").textContent).toMatch(/choose a different action/i);
    fireEvent.click(screen.getByRole("radio", { name: /delay and obtain/i }));
    fireEvent.click(screen.getByRole("button", { name: "Check decision" }));
    expect(complete).toHaveBeenCalledWith("forecast-recognition");
  });

  it("covers all five decisions without leaking answers in navigation or visual labels", () => {
    render(<FogScenarioPractice completedIds={[]} enabled onComplete={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /^Scenario \d$/ })).toHaveLength(5);
    fogScenarios.forEach((scenario, index) => {
      fireEvent.click(screen.getByRole("button", { name: `Scenario ${index + 1}` }));
      expect(screen.getByRole("heading", { name: new RegExp(scenario.title) })).toBeTruthy();
      expect(screen.getByRole("img", { name: /Operational situation diagram.*Diagram meaning:/ })).toBeTruthy();
      expect(screen.getByRole("img").getAttribute("aria-labelledby")).not.toMatch(/correct|answer/i);
    });
    const captions = fogScenarios.map(({ visual }) => visual.caption).join(" ");
    expect(captions).toContain("intermittent echo");
    expect(captions).toContain("successively shorter ranges");
    expect(captions).not.toMatch(/does not prove|cannot dismiss|collision risk|act early|safe speed|reduce speed|avoid port/i);
  });

  it("restores completed evidence, disables repeat input and remains responsive", () => {
    const { container } = render(<FogScenarioPractice completedIds={["forecast-recognition", "visibility-loss"]} enabled onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Scenario 1 — complete" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Scenario 1 — complete" }));
    const group = screen.getByRole("group", { name: /defensible departure/i });
    expect(group.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toMatch(/scenario complete/i);
    expect(container.querySelector(".grid.min-w-0")).toBeTruthy();
    expect(container.querySelector(".flex.flex-col.gap-2.sm\\:flex-row")).toBeTruthy();
    expect(container.querySelector(".forced-colors\\:border-\\[CanvasText\\]")).toBeTruthy();
  });

  it("blocks interaction while persistence is unavailable", () => {
    const complete = vi.fn();
    render(<FogScenarioPractice completedIds={[]} enabled={false} onComplete={complete} />);
    expect(screen.getByRole("group").hasAttribute("disabled")).toBe(true);
    expect((screen.getByRole("button", { name: "Check decision" }) as HTMLButtonElement).disabled).toBe(true);
    expect(complete).not.toHaveBeenCalled();
  });
});
