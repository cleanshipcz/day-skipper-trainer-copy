import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { saveProgressRecord } from "./progressPersistence";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hasLiveDbConfig = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY,
);

const describeLiveDb = hasLiveDbConfig ? describe : describe.skip;

describeLiveDb("live DB concurrency stress — progress integrity", () => {
  it("atomically awards each catalogued topic once to an authenticated user", async () => {
    const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userClient = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const suffix = randomUUID();
    const email = `progress-stress-${suffix}@example.invalid`;
    const password = `Test-${suffix}-Aa1!`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(createError).toBeNull();
    const userId = created.user!.id;

    try {
      const { error: profileError } = await admin.from("profiles").upsert({
        user_id: userId,
        username: `stress_${suffix.slice(0, 8)}`,
        points: 0,
      }, { onConflict: "user_id" });
      expect(profileError).toBeNull();

      const { error: signInError } = await userClient.auth.signInWithPassword({ email, password });
      expect(signInError).toBeNull();

      const topics = ["weather-systems", "weather-beaufort", "weather-forecasts", "weather-fog"];
      const attempts = topics.flatMap((topicId) =>
        Array.from({ length: 5 }, () =>
          saveProgressRecord({
            supabaseClient: userClient,
            userId,
            topicId,
            completed: true,
            score: 100,
            pointsEarned: 1_000_000,
          }),
        ),
      );
      const outcomes = await Promise.all(attempts);

      expect(outcomes.filter(({ pointsAwarded }) => pointsAwarded)).toHaveLength(topics.length);
      expect(outcomes.reduce((sum, result) => sum + result.awardedPoints, 0)).toBe(40);

      const { data: profile, error: readProfileError } = await admin
        .from("profiles")
        .select("points")
        .eq("user_id", userId)
        .single();
      expect(readProfileError).toBeNull();
      expect(profile?.points).toBe(40);

      const { count, error: ledgerError } = await admin
        .from("progress_awards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      expect(ledgerError).toBeNull();
      expect(count).toBe(topics.length);
    } finally {
      await admin.auth.admin.deleteUser(userId);
    }
  });
});
