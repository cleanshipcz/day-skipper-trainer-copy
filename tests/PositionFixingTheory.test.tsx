import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PositionFixingTheory from "../src/pages/PositionFixingTheory";
import TestRouter from "./TestRouter";

vi.mock("@/components/navigation/unified/UnifiedChartTable", () => ({ default: () => <div data-testid="chart-table" /> }));

const gate = vi.hoisted(() => ({ markCompleted: vi.fn(), markSectionVisited: vi.fn() }));
vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: () => ({ canComplete: false, isHydrated: true, saveState: "idle", ...gate }),
}));

describe("PositionFixingTheory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("teaches a traceable observation, correction and reciprocal plotting sequence", () => {
    render(<TestRouter><PositionFixingTheory /></TestRouter>);
    expect(screen.getByRole("button", { name: "Back to Navigation from Position Fixing" })).toBeDefined();
    expect(screen.getByText(/exact time and log reading/i)).toBeDefined();
    expect(screen.getByText(/073°C \+ 2° = 075°M/i)).toBeDefined();
    expect(screen.getByText(/direction from the vessel to the light is 071°T/i)).toBeDefined();
    expect(screen.getByText("251°T")).toBeDefined();
    expect(screen.getByText(/annotate the fix with a circle and time/i)).toBeDefined();
  });

  it("corrects cocked-hat safety and explains geometry-dependent uncertainty", () => {
    render(<TestRouter><PositionFixingTheory /></TestRouter>);
    expect(screen.getByRole("heading", { name: /does not prove you are inside/i })).toBeDefined();
    expect(screen.getByText(/wrong variation, biased compass/i)).toBeDefined();
    expect(screen.getByText(/hazard-side conservative position/i)).toBeDefined();
    expect(screen.getByText(/LOPs crossing at 15°/i)).toBeDefined();
    expect(screen.getByText(/at 10 NM it is roughly ±0.35 NM/i)).toBeDefined();
  });

  it("includes worked coordinates, DR/EP and risk-based monitoring", () => {
    render(<TestRouter><PositionFixingTheory /></TestRouter>);
    expect(screen.getByText(/50° 45.5′ N, 001° 30.2′ W/)).toBeDefined();
    expect(screen.getByText(/horizontal datum.*datum shift/i)).toBeDefined();
    expect(screen.getByText(/steer 090°T at 5 kn for 2 hours/i)).toBeDefined();
    expect(screen.getByText(/apply a 2 NM south-going vector/i)).toBeDefined();
    expect(screen.getByText(/Offshore in stable conditions.*near hazards/i)).toBeDefined();
    expect(screen.getByText(/Cross-check visual bearings with a transit/i)).toBeDefined();
  });

  it("links current authoritative teaching sources", () => {
    render(<TestRouter><PositionFixingTheory /></TestRouter>);
    expect(screen.getByRole("link", { name: /IHO S-4, edition 4.10.0/i }).getAttribute("href")).toContain("S-4%20Ed%204.10.0_FINAL.pdf");
    expect(screen.getByRole("link", { name: /MCA MGN 379/i })).toBeDefined();
  });
});
