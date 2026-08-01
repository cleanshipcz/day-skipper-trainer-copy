import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { knots } from "@/data/ropeworkKnots";

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), user: { id: "user-a" } as { id: string } | null }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ loadProgressDetailed: mocks.load, saveProgressDetailed: mocks.save }),
}));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.user }) }));

import RopeworkTheory from "./RopeworkTheory";

const renderPage = () => render(<MemoryRouter><RopeworkTheory /></MemoryRouter>);
const passKnot = async (user: ReturnType<typeof userEvent.setup>, knot: (typeof knots)[number]) => {
  await user.click(screen.getByRole("button", { name: knot.name }));
  await user.click(screen.getByRole("radio", { name: knot.practice.options[knot.practice.correctOption] }));
  await user.click(screen.getByRole("button", { name: "Check answer" }));
};
const record = (answers_history: unknown, completed = false, score = 0) => ({
  id: "p", user_id: "u", topic_id: "ropework", answers_history, completed, score,
  created_at: "", updated_at: "", completed_at: null, points_earned: 0,
});

describe("RopeworkTheory durable progress", () => {
  beforeEach(() => {
    mocks.user = { id: "user-a" };
    mocks.load.mockReset().mockResolvedValue({ status: "missing", record: null });
    mocks.save.mockReset().mockResolvedValue("remote");
  });

  it.each([
    { status: "missing", record: null },
    { status: "remote", record: record({ version: 1, learnedKnotIds: ["retired-knot"] }, true, 100) },
  ])("clears the previous owner before hydrating and saving for a new identity %#", async (newOwnerLoad) => {
    mocks.load
      .mockResolvedValueOnce({
        status: "remote",
        record: record({ version: 1, learnedKnotIds: [knots[0].id, knots[1].id] }, false, 29),
      })
      .mockResolvedValueOnce(newOwnerLoad);
    const user = userEvent.setup();
    const view = renderPage();
    await screen.findByLabelText("Score: 30 points");
    await user.click(screen.getByRole("button", { name: knots[0].name }));
    expect(screen.getByRole("heading", { name: `${knots[0].name} details` })).toBeTruthy();

    mocks.user = { id: "user-b" };
    view.rerender(<MemoryRouter><RopeworkTheory /></MemoryRouter>);
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: `${knots[0].name} details` })).toBeNull();
    const thirdKnot = screen.getByRole("button", { name: knots[2].name }) as HTMLButtonElement;
    expect(thirdKnot.disabled).toBe(true);
    await waitFor(() => expect(thirdKnot.disabled).toBe(false));

    await passKnot(user, knots[2]);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save).toHaveBeenLastCalledWith("ropework", false, Math.round(100 / knots.length), 0, {
      version: 1,
      learnedKnotIds: [knots[2].id],
    });
  });

  it("clears authenticated state when transitioning to anonymous use", async () => {
    mocks.load
      .mockResolvedValueOnce({
        status: "remote",
        record: record({ version: 1, learnedKnotIds: [knots[0].id] }, false, 14),
      })
      .mockResolvedValueOnce({ status: "anonymous", record: null });
    const view = renderPage();
    await screen.findByLabelText("Score: 15 points");

    mocks.user = null;
    view.rerender(<MemoryRouter><RopeworkTheory /></MemoryRouter>);
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    expect(screen.getByText("Not learned", { selector: `#${knots[0].id}-state` })).toBeTruthy();
    await screen.findByText(/Sign in to save/);
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

  it("reveals lessons without credit, saves a passed check, and does not award twice", async () => {
    const user = userEvent.setup();
    renderPage();
    const button = await screen.findByRole("button", { name: knots[0].name });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    await user.click(button);
    expect(mocks.save).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    const wrongOption = knots[0].practice.options.find((_, index) => index !== knots[0].practice.correctOption)!;
    await user.click(screen.getByRole("radio", { name: wrongOption }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("alert").textContent).toContain("Not quite");
    expect(mocks.save).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Score: 0 points")).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: knots[0].practice.options[knots[0].practice.correctOption] }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
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
    await user.click(screen.getByRole("radio", { name: knots[0].practice.options[knots[0].practice.correctOption] }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    const retry = await screen.findByRole("button", { name: "Retry save" });
    await user.click(retry);
    await waitFor(() => expect(screen.getByText("Ropework progress saved.")).toBeTruthy());
    expect(mocks.save).toHaveBeenCalledTimes(2);
    expect(mocks.save.mock.calls[1]).toEqual(mocks.save.mock.calls[0]);
  });

  it("keeps learning read-only after a failed authenticated load until retry succeeds", async () => {
    mocks.load
      .mockResolvedValueOnce({ status: "failed", record: null })
      .mockResolvedValueOnce({
        status: "remote",
        record: record({ version: 1, learnedKnotIds: [knots[1].id] }, false, 14),
      });
    const user = userEvent.setup();
    renderPage();

    const bowline = screen.getByRole("button", { name: knots[0].name }) as HTMLButtonElement;
    const retry = await screen.findByRole("button", { name: "Retry load" });
    expect(bowline.disabled).toBe(true);
    await user.click(bowline);
    expect(mocks.save).not.toHaveBeenCalled();

    await user.click(retry);
    await waitFor(() => expect(bowline.disabled).toBe(false));
    expect(mocks.load).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Learned", { selector: `#${knots[1].id}-state` })).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
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
      await passKnot(user, knot);
    }
    expect(screen.getByRole("region", { name: /all knots learned/i })).toBeTruthy();
    expect(mocks.save).toHaveBeenLastCalledWith("ropework", true, 100, knots.length * 15, {
      version: 1, learnedKnotIds: knots.map((knot) => knot.id),
    });
    expect(screen.getByText(/Sign in to save/)).toBeTruthy();
  });
});
