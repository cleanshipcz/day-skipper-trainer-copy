import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: { id: "account-a", email: "a@example.test" } as { id: string; email: string } | null,
  pendingA: [] as Array<{ table: string; owner: string; resolve: (value: { data: unknown; error: unknown }) => void }>,
  deferredOwners: new Set(["account-a"]),
  profilePoints: new Map<string, number>([["account-a", 999], ["account-b", 2]]),
  download: vi.fn(),
  retryEngagement: vi.fn().mockResolvedValue([]),
  badges: new Map<string, string[]>(),
  loadErrors: new Map<string, Error>(),
  fetchStreaks: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: state.user, loading: false, signOut: vi.fn() }),
}));
vi.mock("@/features/spaced-repetition/useDueReviewCount", () => ({ useDueReviewCount: () => 0 }));
vi.mock("@/features/engagement/engagementService", () => ({
  retryEngagementOutbox: (...args: unknown[]) => state.retryEngagement(...args),
}));
vi.mock("@/features/engagement/streaks", () => ({
  calculateStreak: () => 0,
  fetchAllStreakTimestamps: (...args: unknown[]) => state.fetchStreaks(...args),
}));
vi.mock("@/features/export/progressReport", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/export/progressReport")>();
  return { ...original, downloadProgressReport: state.download };
});
vi.mock("@/components/module-menu/ModuleMenuGrid", () => ({
  ModuleMenuGrid: () => <div data-testid="module-grid" />,
}));

const responseFor = (table: string, owner: string) => {
  if (table === "profiles") return { data: { id: owner, user_id: owner, username: owner, points: state.profilePoints.get(owner) ?? 0 }, error: null };
  if (table === "user_progress") return { data: owner === "account-a"
    ? [{ topic_id: "ropework", completed: true, score: 100 }]
    : [], error: null };
  if (table === "quiz_scores") return { data: [], error: null };
  if (table === "exam_results") return { data: [], error: null };
  if (table === "user_badges") return { data: (state.badges.get(owner) ?? []).map((badge_id) => ({ badge_id })), error: state.loadErrors.get(owner) ?? null };
  return { data: [], error: null };
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      let owner = "";
      const query = {
        select: () => query,
        eq: (_column: string, value: string) => { owner = value; return query; },
        order: () => query,
        range: () => query,
        single: () => new Promise((resolve) => {
          if (state.deferredOwners.has(owner)) state.pendingA.push({ table, owner, resolve });
          else resolve(responseFor(table, owner));
        }),
        then: (resolve: (value: unknown) => void) => {
          if (state.deferredOwners.has(owner)) state.pendingA.push({ table, owner, resolve: resolve as never });
          else resolve(responseFor(table, owner));
        },
      };
      return query;
    },
  },
}));

import Index from "./Index";

