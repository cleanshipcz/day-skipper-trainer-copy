import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { checklistData } from "@/data/victuallingItems";
import { parseVictuallingProgress } from "@/features/progress/victuallingProgress";

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), user: { id: "user-a" } as { id: string } | null }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgressDetailed: mocks.load, saveProgressDetailed: mocks.save }) }));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.user }) }));

import VictuallingTheory from "./VictuallingTheory";

const renderPage = () => render(<MemoryRouter><VictuallingTheory /></MemoryRouter>);
const record = (history: unknown, completed = false) => ({ answers_history: history, completed, score: completed ? 100 : 0 });

describe("VictuallingTheory durable checklist", () => {
  beforeEach(() => {
    mocks.user = { id: "user-a" };
    mocks.load.mockReset().mockResolvedValue({ status: "missing", record: null });
    mocks.save.mockReset().mockResolvedValue("remote");
  });

  it("toggles in both directions with reversible score and no duplicate credit", async () => {
    const user = userEvent.setup();
    renderPage();
    const checkbox = await screen.findByRole("checkbox", { name: checklistData[0].item });
    await waitFor(() => expect((checkbox as HTMLButtonElement).disabled).toBe(false));
    await user.click(checkbox);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    await screen.findByText("Checklist saved.");
    expect(screen.getByLabelText("Planning score: 5 points")).toBeTruthy();
    expect(mocks.save).toHaveBeenLastCalledWith("victualling-checklist", false, Math.round(100 / checklistData.length), 0, { version: 1, checkedItemIds: [checklistData[0].id], revision: 0 });
    await user.click(checkbox);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    await screen.findByText("Checklist saved.");
    expect(screen.getByLabelText("Planning score: 0 points")).toBeTruthy();
    expect(mocks.save).toHaveBeenLastCalledWith("victualling-checklist", false, 0, 0, { version: 1, checkedItemIds: [], revision: 1 });
    await user.click(checkbox);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(3));
    expect(screen.getByLabelText("Planning score: 5 points")).toBeTruthy();
    expect(mocks.save.mock.calls.every((call) => call[3] === 0 && call[1] === false)).toBe(true);
  });

  it("restores by stable ID across reorder and ignores removed IDs", async () => {
    mocks.load.mockResolvedValue({ status: "remote", record: record({ version: 1, checkedItemIds: ["removed", checklistData[1].id, checklistData[0].id, checklistData[0].id], revision: 7 }) });
    renderPage();
    expect(await screen.findByLabelText("Planning score: 10 points")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: checklistData[0].item }).getAttribute("data-state")).toBe("checked");
    expect(screen.getByRole("checkbox", { name: checklistData[1].item }).getAttribute("data-state")).toBe("checked");
    expect(screen.queryByText("Provisioning plan ready")).toBeNull();
  });

  it("rejects stale and malformed payloads without trusting a completed row", async () => {
    mocks.load.mockResolvedValue({ status: "remote", record: record({ version: 99, checkedItemIds: checklistData.map(({ id }) => id), revision: 1 }, true) });
    renderPage();
    await waitFor(() => expect(screen.queryByText("Loading saved checklist…")).toBeNull());
    expect(screen.getByLabelText("Planning score: 0 points")).toBeTruthy();
    expect(screen.queryByText("Provisioning plan ready")).toBeNull();
    expect(parseVictuallingProgress({ version: 1, checkedItemIds: [1], revision: 1 }, new Set(["1"]))).toBeNull();
  });

  it("shows planning readiness but never persists learning completion", async () => {
    mocks.load.mockResolvedValue({ status: "remote", record: record({ version: 1, checkedItemIds: checklistData.map(({ id }) => id), revision: 2 }) });
    renderPage();
    expect(await screen.findByRole("region", { name: "Provisioning checklist ready" })).toBeTruthy();
    expect(screen.getByText(/quiz is the learning completion gate/i)).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("retries the exact failed snapshot and blocks edits during failure", async () => {
    mocks.save.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    const user = userEvent.setup();
    renderPage();
    const checkbox = await screen.findByRole("checkbox", { name: checklistData[0].item });
    await waitFor(() => expect((checkbox as HTMLButtonElement).disabled).toBe(false));
    await user.click(checkbox);
    const retry = await screen.findByRole("button", { name: "Retry save" });
    expect((checkbox as HTMLButtonElement).disabled).toBe(true);
    await user.click(retry);
    await screen.findByText("Checklist saved.");
    expect(mocks.save.mock.calls[1]).toEqual(mocks.save.mock.calls[0]);
  });

  it("reloads instead of replaying a stale multi-device snapshot", async () => {
    mocks.save.mockResolvedValueOnce("conflict");
    mocks.load.mockResolvedValueOnce({ status: "remote", record: record({ version: 1, checkedItemIds: [], revision: 2 }) })
      .mockResolvedValueOnce({ status: "remote", record: record({ version: 1, checkedItemIds: [checklistData[1].id], revision: 3 }) });
    const user = userEvent.setup();
    renderPage();
    const first = await screen.findByRole("checkbox", { name: checklistData[0].item });
    await waitFor(() => expect((first as HTMLButtonElement).disabled).toBe(false));
    await user.click(first);
    const reload = await screen.findByRole("button", { name: "Reload checklist" });
    expect((first as HTMLButtonElement).disabled).toBe(true);
    await user.click(reload);
    await waitFor(() => expect((first as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByRole("checkbox", { name: checklistData[1].item }).getAttribute("data-state")).toBe("checked");
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });

  it("protects identity boundaries and keeps anonymous state local", async () => {
    mocks.load.mockResolvedValueOnce({ status: "remote", record: record({ version: 1, checkedItemIds: [checklistData[0].id], revision: 1 }) }).mockResolvedValueOnce({ status: "anonymous", record: null });
    const view = renderPage();
    await screen.findByLabelText("Planning score: 5 points");
    mocks.user = null;
    view.rerender(<MemoryRouter><VictuallingTheory /></MemoryRouter>);
    expect(screen.getByLabelText("Planning score: 0 points")).toBeTruthy();
    await screen.findByText(/Sign in to save/);
  });

  it("pauses on load failure and retries before allowing edits", async () => {
    mocks.load.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    const user = userEvent.setup();
    renderPage();
    expect((await screen.findByRole("button", { name: "Retry load" }))).toBeTruthy();
    const checkbox = screen.getByRole("checkbox", { name: checklistData[0].item }) as HTMLButtonElement;
    expect(checkbox.disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Retry load" }));
    await waitFor(() => expect(checkbox.disabled).toBe(false));
    expect(mocks.load).toHaveBeenCalledTimes(2);
  });
});
