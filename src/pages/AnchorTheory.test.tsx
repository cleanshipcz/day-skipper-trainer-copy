import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const emittedAnnouncements = () => [...screen.getByTestId("anchorwork-announcements").children]
  .map((element) => element.textContent);

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

  it("names navigation, score and progress and exposes topic state with a keyboard-operable tab pattern", async () => {
    renderPage();

    expect(await screen.findByRole("button", { name: "Back to home" })).toBeTruthy();
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    const progress = screen.getByRole("progressbar", { name: "Topic completion progress" });
    expect(progress.getAttribute("aria-valuetext")).toBe("0 of 5 topics completed");

    const tabs = screen.getAllByRole("tab");
    for (const tab of tabs) {
      const controlledId = tab.getAttribute("aria-controls");
      expect(controlledId).toBe("anchor-topic-panel");
      expect(document.getElementById(controlledId!)).toBeTruthy();
    }
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[0].getAttribute("tabindex")).toBe("0");
    expect(tabs[1].getAttribute("tabindex")).toBe("-1");
    fireEvent.keyDown(tabs[0], { key: "ArrowDown" });

    const selectedTab = await screen.findByRole("tab", { name: /prepare the operation, not completed/i });
    expect(selectedTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("anchor-topic-tab-scope");
    await waitFor(() => expect(document.activeElement).toBe(selectedTab));
  });

  it("announces completion and save outcomes, manages focus, and hides decorative imagery", async () => {
    renderPage();
    await completeVisibleStudyCheck();

    await waitFor(() => expect(emittedAnnouncements()).toEqual([
      "Plan and Select completed. 1 of 5 topics completed.",
      "Saving anchorwork progress.",
      "Anchorwork progress saved.",
    ]));
    expect(document.activeElement?.textContent).toContain("Plan and Select");
    expect(screen.getByRole("tab", { name: "Plan and Select, completed" })).toBeTruthy();
    expect(document.querySelectorAll("svg:not([aria-hidden='true']):not([role='img'])")).toHaveLength(0);
  });

  it("emits completion and pending save status exactly once before a controlled save resolves", async () => {
    let resolveSave!: (result: "remote") => void;
    mocks.saveProgressDetailed.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    renderPage();
    await completeVisibleStudyCheck();

    expect(screen.getAllByRole("status")).toHaveLength(1);
    const liveLog = screen.getByTestId("anchorwork-announcements");
    expect(liveLog.getAttribute("aria-atomic")).toBe("false");
    expect(liveLog.getAttribute("aria-relevant")).toBe("additions");
    expect(emittedAnnouncements()).toEqual([
      "Plan and Select completed. 1 of 5 topics completed.",
      "Saving anchorwork progress.",
    ]);

    await act(async () => resolveSave("remote"));
    expect(emittedAnnouncements()).toEqual([
      "Plan and Select completed. 1 of 5 topics completed.",
      "Saving anchorwork progress.",
      "Anchorwork progress saved.",
    ]);
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it.each([
    ["remote", "Anchorwork progress saved."],
    ["queued", "Anchorwork progress saved offline and queued to sync."],
    ["anonymous", "Completion recorded for this visit. Sign in to save it across devices."],
    ["failed", "Anchorwork progress could not be saved. Use Retry save to try again."],
  ] as const)("emits the completion, save status, and %s outcome once each", async (result, outcome) => {
    mocks.saveProgressDetailed.mockResolvedValue(result);
    renderPage();
    await completeVisibleStudyCheck();

    await waitFor(() => expect(emittedAnnouncements()).toEqual([
      "Plan and Select completed. 1 of 5 topics completed.",
      "Saving anchorwork progress.",
      outcome,
    ]));
    expect(new Set(emittedAnnouncements()).size).toBe(3);
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});
