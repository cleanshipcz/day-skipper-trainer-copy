// @vitest-environment jsdom
import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FogTheory from "./FogTheory";
import { FOG_SCENARIO_GATE } from "@/features/weather/fogScenarioCompletion";

const mocks = vi.hoisted(() => ({ gate: { canComplete: false, visitedSectionIds: [] as string[], isHydrated: true, isCompletionDurable: false, loadState: "ready", saveState: "idle", markSectionVisited: vi.fn(), markCompleted: vi.fn(async () => true), retryLoad: vi.fn(), retrySave: vi.fn() }, useGate: vi.fn() }));
vi.mock("@/features/progress/useTheoryCompletionGate", () => ({ useTheoryCompletionGate: (args: unknown) => { mocks.useGate(args); return mocks.gate; } }));
vi.mock("@/components/weather/WeatherTheoryLayout", () => ({ WeatherTheoryLayout: ({ children, completionControl }: { children: ReactNode; completionControl: ReactNode }) => <main>{children}{completionControl}</main> }));
vi.mock("@/components/weather/FogScenarioPractice", () => ({ FogScenarioPractice: ({ completedIds, enabled, onComplete }: { completedIds: string[]; enabled: boolean; onComplete: (id: string) => void }) => <div data-testid="practice" data-completed={completedIds.join(",")} data-enabled={enabled}><button onClick={() => onComplete("forecast-recognition")}>Pass scenario</button></div> }));

describe("FogTheory completion evidence", () => {
  beforeEach(() => { Object.assign(mocks.gate, { canComplete: false, visitedSectionIds: [], isHydrated: true, isCompletionDurable: false, loadState: "ready", saveState: "idle" }); mocks.gate.markSectionVisited.mockReset(); mocks.gate.markCompleted.mockReset(); mocks.gate.retryLoad.mockReset(); mocks.gate.retrySave.mockReset(); mocks.useGate.mockReset(); });

  it("uses revisioned fog evidence and explains the locked requirement", () => {
    render(<FogTheory />);
    expect(mocks.useGate).toHaveBeenCalledWith({ topicId: "weather-fog", catalogueRevision: FOG_SCENARIO_GATE.revision, requiredSectionIds: [...FOG_SCENARIO_GATE.scenarioIds], pointsOnComplete: 10, acceptLegacyCompleted: true, legacyQueuedCompletionStoragePrefix: "weather-theory-queued" });
    expect((screen.getByRole("button", { name: "Save Fog completion" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toMatch(/complete 5 more fog decision scenarios/i);
    fireEvent.click(screen.getByRole("button", { name: "Pass scenario" }));
    expect(mocks.gate.markSectionVisited).toHaveBeenCalledWith("forecast-recognition");
  });

  it("restores partial engagement and completes only once", () => {
    mocks.gate.visitedSectionIds = [...FOG_SCENARIO_GATE.scenarioIds]; mocks.gate.canComplete = true;
    const view = render(<FogTheory />);
    expect(screen.getByTestId("practice").getAttribute("data-completed")).toContain("rule-19-risk");
    fireEvent.click(screen.getByRole("button", { name: "Save Fog completion" }));
    expect(mocks.gate.markCompleted).toHaveBeenCalledTimes(1);
    mocks.gate.isCompletionDurable = true; mocks.gate.saveState = "saved"; view.rerender(<FogTheory />);
    const saved = screen.getByRole("button", { name: "Completion saved" });
    expect((saved as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(saved);
    expect(mocks.gate.markCompleted).toHaveBeenCalledTimes(1);
  });

  it("blocks evidence after load failure and exposes retry", () => {
    mocks.gate.loadState = "failed";
    render(<FogTheory />);
    expect(screen.getByTestId("practice").getAttribute("data-enabled")).toBe("false");
    expect(screen.getByRole("status").textContent).toMatch(/could not be loaded/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry loading progress" }));
    expect(mocks.gate.retryLoad).toHaveBeenCalledTimes(1);
  });
});
