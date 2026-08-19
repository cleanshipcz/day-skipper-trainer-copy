import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const progress = vi.hoisted(() => ({
  ownerId: "learner-a" as string | null,
  load: vi.fn(),
  save: vi.fn(),
}));
const offlineQueue = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ ownerId: progress.ownerId, loadProgressDetailed: progress.load, saveProgressDetailed: progress.save }),
}));
vi.mock("@/features/offline/progressQueue", () => ({ getQueuedProgress: offlineQueue.get }));

vi.mock("@/components/safety/PersonalSafetyCheck", () => ({
  isCurrentPersonalSafetyMastery: (value: unknown) => Boolean(value && typeof value === "object" && (value as { revision?: string }).revision === "personal-safety-practical-v2" && (value as { masteredScenarioIds?: string[] }).masteredScenarioIds?.length === 5),
  PersonalSafetyCheck: ({ onMastery }: { onMastery: (value: object | null) => void }) => <div><button onClick={() => onMastery({ revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"] })}>Complete practical safety check</button><button onClick={() => onMastery(null)}>Change mastered answer</button></div>,
}));

import PersonalSafetyTheory from "./PersonalSafetyTheory";

beforeEach(() => {
  progress.ownerId = "learner-a";
  progress.load.mockReset().mockResolvedValue({ status: "missing", record: null });
  progress.save.mockReset().mockResolvedValue("remote");
  offlineQueue.get.mockReset().mockResolvedValue([]);
  localStorage.clear();
});

describe("PersonalSafetyTheory lifejacket guidance", () => {
  it("shows ISO levels and qualified self-righting labels to learners", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PersonalSafetyTheory />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Level 50 buoyancy aids from Level 100, 150, and 275/i)).toBeTruthy();
    expect(
      screen.getByText(/properly fitted, fasten the crotch strap where one is provided/i),
    ).toBeTruthy();

    const inclusiveLabel = "Buoyancy aids & lifejackets";
    await user.click(screen.getByRole("tab", { name: inclusiveLabel }));

    expect(screen.getAllByText(inclusiveLabel)).toHaveLength(2);
    expect(screen.getByText("Level 50 Buoyancy Aid")).toBeTruthy();
    expect(screen.getByText("Level 100 Lifejacket")).toBeTruthy();
    expect(screen.getByText("Level 150 Lifejacket")).toBeTruthy();
    expect(screen.getByText("Level 275 Lifejacket")).toBeTruthy();
    expect(screen.getAllByText("Self-righting performance")).toHaveLength(4);
    expect(screen.getByText("Not designed to self-right an unconscious wearer.")).toBeTruthy();
    expect(screen.getByText(/never assume this is guaranteed/i)).toBeTruthy();
    expect(screen.getByText(/no universal guarantee applies/i)).toBeTruthy();
    expect(screen.getByText(/can prevent or delay turning/i)).toBeTruthy();
    expect(screen.queryByText("Yes — will turn a casualty face-up")).toBeNull();
    expect(screen.queryByText("Life Jacket Types")).toBeNull();
    expect(screen.getByText("Automatic Water-Activated Inflation")).toBeTruthy();
    expect(screen.getByText("Automatic Hydrostatic Inflation")).toBeTruthy();
    expect(screen.getByText(/oral inflation tube is for topping up.*emergency backup/i)).toBeTruthy();
  });

  it("renders product-specific servicing boundaries and reviewed sources", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    await user.click(screen.getByRole("tab", { name: "Servicing" }));
    expect(screen.getByRole("heading", { name: "Routine owner checks" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Manufacturer-approved servicing" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Commercial and SOLAS requirements" })).toBeTruthy();
    expect(screen.getByText(/whether the bladder should remain inflated for 24 hours, is manufacturer-dependent/i)).toBeTruthy();
    expect(screen.getByText(/manufacturer permits owner re-arming/i)).toBeTruthy();
    expect(screen.getByText(/Reviewed 12 August 2026/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /RYA: Life Jackets and Buoyancy Aids/i }).getAttribute("href")).toMatch(/^https:\/\/www\.rya\.org\.uk\//);
    expect(screen.getByRole("link", { name: /MCA MGN 548/i }).getAttribute("href")).toMatch(/^https:\/\/www\.gov\.uk\//);
    expect(screen.queryByText(/Annual professional servicing is the standard/i)).toBeNull();
  });

  it("shows continuous-transfer, tethered-overboard, and source-scope guidance to learners", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    await user.click(screen.getByRole("tab", { name: "Equipment" }));
    expect(screen.getByText(/A two-ended tether has a harness attachment and one working attachment/i)).toBeTruthy();
    expect(screen.getByText(/A three-point tether adds a second working leg or intermediate hook/i)).toBeTruthy();
    expect(screen.getByText(/clip the free working hook.*physically tug.*then release the previous hook/i)).toBeTruthy();
    expect(screen.getByText(/can be dragged alongside.*drown before recovery succeeds/i)).toBeTruthy();
    expect(screen.getByText(/practise a vessel-specific tethered-MOB recovery/i)).toBeTruthy();
    expect(screen.getAllByText(/No qualified practitioner approval is recorded/i)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /PFD harness attachment-point context/i })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /World Sailing Offshore Special Regulations/i }).every((link) => link.getAttribute("href")?.startsWith("https://media.sailing.org/"))).toBe(true);
    expect(screen.getByRole("link", { name: /World Sailing.*sections 4\.04 and 5\.02/i })).toBeTruthy();
    expect(screen.getByText(/not a source for jackstay design, tether transfer, hook loading, or tethered-MOB recovery/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /MAIB Annual Report 2019/i }).getAttribute("href")).toMatch(/^https:\/\/assets\.publishing\.service\.gov\.uk\//);
  });

  it("teaches emergency features, recovery points, and beacon selection with scoped sources", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /Emergency features/i })).toBeTruthy();
    const diagram = screen.getByRole("img", { name: /Inflated lifejacket emergency-feature positions/i });
    expect(diagram.getAttribute("viewBox")).toBe("0 0 760 480");
    expect(diagram.querySelectorAll("path").length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText(/Front view of an inflated horseshoe lifejacket.*Positional leader lines/i, { selector: "desc" })).toBeTruthy();
    expect(diagram.getAttribute("aria-describedby")).toBe("lifejacket-feature-key");
    const calloutKey = screen.getByRole("list", { name: /Lifejacket diagram callout key/i });
    expect(calloutKey.querySelectorAll("li")).toHaveLength(4);
    expect(calloutKey.textContent).toMatch(/2 — Emergency light:.*wearer's left lobe/i);
    expect(calloutKey.textContent).toMatch(/4 — Whistle:.*wearer's right lobe/i);
    expect(screen.getByText(/Labelled feature map.*whistle and emergency light/i)).toBeTruthy();
    expect(screen.getByText(/Returns a searchlight beam.*does not generate light/i)).toBeTruthy();
    expect(screen.getByText(/Reduces inhalation of spray/i)).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Equipment" }));
    expect(screen.getByText(/harness point is for attaching the safety tether.*not automatically a lifting point/i)).toBeTruthy();
    expect(screen.getByText(/lifting or recovery loop is a separate, manufacturer-identified point/i)).toBeTruthy();
    expect(screen.getByText(/406 MHz PLB with GNSS.*satellites/i)).toBeTruthy();
    expect(screen.getByText(/Use only the maker's self-test.*never transmit a live distress alert/i)).toBeTruthy();
    expect(screen.getByText(/World Sailing OSR section 5\.01 is an offshore-racing requirement.*not universal law/i)).toBeTruthy();
    expect(screen.getAllByText(/No qualified practitioner approval is recorded/i)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /MAIB Safety Digest 1\/2012, case 26/i })).toBeTruthy();
  });
});

