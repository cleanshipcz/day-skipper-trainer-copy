import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RawLifeRaftTheory from "../src/pages/LifeRaftTheory";
import { LIFE_RAFT_REVIEW_BASIS } from "../src/data/lifeRaftProcedures";
import TestRouter from "./TestRouter";

// Mock the sorting game component to isolate theory page tests.
vi.mock("@/components/safety/AbandonShipSortingGame", () => ({
  AbandonShipSortingGame: ({ onReviewTheory }: { onReviewTheory?: () => void }) => (
    <div data-testid="abandon-ship-sorting-game">Sorting Game Mock<button onClick={onReviewTheory}>Review the life-raft procedures theory</button></div>
  ),
}));

const mockSaveProgress = vi.fn();
const mockLoadProgress = vi.fn().mockResolvedValue({ status: "missing", record: null });

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: mockSaveProgress,
    saveProgressDetailed: mockSaveProgress,
    loadProgressDetailed: mockLoadProgress,
    ownerId: null,
  }),
}));

const approvedReview = { reviewed: true, reviewerName: "Survival craft reviewer", reviewerQualification: "Qualified marine survival-craft specialist", approvalDate: "2026-08-12", sourceEvidence: [...LIFE_RAFT_REVIEW_BASIS] } as const;
const LifeRaftTheory = () => <RawLifeRaftTheory releaseReview={approvedReview} />;

describe("LifeRaftTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page header with title and navigation back button", () => {
    // when
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // then
    expect(screen.getByText("Life Raft & Abandon Ship")).toBeDefined();
    // - header has an icon back button with aria-label="back"
    expect(screen.getByLabelText("back")).toBeDefined();
  });

  it("should render tab navigation with all required theory sections", () => {
    // when
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // then - tabs for all required content areas per AC-1
    expect(screen.getByRole("tab", { name: /when to abandon/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /raft types/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /solas pack/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /deployment/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /drill/i })).toBeDefined();
  });

  it("should display 'when to abandon ship' content in the default tab", () => {
    // when
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // then - abandon ship theory content
    expect(screen.getByText(/When to Abandon Ship/)).toBeDefined();
  });

  it("should display life raft types when clicking the Raft Types tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const raftTypesTab = screen.getByRole("tab", { name: /raft types/i });
    await user.click(raftTypesTab);

    // then
    expect(await screen.findByText(/Life Raft Types/)).toBeDefined();
  });

  it("should display SOLAS pack contents when clicking the SOLAS Pack tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const solasTab = screen.getByRole("tab", { name: /solas pack/i });
    await user.click(solasTab);

    // then
    expect(await screen.findByText(/SOLAS Pack Contents/)).toBeDefined();
  });

  it("should display deployment and boarding procedures when clicking the Deployment tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const deployTab = screen.getByRole("tab", { name: /deployment/i });
    await user.click(deployTab);

    // then
    expect(await screen.findByText(/Deployment Procedure/)).toBeDefined();
    expect(await screen.findByText(/Boarding Procedure/)).toBeDefined();
    expect(await screen.findByText(/Actions in the Raft/)).toBeDefined();
  });

  it("should render the interactive sorting game in the Drill tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);

    // then
    expect(await screen.findByTestId("abandon-ship-sorting-game")).toBeDefined();
  });

  it("opens and focuses Deployment theory from drill remediation", async () => {
    const user = userEvent.setup();
    render(<TestRouter><LifeRaftTheory /></TestRouter>);
    await user.click(screen.getByRole("tab", { name: /drill/i }));
    await user.click(screen.getByRole("button", { name: /review the life-raft procedures theory/i }));
    const deploymentTab = screen.getByRole("tab", { name: /deployment/i });
    expect(deploymentTab.getAttribute("aria-selected")).toBe("true");
    const heading = await screen.findByRole("heading", { name: "Deployment Procedure" });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  // AC-3: Theory should NOT auto-save on mount
  it("should not call saveProgress automatically on mount", () => {
    // when
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // then - saveProgress should NOT have been called yet
    expect(mockSaveProgress).not.toHaveBeenCalled();
  });

  // Completion is evidence-gated rather than awarded for a button click.
  it("should withhold completion until reviewed sections and drill evidence are complete", () => {
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    const completeButton = screen.getByRole("button", { name: /complete lesson/i });
    expect((completeButton as HTMLButtonElement).disabled).toBe(true);
    expect(mockSaveProgress).not.toHaveBeenCalledWith("safety-life-raft", true, 100, 10, expect.anything());
  });

  it("should explain the evidence still required", async () => {
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("evidence requirements complete"));
  });

  it("should have a back to safety menu button at the bottom", () => {
    // when
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // then
    expect(
      screen.getByRole("button", { name: /back to safety menu/i })
    ).toBeDefined();
  });

  it("should render a link to the life raft quiz in the Drill tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);

    // then
    expect(
      await screen.findByRole("button", { name: /take the life raft quiz/i })
    ).toBeDefined();
  });
});
