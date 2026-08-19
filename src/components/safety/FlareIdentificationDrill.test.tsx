import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flareScenarios } from "@/data/flareTypes";
import { FLARE_DRILL_REVISION, FlareIdentificationDrill } from "./FlareIdentificationDrill";

const progress = vi.hoisted(() => ({
  ownerId: "owner-a" as string | null,
  loadProgressDetailed: vi.fn(),
  saveProgressDetailed: vi.fn(),
}));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => progress }));

describe("FlareIdentificationDrill", () => {
  beforeEach(() => {
    localStorage.clear(); vi.clearAllMocks(); progress.ownerId = "owner-a";
    progress.loadProgressDetailed.mockResolvedValue({ status: "missing", record: null });
    progress.saveProgressDetailed.mockResolvedValue("remote");
  });

  it("uses named single-choice controls and exposes reviewed recognition text", async () => {
    render(<FlareIdentificationDrill reviewApproved />);
    expect((await screen.findByRole("radio", { name: /red rocket-parachute flare/i })).getAttribute("name")).toMatch(/^flare-choice-/);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByText(/shape, colour and firing mechanism vary/i)).toBeTruthy();
    expect((screen.getByRole("button", { name: /check answer/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("settles a correct answer once despite same-turn duplicate activation", async () => {
    const user = userEvent.setup();
    render(<FlareIdentificationDrill reviewApproved scenarioBank={[flareScenarios[0]]} />);
    const choice = await screen.findByRole("radio", { name: /red rocket-parachute flare/i });
    await user.click(choice);
    const submit = screen.getByRole("button", { name: /check answer/i });
    fireEvent.click(submit); fireEvent.click(submit);
    expect(screen.getByTestId("drill-result").textContent).toMatch(/^Correct/);
    await waitFor(() => expect((screen.getByRole("button", { name: /show mastery result/i }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: /show mastery result/i }));
    expect(screen.getByText("1 / 1")).toBeTruthy();
  });

  it("requires a wrong answer to be corrected and caps the denominator", async () => {
    const user = userEvent.setup();
    render(<FlareIdentificationDrill reviewApproved scenarioBank={[flareScenarios[0]]} />);
    await user.click(await screen.findByRole("radio", { name: /^red hand flare/i }));
    const submit = screen.getByRole("button", { name: /check answer/i });
    fireEvent.click(submit); fireEvent.click(submit);
    expect(screen.getByTestId("drill-result").textContent).toMatch(/not correct/i);
    await waitFor(() => expect((screen.getByRole("button", { name: /start remediation/i }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: /start remediation/i }));
    await user.click(screen.getByRole("radio", { name: /red rocket-parachute flare/i }));
    fireEvent.click(screen.getByRole("button", { name: /check answer/i }));
    await waitFor(() => expect((screen.getByRole("button", { name: /show mastery result/i }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: /show mastery result/i }));
    expect(screen.getByText("1 / 1")).toBeTruthy();
  });

  it("does not complete, callback or save for an injected empty bank", async () => {
    const complete = vi.fn();
    render(<FlareIdentificationDrill reviewApproved scenarioBank={[]} onComplete={complete} />);
    expect(screen.getByRole("status").textContent).toMatch(/unavailable/i);
    expect(progress.saveProgressDetailed).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it("reports a failed save truthfully, retries, and awards completion once", async () => {
    progress.saveProgressDetailed.mockResolvedValueOnce("failed").mockResolvedValueOnce("queued");
    const complete = vi.fn(); const user = userEvent.setup();
    render(<FlareIdentificationDrill reviewApproved scenarioBank={[flareScenarios[0]]} onComplete={complete} />);
    await user.click(await screen.findByRole("radio", { name: /red rocket-parachute flare/i }));
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    await waitFor(() => expect((screen.getByRole("button", { name: /show mastery result/i }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: /show mastery result/i }));
    await user.click(screen.getByRole("button", { name: /save mastery/i }));
    expect(await screen.findByRole("button", { name: /retry completion save/i })).toBeTruthy();
    expect(complete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /retry completion save/i }));
    expect((await screen.findByRole("button", { name: /completion queued/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(progress.saveProgressDetailed).toHaveBeenLastCalledWith("safety-flares-drill", true, 100, 10, expect.objectContaining({ revision: FLARE_DRILL_REVISION, mastered: true, qualifiedReview: "waived; no practitioner approval claimed" }));
  });

  it("restores owner-scoped, revisioned remote evidence without saving or callback", async () => {
    progress.loadProgressDetailed.mockResolvedValue({ status: "remote", record: { answers_history: { revision: FLARE_DRILL_REVISION, ownerId: "owner-a", mastered: true, masteredScenarioIds: flareScenarios.map(s => s.id), completionOutcome: "confirmed" } } });
    const complete = vi.fn();
    render(<FlareIdentificationDrill reviewApproved onComplete={complete} />);
    expect((await screen.findByRole("button", { name: /completion confirmed/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toMatch(/restored from your account/i);
    expect(progress.saveProgressDetailed).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
  });

  it("fails release closed without loading, storage access, save or award", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem"); const complete = vi.fn();
    render(<FlareIdentificationDrill reviewApproved={false} onComplete={complete} />);
    expect(screen.getByRole("status").textContent).toMatch(/release blocked/i);
    expect(progress.loadProgressDetailed).not.toHaveBeenCalled(); expect(progress.saveProgressDetailed).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
    getItem.mockRestore();
  });

  it("does not invent a queued state from unqueued authenticated local evidence", async () => {
    localStorage.setItem(`flare-drill:owner-a:${FLARE_DRILL_REVISION}`, JSON.stringify({ revision: FLARE_DRILL_REVISION, ownerId: "owner-a", mastered: true, masteredScenarioIds: flareScenarios.map(s => s.id) }));
    render(<FlareIdentificationDrill reviewApproved />);
    expect(await screen.findByRole("radio", { name: /red rocket-parachute/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /completion queued/i })).toBeNull();
  });

  it("does not restore a stale or tampered authenticated queued marker", async () => {
    localStorage.setItem(`flare-drill:owner-a:${FLARE_DRILL_REVISION}`, JSON.stringify({ revision: FLARE_DRILL_REVISION, ownerId: "owner-a", mastered: true, masteredScenarioIds: flareScenarios.map(s => s.id), completionOutcome: "queued" }));
    render(<FlareIdentificationDrill reviewApproved />);
    expect(await screen.findByRole("radio", { name: /red rocket-parachute/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /completion queued/i })).toBeNull();
    expect(progress.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("keeps confirmed account success when optional local cache storage is denied", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("denied"); });
    const complete = vi.fn(); const user = userEvent.setup();
    render(<FlareIdentificationDrill reviewApproved scenarioBank={[flareScenarios[0]]} onComplete={complete} />);
    await user.click(await screen.findByRole("radio", { name: /red rocket-parachute/i })); await user.click(screen.getByRole("button", { name: /check answer/i }));
    await waitFor(() => expect((screen.getByRole("button", { name: /show mastery/i }) as HTMLButtonElement).disabled).toBe(false));
    await user.click(screen.getByRole("button", { name: /show mastery/i })); await user.click(screen.getByRole("button", { name: /save mastery/i }));
    expect(await screen.findByRole("button", { name: /completion confirmed/i })).toBeTruthy(); expect(complete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /retry completion/i })).toBeNull(); setItem.mockRestore();
  });

  it("moves focus to the next scenario and then the mastery result action", async () => {
    const user = userEvent.setup(); render(<FlareIdentificationDrill reviewApproved scenarioBank={flareScenarios.slice(0, 2)} />);
    await user.click(await screen.findByRole("radio", { name: /red rocket-parachute/i })); await user.click(screen.getByRole("button", { name: /check answer/i }));
    await waitFor(() => expect((screen.getByRole("button", { name: /next scenario/i }) as HTMLButtonElement).disabled).toBe(false)); await user.click(screen.getByRole("button", { name: /next scenario/i }));
    await waitFor(() => expect(document.activeElement?.getAttribute("name")).toMatch(/^flare-choice-/));
    await user.click(screen.getByRole("radio", { name: /orange smoke — hand-held/i })); await user.click(screen.getByRole("button", { name: /check answer/i }));
    await waitFor(() => expect((screen.getByRole("button", { name: /show mastery/i }) as HTMLButtonElement).disabled).toBe(false)); await user.click(screen.getByRole("button", { name: /show mastery/i }));
    await waitFor(() => expect(document.activeElement?.textContent).toMatch(/save mastery/i));
  });
});
