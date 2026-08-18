/**
 * Tests for the GasSafetyTheory page component.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1, AC-2, AC-3
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock useProgress to avoid Supabase + auth context dependency chain
const progress = vi.hoisted(() => ({ ownerId: "learner-a" as string | null, load: vi.fn(), save: vi.fn() }));
const queue = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ ownerId: progress.ownerId, loadProgressDetailed: progress.load, saveProgressDetailed: progress.save }) }));
vi.mock("@/features/offline/progressQueue", () => ({ getQueuedProgress: queue.get }));
vi.mock("@/components/safety/GasSafetyPractice", () => ({
  GasSafetyPractice: ({ onMastery }: { onMastery: (value: object | null) => void }) => <div><button onClick={() => onMastery({ revision: "gas-safety-practice-v1", masteredScenarioIds: ["lpg-leak", "co-alarm"] })}>Master gas safety practice</button><button onClick={() => onMastery(null)}>Change gas safety answer</button></div>,
}));

// Mock react-router-dom to avoid needing a Router context
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

beforeEach(() => {
  progress.ownerId = "learner-a";
  progress.load.mockReset().mockResolvedValue({ status: "missing", record: null });
  progress.save.mockReset().mockResolvedValue("remote");
  queue.get.mockReset().mockResolvedValue([]);
  localStorage.clear();
});

describe("GasSafetyTheory", () => {
  it("should export a default component", async () => {
    // given
    const mod = await import("./GasSafetyTheory");

    // then
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("should render theory content covering all required gas safety areas", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    // - page title
    expect(html).toContain("Gas Safety");
    // - LPG properties tab content
    expect(html).toContain("LPG");
    // - isolation valves tab
    expect(html).toContain("Valves");
    // - gas leak warning and response tab
    expect(html).toContain("Leak Response");
    // - gas locker tab
    expect(html).toContain("Locker");
    // - carbon monoxide tab
    expect(html).toContain("CO");
    // - detector placement tab
    expect(html).toContain("Detectors");
  });

  it("should render an explicit loading completion state", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    expect(html).toContain("Loading progress");
  });

  it("should render a back navigation button to the safety menu", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    expect(html).toContain("Back to Safety Menu");
  });

  it("should render the first topic (LPG Properties) content by default", async () => {
    // given
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");

    // when
    const html = renderToStaticMarkup(<GasSafetyTheory />);

    // then
    // - default tab shows LPG properties content
    expect(html).toContain("LPG Properties");
    expect(html).toContain("heavier than air");
  });

  it("labels tabs descriptively, hides their icons and supports Radix arrow-key navigation", async () => {
    const user = userEvent.setup(); const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    const { container } = render(<GasSafetyTheory/>);
    const list = screen.getByRole("tablist", { name: "Gas safety lesson sections" });
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6); expect(tabs[0].getAttribute("aria-controls")).toBeTruthy();
    expect(container.querySelectorAll('[aria-hidden="true"]')).not.toHaveLength(0);
    tabs[0].focus(); await user.keyboard("{ArrowRight}"); expect(document.activeElement).toBe(tabs[1]);
    expect(list.className).toContain("grid-cols-2"); expect(tabs[0].className).toContain("min-h-11");
  });

  it("hydrates an existing completion and does not require new mastery evidence", async () => {
    progress.load.mockResolvedValue({ status: "remote", record: { completed: true, answers_history: null } });
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect((await screen.findByRole("button", { name: "Completed" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("keeps authoritative remote completion when browser marker removal is denied", async () => {
    progress.load.mockResolvedValue({ status: "remote", record: { completed: true, answers_history: null } });
    const denied = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("storage denied"); });
    try {
      const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
      render(<GasSafetyTheory />);
      expect(await screen.findByRole("button", { name: "Completed" })).toBeTruthy();
      expect(screen.getByRole("status").textContent).toMatch(/saved to your account/i);
    } finally {
      denied.mockRestore();
    }
  });

  it("blocks on load failure and retries hydration", async () => {
    progress.load.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect((await screen.findByRole("alert")).textContent).toMatch(/could not be loaded/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry loading progress" }));
    expect(await screen.findByRole("button", { name: "Complete the gas safety practice" })).toBeTruthy();
    expect(progress.load).toHaveBeenCalledTimes(2);
  });

  it("times out a never-settling hydration and leaves loading retryable", async () => {
    vi.useFakeTimers();
    try {
      progress.load.mockReturnValue(new Promise(() => undefined));
      const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
      render(<GasSafetyTheory />);
      expect(screen.getByRole("status").textContent).toMatch(/loading saved gas safety progress/i);
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(screen.getByRole("alert").textContent).toMatch(/could not be loaded/i);
      expect(screen.getByRole("button", { name: "Retry loading progress" })).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("times out a never-settling durable queue lookup", async () => {
    vi.useFakeTimers();
    try {
      queue.get.mockReturnValue(new Promise(() => undefined));
      const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
      render(<GasSafetyTheory />);
      await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
      expect(screen.getByRole("button", { name: "Progress unavailable" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Retry loading progress" })).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores a late queue result from a previous learner", async () => {
    let resolveOldQueue!: (entries: object[]) => void;
    queue.get.mockReturnValueOnce(new Promise((resolve) => { resolveOldQueue = resolve; })).mockResolvedValueOnce([]);
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    const view = render(<GasSafetyTheory />);
    await waitFor(() => expect(queue.get).toHaveBeenCalledWith("learner-a"));
    progress.ownerId = "learner-b";
    view.rerender(<GasSafetyTheory />);
    expect(await screen.findByRole("button", { name: "Complete the gas safety practice" })).toBeTruthy();
    await act(async () => resolveOldQueue([{ topicId: "safety-gas", completed: true, status: "pending" }]));
    expect(screen.queryByRole("button", { name: "Queued offline" })).toBeNull();
    expect(screen.getByRole("button", { name: "Complete the gas safety practice" })).toBeTruthy();
  });

  it("gates a new completion on current mastery, awaits save, and ignores duplicate clicks", async () => {
    let resolveSave!: (result: "remote") => void;
    progress.save.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect((await screen.findByRole("button", { name: "Complete the gas safety practice" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Master gas safety practice" }));
    const complete = screen.getByRole("button", { name: "Mark as Complete" });
    fireEvent.click(complete); fireEvent.click(complete);
    expect((screen.getByRole("button", { name: "Saving completion…" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toMatch(/saving gas safety completion/i);
    expect(progress.save).toHaveBeenCalledTimes(1);
    expect(progress.save).toHaveBeenCalledWith("safety-gas", true, 100, 10, { gasSafetyMastery: { revision: "gas-safety-practice-v1", masteredScenarioIds: ["lpg-leak", "co-alarm"] } });
    await act(async () => resolveSave("remote"));
    expect(await screen.findByRole("button", { name: "Completed" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/completion saved to your account/i);
  });

  it("keeps a confirmed save successful when browser marker cleanup is denied", async () => {
    const denied = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("storage denied"); });
    try {
      const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
      render(<GasSafetyTheory />);
      await screen.findByRole("button", { name: "Complete the gas safety practice" });
      fireEvent.click(screen.getByRole("button", { name: "Master gas safety practice" }));
      fireEvent.click(screen.getByRole("button", { name: "Mark as Complete" }));
      expect(await screen.findByRole("button", { name: "Completed" })).toBeTruthy();
      expect(screen.getByRole("status").textContent).toMatch(/saved to your account/i);
    } finally {
      denied.mockRestore();
    }
  });

  it("keeps failed saves retryable and clears completion eligibility if mastery changes", async () => {
    progress.save.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    await screen.findByRole("button", { name: "Complete the gas safety practice" });
    fireEvent.click(screen.getByRole("button", { name: "Master gas safety practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark as Complete" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/not saved/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry saving completion" }));
    await waitFor(() => expect(progress.save).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Change gas safety answer" }));
    expect((screen.getByRole("button", { name: "Complete the gas safety practice" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("accepts queued offline completion and restores its account-scoped marker", async () => {
    progress.save.mockResolvedValue("queued");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    const first = render(<GasSafetyTheory />);
    await screen.findByRole("button", { name: "Complete the gas safety practice" });
    fireEvent.click(screen.getByRole("button", { name: "Master gas safety practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark as Complete" }));
    expect(await screen.findByRole("button", { name: "Queued offline" })).toBeTruthy();
    first.unmount();
    progress.load.mockResolvedValue({ status: "failed", record: null });
    queue.get.mockResolvedValue([{ topicId: "safety-gas", completed: true, status: "pending" }]);
    render(<GasSafetyTheory />);
    expect(await screen.findByRole("button", { name: "Queued offline" })).toBeTruthy();
    expect(progress.save).toHaveBeenCalledTimes(1);
  });

  it.each(["missing", "quarantined"])("rejects a stale queued marker when durable queue state is %s", async (queueState) => {
    localStorage.setItem("gas-safety-completion-queued:gas-safety-practice-v1:learner-a", "true");
    progress.load.mockResolvedValue({ status: "failed", record: null });
    queue.get.mockResolvedValue(queueState === "quarantined" ? [{ topicId: "safety-gas", completed: true, status: "quarantined" }] : []);
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect(await screen.findByRole("button", { name: "Progress unavailable" })).toBeTruthy();
    expect(localStorage.getItem("gas-safety-completion-queued:gas-safety-practice-v1:learner-a")).toBeNull();
    expect(screen.queryByRole("button", { name: "Queued offline" })).toBeNull();
  });

  it("restores a pending durable completion even if its legacy marker was lost", async () => {
    progress.load.mockResolvedValue({ status: "failed", record: null });
    queue.get.mockResolvedValue([{ topicId: "safety-gas", completed: true, status: "pending" }]);
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect(await screen.findByRole("button", { name: "Queued offline" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/durably queued/i);
  });

  it("shows unsigned policy without writing", async () => {
    progress.ownerId = null;
    progress.load.mockResolvedValue({ status: "anonymous", record: null });
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    render(<GasSafetyTheory />);
    expect((await screen.findByRole("status")).textContent).toMatch(/sign in to save completion/i);
    expect((screen.getByRole("button", { name: "Sign in to complete" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("ignores stale save settlement after learner change", async () => {
    let resolveOld!: (result: "remote") => void;
    progress.save.mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; })).mockResolvedValueOnce("remote");
    const { default: GasSafetyTheory } = await import("./GasSafetyTheory");
    const view = render(<GasSafetyTheory />);
    await screen.findByRole("button", { name: "Complete the gas safety practice" });
    fireEvent.click(screen.getByRole("button", { name: "Master gas safety practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark as Complete" }));
    progress.ownerId = "learner-b";
    view.rerender(<GasSafetyTheory />);
    await screen.findByRole("button", { name: "Complete the gas safety practice" });
    await act(async () => resolveOld("remote"));
    expect(screen.queryByRole("button", { name: "Completed" })).toBeNull();
  });
});
