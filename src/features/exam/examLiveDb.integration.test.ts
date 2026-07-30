import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/integrations/supabase/types";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const describeLive = url && serviceKey && anonKey ? describe : describe.skip;

describeLive("live DB — exam isolation and concurrency", () => {
  it("keeps attempts immutable/user-scoped and awards completion once", async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    const clients = [0, 1].map(() => createClient<Database>(url!, anonKey!, { auth: { persistSession: false } }));
    const users: string[] = [];
    try {
      for (let index = 0; index < 2; index++) {
        const suffix = randomUUID();
        const email = `exam-live-${suffix}@example.invalid`;
        const password = `Test-${suffix}-Aa1!`;
        const { data } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        const userId = data.user!.id; users.push(userId);
        await admin.from("profiles").upsert({ user_id: userId, username: `exam_${suffix.slice(0, 8)}`, points: 0 });
        await clients[index].auth.signInWithPassword({ email, password });
      }
      const attemptId = randomUUID();
      const args = {
        p_attempt_id: attemptId, p_score: 1, p_total_questions: 1, p_time_taken_seconds: 10,
        p_topic_breakdown: { safety: { correct: 1, total: 1, percentage: 100 } }, p_pass_mark: 65,
      };
      const outcomes = await Promise.all(Array.from({ length: 8 }, () => clients[0].rpc("submit_exam_result", args)));
      expect(outcomes.every(({ error }) => !error)).toBe(true);
      const { count } = await admin.from("exam_completion_awards").select("*", { count: "exact", head: true }).eq("user_id", users[0]);
      expect(count).toBe(1);
      const { data: profile } = await admin.from("profiles").select("points").eq("user_id", users[0]).single();
      expect(profile?.points).toBe(10);
      const { data: duplicate } = await clients[0].from("exam_results").select("*").eq("attempt_id", attemptId);
      expect(duplicate).toHaveLength(1);
      const { data: isolated } = await clients[1].from("exam_results").select("*").eq("attempt_id", attemptId);
      expect(isolated).toHaveLength(0);
      const malformed = await clients[0].rpc("submit_exam_result", {
        ...args, p_attempt_id: randomUUID(), p_topic_breakdown: { unknown: { correct: 1, total: 1, percentage: 100 } },
      });
      expect(malformed.error).not.toBeNull();
    } finally {
      await Promise.all(users.map((id) => admin.auth.admin.deleteUser(id)));
    }
  });
});
