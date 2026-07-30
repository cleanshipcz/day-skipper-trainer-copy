import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { loadQuizTopic } from "@/data/quizzes";
import { fetchDueCount, fetchDueQuestions, recordReview, seedQuizQuestions } from "./reviewService";

const queryClient = (result: object) => {
  const chain = {
    select: vi.fn(), eq: vi.fn(), lte: vi.fn(), order: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.lte.mockReturnValue(chain);
  chain.order.mockResolvedValue(result);
  return { client: { from: vi.fn(() => chain) } as unknown as SupabaseClient<Database>, chain };
};

describe("review seeding retries", () => {
  test("should retry the same bounded canonical ids after a transient failure", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ error: new Error("offline") })
      .mockResolvedValueOnce({ error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const ids = (await loadQuizTopic("anchorwork")).map(({ id }) => id);

    await expect(seedQuizQuestions(client, "anchorwork", ids)).rejects.toThrow("offline");
    await expect(seedQuizQuestions(client, "anchorwork", ids)).resolves.toBeUndefined();

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
  });

  test("should not send unknown or duplicate ids to the server", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const id = (await loadQuizTopic("anchorwork"))[0].id;

    await seedQuizQuestions(client, "anchorwork", [id, "unknown", id]);

    expect(rpc).toHaveBeenCalledWith("seed_question_reviews", { p_question_ids: [id] });
  });

  test("does not call the server when no canonical ids remain", async () => {
    const rpc = vi.fn();
    await seedQuizQuestions({ rpc } as never, "missing-topic", ["unknown"]);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("review queries and saves", () => {
  test("fetches due records and propagates query errors", async () => {
    const due = new Date("2026-07-30T10:00:00Z");
    const success = queryClient({ data: [], error: null });
    await expect(fetchDueQuestions(success.client, "user", due)).resolves.toEqual([]);
    expect(success.chain.lte).toHaveBeenCalledWith("next_review_at", due.toISOString());

    const failure = queryClient({ data: null, error: new Error("query failed") });
    await expect(fetchDueQuestions(failure.client, "user", due)).rejects.toThrow("query failed");
  });

  test("returns exact due counts, defaults null, and propagates errors", async () => {
    const createCountClient = (result: object) => {
      const terminal = { lte: vi.fn().mockResolvedValue(result) };
      const eq = vi.fn(() => terminal);
      const select = vi.fn(() => ({ eq }));
      return { from: vi.fn(() => ({ select })) } as unknown as SupabaseClient<Database>;
    };
    await expect(fetchDueCount(createCountClient({ count: 3, error: null }), "user")).resolves.toBe(3);
    await expect(fetchDueCount(createCountClient({ count: null, error: null }), "user")).resolves.toBe(0);
    await expect(fetchDueCount(createCountClient({ error: new Error("count failed") }), "user"))
      .rejects.toThrow("count failed");
  });

  test("validates review input and handles every RPC result", async () => {
    const questionId = (await loadQuizTopic("anchorwork"))[0].id;
    const reviewedAt = new Date("2026-07-30T10:00:00Z");
    const row = { id: "row" };
    const rpc = vi.fn().mockResolvedValue({ data: row, error: null });
    await expect(recordReview({ rpc } as never, questionId, 5, "review", reviewedAt)).resolves.toBe(row);
    expect(rpc).toHaveBeenCalledWith("record_question_review", expect.objectContaining({
      p_question_id: questionId, p_quality: 5, p_review_id: "review",
    }));

    await expect(recordReview({ rpc } as never, "unknown", 5, "review", reviewedAt))
      .rejects.toThrow("Unknown review question");
    for (const quality of [-1, 6, 1.5]) {
      await expect(recordReview({ rpc } as never, questionId, quality, "review", reviewedAt))
        .rejects.toThrow("quality must be an integer from 0 to 5");
    }
    await expect(recordReview(
      { rpc: vi.fn().mockResolvedValue({ error: new Error("save failed") }) } as never,
      questionId, 3, "review", reviewedAt,
    )).rejects.toThrow("save failed");
    await expect(recordReview(
      { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) } as never,
      questionId, 3, "review", reviewedAt,
    )).rejects.toThrow("Review save returned no row");
  });
});
