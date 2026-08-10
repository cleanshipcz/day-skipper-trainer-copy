// @vitest-environment jsdom
import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WeatherForecastsTheory from "./WeatherForecastsTheory";
import { MARINE_FORECAST_GATE } from "@/features/weather/marineForecastCompletion";

const mocks = vi.hoisted(() => ({
  gate: {
    canComplete: false,
    visitedSectionIds: [] as string[],
    isHydrated: true,
    isCompletionDurable: false,
    saveState: "idle",
    markSectionVisited: vi.fn(),
    markCompleted: vi.fn(async () => true),
  },
  useGate: vi.fn(),
}));

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({ useTheoryCompletionGate: (args: unknown) => { mocks.useGate(args); return mocks.gate; } }));
vi.mock("@/components/weather/WeatherTheoryLayout", () => ({
  WeatherTheoryLayout: ({ sections, children, completionControl }: { sections: { title: string; body: ReactNode }[]; children: ReactNode; completionControl: ReactNode }) => <main>{sections.map(({ title, body }) => <section key={title}><h2>{title}</h2>{body}</section>)}{children}{completionControl}</main>,
}));
vi.mock("@/components/weather/ForecastAreaMap", () => ({ ForecastAreaMap: ({ onGuidedComplete }: { onGuidedComplete: () => void }) => <button onClick={onGuidedComplete}>Finish guided geography test</button> }));

describe("Marine Forecasts completion gate", () => {
  beforeEach(() => {
    mocks.gate.canComplete = false;
    mocks.gate.visitedSectionIds = [];
    mocks.gate.isHydrated = true;
    mocks.gate.isCompletionDurable = false;
    mocks.gate.saveState = "idle";
    mocks.gate.markSectionVisited.mockReset();
    mocks.gate.markCompleted.mockReset();
    mocks.gate.markCompleted.mockResolvedValue(true);
    mocks.useGate.mockReset();
  });

  it("rejects immediate completion and explains every remaining requirement", () => {
    render(<WeatherForecastsTheory />);
    const complete = screen.getByRole("button", { name: "Save Marine Forecasts completion" });
    expect((complete as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(complete);
    expect(mocks.gate.markCompleted).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toMatch(/Remaining: 6 forecast content sections; complete the guided geography exercise/i);
    expect(mocks.useGate).toHaveBeenCalledWith(expect.objectContaining({
      topicId: "weather-forecasts",
      catalogueRevision: MARINE_FORECAST_GATE.revision,
      requiredSectionIds: [...MARINE_FORECAST_GATE.contentSections, MARINE_FORECAST_GATE.guidedCheck],
      pointsOnComplete: 10,
    }));
  });

  it("records only explicit section and guided evidence, then unlocks once", () => {
    const view = render(<WeatherForecastsTheory />);
    const reviewButtons = screen.getAllByRole("button", { name: "Record this section as reviewed" });
    expect(reviewButtons).toHaveLength(6);
    reviewButtons.forEach((button) => fireEvent.click(button));
    expect(mocks.gate.markSectionVisited.mock.calls.map(([id]) => id)).toEqual([...MARINE_FORECAST_GATE.contentSections]);
    fireEvent.click(screen.getByRole("button", { name: "Finish guided geography test" }));
    expect(mocks.gate.markSectionVisited).toHaveBeenLastCalledWith(MARINE_FORECAST_GATE.guidedCheck);

    mocks.gate.visitedSectionIds = [...MARINE_FORECAST_GATE.contentSections, MARINE_FORECAST_GATE.guidedCheck];
    mocks.gate.canComplete = true;
    view.rerender(<WeatherForecastsTheory />);
    fireEvent.click(screen.getByRole("button", { name: "Save Marine Forecasts completion" }));
    expect(mocks.gate.markCompleted).toHaveBeenCalledTimes(1);

    mocks.gate.isCompletionDurable = true;
    view.rerender(<WeatherForecastsTheory />);
    const saved = screen.getByRole("button", { name: "Completion saved" });
    expect((saved as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(saved);
    expect(mocks.gate.markCompleted).toHaveBeenCalledTimes(1);
  });

  it("renders restored account/topic-scoped partial evidence after reload", () => {
    mocks.gate.visitedSectionIds = [MARINE_FORECAST_GATE.contentSections[0], MARINE_FORECAST_GATE.contentSections[1], MARINE_FORECAST_GATE.guidedCheck];
    render(<WeatherForecastsTheory />);
    expect(screen.getAllByRole("button", { name: "Section reviewed" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Record this section as reviewed" })).toHaveLength(4);
    expect(screen.getByRole("status").textContent).toMatch(/Remaining: 4 forecast content sections; guided geography check complete/i);
  });
});
