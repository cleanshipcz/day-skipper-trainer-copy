import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const mocks = vi.hoisted(() => ({
  user: { id: "owner-a" } as { id: string } | null,
  load: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ loadProgressDetailed: mocks.load, saveProgressDetailed: mocks.save }) }));
vi.mock("@/components/passage-planning/PrepareAppliedExercise", () => ({
  PrepareAppliedExercise: ({ progressLoading, alreadyCompleted, onComplete }: { progressLoading: boolean; alreadyCompleted: boolean; onComplete: (artifact: Record<string, unknown>) => Promise<string> }) => <section aria-label="mock exercise"><span>{progressLoading ? "progress loading" : alreadyCompleted ? "already complete" : "ready"}</span><button disabled={progressLoading} onClick={() => void onComplete({ catalogueRevision: "r1", scenarioId: "scenario", responses: [], decision: "delay", completedAt: "now" })}>Complete mock</button></section>,
}));

const { default: PrepareTheory } = await import("./PrepareTheory");
const renderPage = () => render(<MemoryRouter><PrepareTheory /></MemoryRouter>);

describe("PrepareTheory progress lifecycle", () => {
  beforeEach(() => { mocks.user = { id: "owner-a" }; mocks.load.mockReset(); mocks.save.mockReset().mockResolvedValue("remote"); });

  it("blocks completion during a slow load and restores completed state first", async () => {
    let resolve!: (value: unknown) => void;
    mocks.load.mockReturnValue(new Promise((done) => { resolve = done; }));
    renderPage();
    expect(screen.getByRole("button", { name: "Complete mock" }).hasAttribute("disabled")).toBe(true);
    resolve({ status: "remote", record: { completed: true } });
    await waitFor(() => expect(screen.getByText("already complete")).toBeTruthy());
  });

  it("shows an accessible load failure and retries", async () => {
    mocks.load.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    const user = userEvent.setup(); renderPage();
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: "Retry loading progress" }));
    await waitFor(() => expect(screen.getByText("ready")).toBeTruthy());
    expect(mocks.load).toHaveBeenCalledTimes(2);
  });

  it("uses the canonical topic and delegates rewards to the server", async () => {
    mocks.load.mockResolvedValue({ status: "missing", record: null });
    const user = userEvent.setup(); renderPage();
    await waitFor(() => expect(screen.getByText("ready")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: "Complete mock" }));
    expect(mocks.save).toHaveBeenCalledWith(TOPIC_IDS.PASSAGE_PLANNING_PREPARE, true, 100, 0, expect.objectContaining({ completionState: "completed", scenarioId: "scenario" }));
  });
});
