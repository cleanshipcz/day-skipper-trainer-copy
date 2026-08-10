import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgress: vi.fn() }) }));

import PilotagePlan from "./PilotagePlan";

describe("PilotagePlan print presentation", () => {
  it("hides route navigation and introductory chrome while retaining the cockpit plan", () => {
    render(<MemoryRouter><PilotagePlan /></MemoryRouter>);
    expect(screen.getByTestId("pilotage-route-header").className).toContain("print:hidden");
    expect(screen.getByTestId("pilotage-plan-intro").className).toContain("print:hidden");
    expect(screen.getByTestId("print-cockpit-plan").className).toContain("print:block");
    expect(screen.getByTestId("print-cockpit-plan").querySelectorAll("button, input, textarea")).toHaveLength(0);
  });
});
