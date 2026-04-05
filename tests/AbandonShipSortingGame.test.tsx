import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AbandonShipSortingGame } from "../src/components/safety/AbandonShipSortingGame";

// Mock sonner toast to verify notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AbandonShipSortingGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render scenario selection buttons", () => {
    // when
    render(<AbandonShipSortingGame />);

    // then - multiple scenario buttons should be visible
    expect(screen.getByRole("button", { name: /abandon ship/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /deployment/i })).toBeDefined();
  });

  it("should render step items for the default scenario", () => {
    // when
    render(<AbandonShipSortingGame />);

    // then - steps are visible as numbered items (badges with numbers)
    const badges = screen.getAllByText(/^\d+$/);
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it("should render a 'Check Order' button", () => {
    // when
    render(<AbandonShipSortingGame />);

    // then
    expect(screen.getByRole("button", { name: /check order/i })).toBeDefined();
  });

  it("should render a 'Reset' button", () => {
    // when
    render(<AbandonShipSortingGame />);

    // then
    expect(screen.getByRole("button", { name: /reset/i })).toBeDefined();
  });

  it("should render arrow buttons for reordering steps", () => {
    // when
    render(<AbandonShipSortingGame />);

    // then - there should be small icon buttons for reordering (2 per step: up + down)
    const allButtons = screen.getAllByRole("button");
    // - at minimum we have: 4 scenario buttons + check order + reset + (N steps * 2 arrows)
    // - with 7 abandon ship steps that's 6 + 14 = 20 buttons minimum
    expect(allButtons.length).toBeGreaterThan(10);
  });

  it("should switch scenarios when clicking a different scenario button", async () => {
    // given
    const user = userEvent.setup();
    render(<AbandonShipSortingGame />);

    // when - click the deployment scenario
    const deploymentButton = screen.getByRole("button", { name: /life raft deployment/i });
    await user.click(deploymentButton);

    // then - card title updates to show deployment (multiple matches expected: button + title)
    const matches = screen.getAllByText("Life Raft Deployment");
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("should show toast feedback when checking order", async () => {
    // given
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<AbandonShipSortingGame />);

    // when - click check order (will be wrong since shuffled)
    const checkButton = screen.getByRole("button", { name: /check order/i });
    await user.click(checkButton);

    // then - either success or error toast should fire
    const totalCalls =
      (toast.success as ReturnType<typeof vi.fn>).mock.calls.length +
      (toast.error as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(totalCalls).toBeGreaterThanOrEqual(1);
  });
});
