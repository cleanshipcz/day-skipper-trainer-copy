import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { quizRegistry } from "@/data/quizzes";
import { seedQuizQuestions } from "./reviewService";

describe("review seeding retries", () => {
  test("should retry the same bounded canonical ids after a transient failure", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ error: new Error("offline") })
      .mockResolvedValueOnce({ error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const ids = quizRegistry.anchorwork.map(({ id }) => id);

    await expect(seedQuizQuestions(client, "anchorwork", ids)).rejects.toThrow("offline");
    await expect(seedQuizQuestions(client, "anchorwork", ids)).resolves.toBeUndefined();

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
  });

  test("should not send unknown or duplicate ids to the server", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const client = { rpc } as unknown as SupabaseClient<Database>;
    const id = quizRegistry.anchorwork[0].id;

    await seedQuizQuestions(client, "anchorwork", [id, "unknown", id]);

    expect(rpc).toHaveBeenCalledWith("seed_question_reviews", { p_question_ids: [id] });
  });
});
