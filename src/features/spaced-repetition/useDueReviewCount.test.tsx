// @vitest-environment happy-dom
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { fetchDueCount } = vi.hoisted(() => ({ fetchDueCount: vi.fn() }));
vi.mock("./reviewService", () => ({ fetchDueCount }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { useDueReviewCount } from "./useDueReviewCount";

const Probe = ({ userId }: { userId: string | null }) => <p>{useDueReviewCount(userId)}</p>;

describe("dashboard due count identity isolation", () => {
  beforeEach(() => fetchDueCount.mockReset());

  test("should synchronously hide A's count and ignore its delayed response across A to B to A", async () => {
    let resolveA!: (value: number) => void;
    fetchDueCount
      .mockReturnValueOnce(new Promise<number>((resolve) => { resolveA = resolve; }))
      .mockResolvedValue(0);
    const view = render(<Probe userId="a" />);

    view.rerender(<Probe userId="b" />);
    expect(screen.getByText("0")).toBeTruthy();
    view.rerender(<Probe userId="a" />);
    await waitFor(() => expect(fetchDueCount).toHaveBeenCalledTimes(3));
    await act(async () => resolveA(9));

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.queryByText("9")).toBeNull();
  });

  test("should not flash A's previously loaded count after an A to B to A switch", async () => {
    let resolvePending!: (value: number) => void;
    const pending = new Promise<number>((resolve) => { resolvePending = resolve; });
    fetchDueCount.mockResolvedValueOnce(9).mockReturnValue(pending);
    const view = render(<Probe userId="a" />);
    expect(await screen.findByText("9")).toBeTruthy();

    view.rerender(<Probe userId="b" />);
    view.rerender(<Probe userId="a" />);

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.queryByText("9")).toBeNull();
    await act(async () => resolvePending(0));
  });

  test("does not query without an owner and recovers current-owner failures to zero", async () => {
    const view = render(<Probe userId={null} />);
    expect(screen.getByText("0")).toBeTruthy();
    expect(fetchDueCount).not.toHaveBeenCalled();

    fetchDueCount.mockRejectedValueOnce(new Error("offline"));
    view.rerender(<Probe userId="a" />);
    await waitFor(() => expect(fetchDueCount).toHaveBeenCalledOnce());
    expect(screen.getByText("0")).toBeTruthy();
  });
});
