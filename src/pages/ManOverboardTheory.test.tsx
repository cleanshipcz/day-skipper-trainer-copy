import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TestRouter from "../../tests/TestRouter";
import ManOverboardTheory from "./ManOverboardTheory";
import type { MobTheoryReleaseReview } from "@/data/mobGuidance";

vi.mock("@/components/safety/MOBSortingGame", () => ({ MOBSortingGame: () => <div data-testid="mob-sorting-game" /> }));

const approved: MobTheoryReleaseReview = {
  seamanshipReviewer: "Qualified examiner",
  seamanshipQualification: "RYA Yachtmaster Instructor",
  medicalReviewer: "Clinical reviewer",
  medicalQualification: "Registered emergency clinician",
  approvalDate: "2026-08-12",
  sourceEvidence: ["RYA MOB", "MCA MGN 570", "Resuscitation Council UK 2025"],
};

describe("ManOverboardTheory", () => {
  it("fails closed until both seamanship and medical review evidence exists", () => {
    render(<TestRouter><ManOverboardTheory /></TestRouter>);
    expect(screen.getByTestId("mob-theory-release-gate")).toBeDefined();
    expect(screen.queryByRole("tab", { name: /immediate actions/i })).toBeNull();
  });

  it("publishes the reviewed recovery model, distress template and stable handoff", async () => {
    const user = userEvent.setup();
    render(<TestRouter><ManOverboardTheory releaseReview={approved} /></TestRouter>);
    expect(screen.getAllByRole("button", { name: /back to safety menu/i })).toHaveLength(2);
    expect(screen.getByText(/control and delegate concurrently/i)).toBeDefined();
    expect(screen.getByText(/single-handed sailor/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /distress call/i }));
    expect(screen.getByText(/MAYDAY, MAYDAY, MAYDAY/i)).toBeDefined();
    expect(screen.getByText(/DSC distress alert as instructed/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /maneuvers/i }));
    expect(screen.getByRole("img", { name: /decision flow/i })).toBeDefined();
    expect(screen.getByText(/not a universal return/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /recovery/i }));
    expect(screen.getByText(/rated lifting point/i)).toBeDefined();
    expect(screen.getByText(/support the airway/i)).toBeDefined();
    expect(screen.getByText("propeller-exclusion")).toBeDefined();
    expect(screen.getByText(/Resuscitation Council UK/i)).toBeDefined();
  });
});