describe("PersonalSafetyTheory completion", () => {
  const master = () => fireEvent.click(screen.getByRole("button", { name: "Complete practical safety check" }));

  it("locks completion immediately when a mastered answer changes", async () => {
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    expect((await screen.findByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    master();
    expect((screen.getByRole("button", { name: "Mark as Complete" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Change mastered answer" }));
    expect((screen.getByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("does not carry practical mastery into another learner account", async () => {
    const view = render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    await screen.findByRole("button", { name: "Complete the practical safety check" });
    master();
    expect(screen.getByRole("button", { name: "Mark as Complete" })).toBeTruthy();
    progress.ownerId = "learner-b";
    progress.load.mockResolvedValue({ status: "missing", record: null });
    view.rerender(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    expect((await screen.findByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });
  it("hydrates an existing signed-in completion and prevents another award", async () => {
    progress.load.mockResolvedValue({ status: "remote", record: { completed: true, answers_history: { personalSafetyMastery: { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"] } } } });
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    const button = await screen.findByRole("button", { name: "Completed" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("awaits a successful save, disables while saving, and prevents repeat submissions", async () => {
    let resolveSave!: (result: "remote") => void;
    progress.save.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    master();
    const button = await screen.findByRole("button", { name: "Mark as Complete" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect((screen.getByRole("button", { name: "Saving completion…" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).toHaveBeenCalledTimes(1);
    resolveSave("remote");
    expect(((await screen.findByRole("button", { name: "Completed" })) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).toHaveBeenCalledWith("safety-personal", true, 100, 10, { personalSafetyMastery: { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"] } });
  });

  it("does not restore a legacy v1 completion or bypass v2 beacon mastery", async () => {
    progress.load.mockResolvedValue({ status: "remote", record: { completed: true, answers_history: { personalSafetyMastery: { revision: "personal-safety-practical-v1", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord"] } } } });
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    expect((await screen.findByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Completed" })).toBeNull();
  });

  it("restores auditable v2 mastery evidence and completed state", async () => {
    progress.load.mockResolvedValue({ status: "remote", record: { completed: true, answers_history: { personalSafetyMastery: { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"] } } } });
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    expect(((await screen.findByRole("button", { name: "Completed" })) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("offers an actionable sign-in path without attempting a write", async () => {
    progress.ownerId = null;
    progress.load.mockResolvedValue({ status: "anonymous", record: null });
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    expect((await screen.findByRole("status")).textContent).toMatch(/sign in to save completion/i);
    expect((screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: "Sign in to complete" }) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).not.toHaveBeenCalled();
  });

  it("blocks completion after a load failure and retries the read", async () => {
    progress.load.mockResolvedValueOnce({ status: "failed", record: null }).mockResolvedValueOnce({ status: "missing", record: null });
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toMatch(/could not be loaded/i);
    expect((screen.getByRole("button", { name: "Progress unavailable" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Retry loading progress" }));
    master();
    expect(((await screen.findByRole("button", { name: "Mark as Complete" })) as HTMLButtonElement).disabled).toBe(false);
    expect(progress.load).toHaveBeenCalledTimes(2);
  });

  it("does not mark a rejected or failed save complete and permits retry", async () => {
    progress.save.mockRejectedValueOnce(new Error("network rejected")).mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    master();
    fireEvent.click(await screen.findByRole("button", { name: "Mark as Complete" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/not saved/i);
    fireEvent.click(screen.getByRole("button", { name: "Retry saving completion" }));
    await waitFor(() => expect(progress.save).toHaveBeenCalledTimes(2));
    expect((screen.getByRole("button", { name: "Retry saving completion" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Retry saving completion" }));
    expect(((await screen.findByRole("button", { name: "Completed" })) as HTMLButtonElement).disabled).toBe(true);
  });

  it("accepts and restores an account-scoped offline-queued completion backed by the durable queue", async () => {
    progress.save.mockResolvedValue("queued");
    const first = render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    master();
    fireEvent.click(await screen.findByRole("button", { name: "Mark as Complete" }));
    expect(((await screen.findByRole("button", { name: "Queued offline" })) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toMatch(/queued offline.*sync/i);
    first.unmount();

    progress.load.mockResolvedValue({ status: "failed", record: null });
    offlineQueue.get.mockResolvedValue([{
      id: "learner-a:safety-personal", userId: "learner-a", topicId: "safety-personal",
      completed: true, score: 100, pointsEarned: 10, updatedAt: 1, revision: 1,
      attempts: 0, status: "pending", answersHistory: { personalSafetyMastery: {
        revision: "personal-safety-practical-v2",
        masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"],
      } },
    }]);
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    expect(((await screen.findByRole("button", { name: "Queued offline" })) as HTMLButtonElement).disabled).toBe(true);
    expect(progress.save).toHaveBeenCalledTimes(1);
  });

  it("rejects and clears a stale or forged queued marker without a matching durable entry", async () => {
    localStorage.setItem("personal-safety-completion-queued:personal-safety-practical-v2:learner-a", "true");
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    expect((await screen.findByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText(/queued offline/i)).toBeNull();
    expect(localStorage.getItem("personal-safety-completion-queued:personal-safety-practical-v2:learner-a")).toBeNull();
    expect(offlineQueue.get).toHaveBeenCalledWith("learner-a");
  });

  it.each([
    ["missing mastery", undefined, "learner-a"],
    ["legacy mastery", { revision: "personal-safety-practical-v1", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord"] }, "learner-a"],
    ["current-revision mastery with a wrong scenario", { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "forged"] }, "learner-a"],
    ["current-revision mastery with duplicate scenarios", { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "kill-cord"] }, "learner-a"],
    ["wrong-owner mastery", { revision: "personal-safety-practical-v2", masteredScenarioIds: ["pfd", "fit", "tether", "kill-cord", "beacon"] }, "learner-b"],
  ])("rejects queued completion with %s", async (_label, personalSafetyMastery, userId) => {
    offlineQueue.get.mockResolvedValue([{
      id: `${userId}:safety-personal`, userId, topicId: "safety-personal",
      completed: true, score: 100, pointsEarned: 10, updatedAt: 1, revision: 1,
      attempts: 0, status: "pending", answersHistory: personalSafetyMastery ? { personalSafetyMastery } : undefined,
    }]);
    localStorage.setItem("personal-safety-completion-queued:personal-safety-practical-v2:learner-a", "true");
    render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    expect((await screen.findByRole("button", { name: "Complete the practical safety check" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText(/queued offline/i)).toBeNull();
    expect(localStorage.getItem("personal-safety-completion-queued:personal-safety-practical-v2:learner-a")).toBeNull();
  });

  it("continues safely when localStorage access is denied", async () => {
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("denied"); });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("denied"); });
    progress.save.mockResolvedValue("queued");
    try {
      render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
      master();
      fireEvent.click(await screen.findByRole("button", { name: "Mark as Complete" }));
      expect(await screen.findByRole("button", { name: "Queued offline" })).toBeTruthy();
      expect(screen.queryByRole("alert")).toBeNull();
    } finally {
      remove.mockRestore();
      set.mockRestore();
    }
  });

  it("releases an in-flight save on owner change and ignores the stale settlement", async () => {
    let rejectOwnerA!: (error: Error) => void;
    progress.save.mockReturnValueOnce(new Promise((_resolve, reject) => { rejectOwnerA = reject; })).mockResolvedValueOnce("remote");
    const view = render(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);

    master();
    fireEvent.click(await screen.findByRole("button", { name: "Mark as Complete" }));
    expect(screen.getByRole("button", { name: "Saving completion…" })).toBeTruthy();

    progress.ownerId = "learner-b";
    progress.load.mockResolvedValue({ status: "missing", record: null });
    view.rerender(<MemoryRouter><PersonalSafetyTheory /></MemoryRouter>);
    master();
    fireEvent.click(await screen.findByRole("button", { name: "Mark as Complete" }));
    expect(await screen.findByRole("button", { name: "Completed" })).toBeTruthy();
    expect(progress.save).toHaveBeenCalledTimes(2);

    await act(async () => {
      rejectOwnerA(new Error("owner A save failed late"));
      await Promise.resolve();
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "Completed" })).toBeTruthy();
  });
});
