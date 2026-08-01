import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { knots } from "@/data/ropeworkKnots";

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ loadProgressDetailed: mocks.load, saveProgressDetailed: mocks.save }),
}));

import RopeworkTheory from "./RopeworkTheory";

const renderPage = () => render(<MemoryRouter><RopeworkTheory /></MemoryRouter>);
const record = (answers_history: unknown, completed = false, score = 0) => ({
  id: "p", user_id: "u", topic_id: "ropework", answers_history, completed, score,
  created_at: "", updated_at: "", completed_at: null, points_earned: 0,
});

describe("RopeworkTheory durable progress", () => {
  beforeEach(() => {
    mocks.load.mockReset().mockResolvedValue({ status: "missing", record: null });
    mocks.save.mockReset().mockResolvedValue("remote");
  });

  it("waits for hydration and restores learned identities without overwriting them", async () => {
    let resolveLoad!: (value: unknown) => void;
    mocks.load.mockReturnValue(new Promise((resolve) => { resolveLoad = resolve; }));
    const user = userEvent.setup();
    renderPage();
    const bowline = screen.getByRole("button", { name: knots[0].name });
    expect((bowline as HTMLButtonElement).disabled).toBe(true);
    await user.click(bowline);
    expect(mocks.save).not.toHaveBeenCalled();
    resolveLoad({ status: "remote", record: record({ version: 1, learnedKnotIds: [knots[0].id] }, false, 15) });
    await waitFor(() => expect((bowline as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByLabelText("Score: 15 points")).toBeTruthy();
    expect(screen.getByText("Learned", { selector: `#${knots[0].id}-state` })).toBeTruthy();
  });

  it.each([
    null,
    { version: 99, learnedKnotIds: [knots[0].id] },
    { version: 1, learnedKnotIds: ["removed-knot"] },
    { version: 1, learnedKnotIds: "bowline" },
  ])("rejects malformed or stale saved data %#", async (payload) => {
    mocks.load.mockResolvedValue({ status: "remote", record: record(payload, true, 100) });
    renderPage();
    await waitFor(() => expect(screen.queryByText("Loading saved ropework progress…")).toBeNull());
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    expect(screen.queryByRole("region", { name: /all knots learned/i })).toBeNull();
  });

  it("saves each newly learned identity and does not award twice on repeated clicks", async () => {
    const user = userEvent.setup();
    renderPage();
    const button = await screen.findByRole("button", { name: knots[0].name });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    await user.click(button);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save).toHaveBeenCalledWith("ropework", false, Math.round(100 / knots.length), 0, {
      version: 1, learnedKnotIds: [knots[0].id],
    });
    await user.click(button);
    expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Score: 15 points")).toBeTruthy();
  });

  it("shows a failed save and retries the same snapshot", async () => {
    mocks.save.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    const user = userEvent.setup();
    renderPage();
    const button = await screen.findByRole("button", { name: knots[0].name });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    await user.click(button);
    const retry = await screen.findByRole("button", { name: "Retry save" });
    await user.click(retry);
    await waitFor(() => expect(screen.getByText("Ropework progress saved.")).toBeTruthy());
    expect(mocks.save).toHaveBeenCalledTimes(2);
    expect(mocks.save.mock.calls[1]).toEqual(mocks.save.mock.calls[0]);
  });

  it("keeps anonymous learning local and marks completion without remote points", async () => {
    mocks.load.mockResolvedValue({ status: "anonymous", record: null });
    mocks.save.mockResolvedValue("anonymous");
    const user = userEvent.setup();
    renderPage();
    await screen.findByText(/Sign in to save/);
    for (const knot of knots) {
      const button = screen.getByRole("button", { name: knot.name });
      await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
      await user.click(button);
    }
    expect(screen.getByRole("region", { name: /all knots learned/i })).toBeTruthy();
    expect(mocks.save).toHaveBeenLastCalledWith("ropework", true, 100, knots.length * 15, {
      version: 1, learnedKnotIds: knots.map((knot) => knot.id),
    });
    expect(screen.getByText(/Sign in to save/)).toBeTruthy();
  });
});
