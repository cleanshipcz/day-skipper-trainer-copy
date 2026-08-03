import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: { id: "user-a" } as { id: string } | null,
  loadProgressDetailed: vi.fn(),
  saveProgressDetailed: vi.fn(),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: mocks.user }),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgressDetailed: mocks.loadProgressDetailed,
    saveProgressDetailed: mocks.saveProgressDetailed,
  }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import AnchorTheory from "./AnchorTheory";

const renderPage = () => render(<MemoryRouter><AnchorTheory /></MemoryRouter>);

const completeVisibleStudyCheck = async () => {
  const checkboxes = await screen.findAllByRole("checkbox");
  checkboxes.forEach((checkbox) => fireEvent.click(checkbox));
  fireEvent.click(screen.getByRole("button", { name: "Complete study check" }));
};

describe("AnchorTheory durable completion", () => {
  beforeEach(() => {
    mocks.user = { id: "user-a" };
    mocks.loadProgressDetailed.mockReset();
    mocks.loadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
    mocks.saveProgressDetailed.mockReset();
    mocks.saveProgressDetailed.mockResolvedValue("remote");
  });

  it("persists first completion by stable topic ID with proportional scoring", async () => {
    renderPage();
    await completeVisibleStudyCheck();

    await waitFor(() => expect(mocks.saveProgressDetailed).toHaveBeenCalledWith(
      "anchorwork",
      false,
      20,
      0,
      { version: 1, completedTopicIds: ["types"] },
    ));
    expect(screen.getByText("20")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Complete study check" })).toBeNull();
  });

  it("restores completion and does not award it again", async () => {
    mocks.loadProgressDetailed.mockResolvedValue({
      status: "remote",
      record: { answers_history: { version: 1, completedTopicIds: ["types"] } },
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("20")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Complete study check" })).toBeNull();
    expect(mocks.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("keeps failed completion visible and retries the same identity without duplicate local credit", async () => {
    mocks.saveProgressDetailed.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    renderPage();
    await completeVisibleStudyCheck();

    fireEvent.click(await screen.findByRole("button", { name: "Retry save" }));
    await waitFor(() => expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(2));
    expect(mocks.saveProgressDetailed.mock.calls[1]).toEqual(mocks.saveProgressDetailed.mock.calls[0]);
    expect(screen.getByText("20")).toBeTruthy();
  });

  it("documents anonymous session-only behavior without attempting remote persistence", async () => {
    mocks.user = null;
    mocks.loadProgressDetailed.mockResolvedValue({ status: "anonymous", record: null });
    renderPage();

    expect(await screen.findByText(/Sign in to save it across devices/)).toBeTruthy();
    await completeVisibleStudyCheck();
    expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(1);
  });
});
