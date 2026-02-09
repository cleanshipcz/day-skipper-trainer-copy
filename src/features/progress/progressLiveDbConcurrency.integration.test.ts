import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { saveProgressRecord } from "./progressPersistence";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasLiveDbConfig = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const describeLiveDb = hasLiveDbConfig ? describe : describe.skip;

describeLiveDb("live DB concurrency stress — progress integrity", () => {
  it("preserves additive points under concurrent progress writes", async () => {
    const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const userId = randomUUID();
    const completions = Array.from({ length: 20 }, (_, index) => ({
      topicId: `stress-topic-${index}`,
      pointsEarned: 5,
    }));

    const expectedPoints = completions.reduce((total, completion) => total + completion.pointsEarned, 0);

    const { error: createProfileError } = await supabase.from("profiles").insert({
      user_id: userId,
      username: `stress_${userId.slice(0, 8)}`,
      points: 0,
    });

    expect(createProfileError).toBeNull();

    try {
      await Promise.all(
        completions.map((completion) =>
          saveProgressRecord({
            supabaseClient: supabase as never,
            userId,
            topicId: completion.topicId,
            completed: true,
            score: 100,
            pointsEarned: completion.pointsEarned,
          })
        )
      );

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points")
        .eq("user_id", userId)
        .single();

      expect(profileError).toBeNull();
      expect(profile?.points).toBe(expectedPoints);
    } finally {
      await supabase.from("user_progress").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("user_id", userId);
    }
  });
});
