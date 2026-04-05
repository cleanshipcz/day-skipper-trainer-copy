import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LifeRaftTheory from "../src/pages/LifeRaftTheory";
import TestRouter from "./TestRouter";

// Mock the sorting game component to isolate theory page tests.
vi.mock("@/components/safety/AbandonShipSortingGame", () => ({
  AbandonShipSortingGame: () => (
    <div data-testid="abandon-ship-sorting-game">Sorting Game Mock</div>
  ),
}));

const mockSaveProgress = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: mockSaveProgress,
  }),
}));

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

  // AC-3: Explicit completion button marks safety-life-raft complete
  it("should render a 'Mark as Complete' button that saves progress when clicked", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when - click the completion button
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - saveProgress called with topic ID, completed=true, score=100, points=10
    expect(mockSaveProgress).toHaveBeenCalledWith("safety-life-raft", true, 100, 10);
  });

  // AC-4: Points awarded on first completion
  it("should disable the complete button after clicking it", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <LifeRaftTheory />
      </TestRouter>
    );

    // when
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - button should now be disabled and show "Completed"
    expect(screen.getByRole("button", { name: /completed/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /completed/i }).hasAttribute("disabled")).toBe(true);
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