describe("dashboard identity isolation", () => {
  beforeEach(() => {
    state.user = { id: "account-a", email: "a@example.test" };
    state.pendingA = [];
    state.deferredOwners = new Set(["account-a"]);
    state.profilePoints = new Map([["account-a", 999], ["account-b", 2]]);
    state.download.mockReset();
    state.retryEngagement.mockReset().mockResolvedValue([]);
    state.badges = new Map();
    state.loadErrors = new Map();
    state.fetchStreaks.mockReset().mockResolvedValue([]);
  });

  it("shows authoritative badges when a background engagement replay remains pending", async () => {
    state.deferredOwners.clear();
    state.retryEngagement.mockRejectedValueOnce(new Error("offline"));
    state.badges.set("account-a", ["first-quiz"]);

    render(<MemoryRouter><Index /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText(/First Quiz/)).toBeTruthy());
    expect(screen.getByText("Recent activity will sync automatically on your next visit.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("heading", { name: "Badges (1)" })).toBeTruthy();
  });

  it("does not expose owner A badges when owner B engagement loading fails", async () => {
    state.deferredOwners.clear();
    state.badges.set("account-a", ["first-quiz"]);
    const view = render(<MemoryRouter><Index /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/First Quiz/)).toBeTruthy());

    state.user = { id: "account-b", email: "b@example.test" };
    state.loadErrors.set("account-b", new Error("badges unavailable"));
    view.rerender(<MemoryRouter><Index /></MemoryRouter>);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Badges could not be loaded"));
    expect(screen.queryByText(/First Quiz/)).toBeNull();
    expect(screen.getByRole("heading", { name: "Badges (0)" })).toBeTruthy();
    expect(screen.getByText("Loading streak…")).toBeTruthy();
  });

  it("keeps owner B badges after a delayed owner A engagement result completes", async () => {
    state.badges.set("account-a", ["first-quiz"]);
    state.badges.set("account-b", ["perfect-score"]);
    const view = render(<MemoryRouter><Index /></MemoryRouter>);
    await waitFor(() => expect(state.pendingA.some(({ table }) => table === "user_badges")).toBe(true));

    state.user = { id: "account-b", email: "b@example.test" };
    view.rerender(<MemoryRouter><Index /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Perfect Score/)).toBeTruthy());

    state.pendingA.splice(0).forEach(({ table, owner, resolve }) => resolve(responseFor(table, owner)));
    await Promise.resolve();
    expect(screen.getByText(/Perfect Score/)).toBeTruthy();
    expect(screen.queryByText(/First Quiz/)).toBeNull();
    expect(screen.getByRole("heading", { name: "Badges (1)" })).toBeTruthy();
  });

  it("reports an authoritative activity load failure as an alert", async () => {
    state.deferredOwners.clear();
    state.fetchStreaks.mockRejectedValueOnce(new Error("activity unavailable"));

    render(<MemoryRouter><Index /></MemoryRouter>);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Badges could not be loaded"));
    expect(screen.getByText("Loading streak…")).toBeTruthy();
  });

  it("hides stale owner data, ignores delayed responses, and exports only after the current owner loads", async () => {
    const view = render(<MemoryRouter><Index /></MemoryRouter>);
    expect((screen.getByRole("button", { name: /export progress report/i }) as HTMLButtonElement).disabled).toBe(true);

    state.user = { id: "account-b", email: "b@example.test" };
    view.rerender(<MemoryRouter><Index /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText("account-b")).toBeTruthy());
    expect(screen.queryByText("999")).toBeNull();
    expect((screen.getByRole("button", { name: /export progress report/i }) as HTMLButtonElement).disabled).toBe(false);

    state.pendingA.splice(0).forEach(({ table, resolve }) => resolve(responseFor(table, "account-a")));
    await Promise.resolve();
    expect(screen.queryByText("account-a")).toBeNull();
    expect(screen.queryByText("999")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /export progress report/i }));
    await waitFor(() => expect(state.download).toHaveBeenCalledWith(expect.objectContaining({
      studentName: "account-b",
      totalPoints: 2,
    })));
  });

  it("rejects an older overlapping load generation for the same owner", async () => {
    state.user = { id: "account-b", email: "b@example.test" };
    state.deferredOwners = new Set(["account-b"]);
    const view = render(<MemoryRouter><Index /></MemoryRouter>);
    await waitFor(() => expect(state.pendingA.map(({ table }) => table))
      .toEqual(["profiles", "user_progress", "user_badges"]));

    state.user = { id: "account-b", email: "b@example.test" };
    view.rerender(<MemoryRouter><Index /></MemoryRouter>);
    await waitFor(() => expect(state.pendingA.map(({ table }) => table)).toEqual([
      "profiles", "user_progress", "user_badges",
      "profiles", "user_progress", "user_badges",
    ]));

    state.profilePoints.set("account-b", 22);
    state.badges.set("account-b", ["perfect-score"]);
    const newer = state.pendingA.splice(3, 3);
    newer.forEach(({ table, resolve }) => resolve(responseFor(table, "account-b")));
    await waitFor(() => expect(state.pendingA.some(({ table }) => table === "quiz_scores")).toBe(true));
    state.pendingA.splice(3).forEach(({ table, resolve }) => resolve(responseFor(table, "account-b")));
    await waitFor(() => expect(screen.getAllByText("22")).toHaveLength(2));
    await waitFor(() => expect(screen.getByText(/Perfect Score/)).toBeTruthy());

    state.profilePoints.set("account-b", 11);
    state.badges.set("account-b", ["first-quiz"]);
    const older = state.pendingA.splice(0, 3);
    older.forEach(({ table, resolve }) => resolve(responseFor(table, "account-b")));
    await Promise.resolve();
    state.pendingA.splice(0).forEach(({ table, resolve }) => resolve(responseFor(table, "account-b")));
    await Promise.resolve();

    expect(screen.getAllByText("22")).toHaveLength(2);
    expect(screen.queryByText("11")).toBeNull();
    expect(screen.getByText(/Perfect Score/)).toBeTruthy();
    expect(screen.queryByText(/First Quiz/)).toBeNull();
    expect((screen.getByRole("button", { name: /export progress report/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
