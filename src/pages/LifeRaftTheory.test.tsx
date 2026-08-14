import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TestRouter from "../../tests/TestRouter";
import { LIFE_RAFT_REVIEW_BASIS, type LifeRaftReleaseReview } from "@/data/lifeRaftProcedures";
import LifeRaftTheory from "./LifeRaftTheory";

vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgress: vi.fn() }) }));
vi.mock("@/components/safety/AbandonShipSortingGame", () => ({ AbandonShipSortingGame: () => <div>Abandon ship drill</div> }));
const approved: LifeRaftReleaseReview = { reviewed: true, reviewerName: "Survival craft reviewer", reviewerQualification: "Qualified marine survival-craft specialist", approvalDate: "2026-08-12", sourceEvidence: [...LIFE_RAFT_REVIEW_BASIS] };

describe("LifeRaftTheory release control", () => {
  it("fails closed without qualified review evidence", () => {
    render(<TestRouter><LifeRaftTheory /></TestRouter>);
    expect(screen.getByTestId("life-raft-release-gate")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Mark as Complete" })).toBeNull();
  });
  it("renders corrected guidance after complete review evidence", () => {
    render(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    expect(screen.getByRole("heading", { name: "Life Raft & Abandon Ship" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mark as Complete" })).toBeTruthy();
  });
});
