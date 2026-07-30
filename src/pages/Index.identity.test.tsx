import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: { id: "account-a", email: "a@example.test" } as { id: string; email: string } | null,
  pendingA: [] as Array<{ table: string; resolve: (value: { data: unknown; error: null }) => void }>,
  download: vi.fn(),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: state.user, loading: false, signOut: vi.fn() }),
}));
vi.mock("@/features/spaced-repetition/useDueReviewCount", () => ({ useDueReviewCount: () => 0 }));
vi.mock("@/features/engagement/engagementService", () => ({
  retryEngagementOutbox: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/features/engagement/streaks", () => ({
  calculateStreak: () => 0,
  fetchAllStreakTimestamps: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/features/export/progressReport", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/export/progressReport")>();
  return { ...original, downloadProgressReport: state.download };
});
vi.mock("@/components/module-menu/ModuleMenuGrid", () => ({
  ModuleMenuGrid: () => <div data-testid="module-grid" />,
}));

const responseFor = (table: string, owner: string) => {
  if (table === "profiles") return { data: { id: owner, user_id: owner, username: owner, points: owner === "account-a" ? 999 : 2 }, error: null };
  if (table === "user_progress") return { data: owner === "account-a"
    ? [{ topic_id: "ropework", completed: true, score: 100 }]
    : [], error: null };
  if (table === "quiz_scores") return { data: [], error: null };
  if (table === "exam_results") return { data: [], error: null };
  if (table === "user_badges") return { data: [], error: null };
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
          if (owner === "account-a") state.pendingA.push({ table, resolve });
          else resolve(responseFor(table, owner));
        }),
        then: (resolve: (value: unknown) => void) => {
          if (owner === "account-a") state.pendingA.push({ table, resolve: resolve as never });
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
    state.download.mockReset();
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
});
