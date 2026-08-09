import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TidalTheory from "@/pages/TidalTheory";

const progress = vi.hoisted(() => ({
  ownerId: "account-a" as string | null,
  load: vi.fn(),
  save: vi.fn(),
}));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({
  ownerId: progress.ownerId,
  loadProgressDetailed: progress.load,
  saveProgressDetailed: progress.save,
  saveProgress: vi.fn(),
}) }));

const renderLesson = () => render(<MemoryRouter><TidalTheory /></MemoryRouter>);

describe("Tides durable evidence completion", () => {
  beforeEach(() => {
    localStorage.clear();
    progress.ownerId = "account-a";
    progress.load.mockReset().mockResolvedValue({ status: "missing", record: null });
    progress.save.mockReset().mockResolvedValue("remote");
  });

  it("requires the deliberate safe-decision check and confirms a server save", async () => {
    const user = userEvent.setup();
    renderLesson();
    expect((await screen.findByRole("button", { name: "Complete the concept check" })).hasAttribute("disabled")).toBe(true);
    await user.click(screen.getByLabelText(/Use the local table\/curve/i));
    await waitFor(() => expect(progress.save).toHaveBeenCalledWith("tides-theory", false, 100, 0, expect.objectContaining({ completionState: "in_progress" })));
    await user.click(screen.getByRole("button", { name: "Save completion" }));
    await screen.findByText("Completion saved to your account.");
    expect(progress.save).toHaveBeenLastCalledWith("tides-theory", true, 100, 10, expect.objectContaining({ catalogueRevision: "tides-theory-evidence-v1" }));
  });

  it.each([
    ["queued", "Completion is durably queued on this device"],
    ["anonymous", "Completed on this device"],
  ])("distinguishes the %s durable outcome", async (outcome, copy) => {
    progress.ownerId = outcome === "anonymous" ? null : "account-a";
    progress.save.mockResolvedValue(outcome);
    const user = userEvent.setup();
    renderLesson();
    await user.click(await screen.findByLabelText(/Use the local table\/curve/i));
    await user.click(await screen.findByRole("button", { name: "Save completion" }));
    expect((await screen.findAllByText(new RegExp(copy))).length).toBeGreaterThan(0);
  });

  it("retains evidence and exposes an idempotent retry after failure", async () => {
    progress.save.mockResolvedValueOnce("remote").mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    const user = userEvent.setup();
    renderLesson();
    await user.click(await screen.findByLabelText(/Use the local table\/curve/i));
    await user.click(await screen.findByRole("button", { name: "Save completion" }));
    await user.click(await screen.findByRole("button", { name: "Retry completion" }));
    expect(await screen.findByText("Completion saved to your account.")).toBeTruthy();
  });

  it("announces and disables the completion action while a save is pending", async () => {
    let finishSave!: (value: "remote") => void;
    const pendingSave = new Promise<"remote">((resolve) => { finishSave = resolve; });
    progress.save.mockResolvedValueOnce("remote").mockReturnValueOnce(pendingSave);
    const user = userEvent.setup();
    renderLesson();
    await user.click(await screen.findByLabelText(/Use the local table\/curve/i));
    const completion = await screen.findByRole("button", { name: "Save completion" });
    expect(completion.hasAttribute("disabled")).toBe(false);
    await user.click(completion);
    expect((await screen.findByRole("button", { name: "Saving…" })).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("Saving progress…").getAttribute("aria-live")).toBe("polite");
    finishSave("remote");
    expect(await screen.findByText("Completion saved to your account.")).toBeTruthy();
  });
});
