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

      const fullLightsEvidence = {
        catalogueRevision: "colregs-parts-c-d-annex-iv-v1",
        completionState: "completed",
        visitedSectionIds: ["part-c-recognition", "part-d-recognition", "distress-recognition"],
      };
      const directGenericLights = await userClient.rpc("save_topic_progress", {
        p_topic_id: "lights-theory", p_completed: true, p_score: 100, p_points: 10, p_answers_history: fullLightsEvidence,
      });
      expect(directGenericLights.error).not.toBeNull();

      for (const invalid of [
        { p_completed: null, p_score: 100, p_answers_history: fullLightsEvidence },
        { p_completed: true, p_score: null, p_answers_history: fullLightsEvidence },
        { p_completed: true, p_score: 100, p_answers_history: null },
        { p_completed: true, p_score: 67, p_answers_history: fullLightsEvidence },
      ]) {
        const outcome = await userClient.rpc("save_lights_theory_progress", invalid as never);
        expect(outcome.error).not.toBeNull();
      }

      const completedLights = await userClient.rpc("save_lights_theory_progress", {
        p_completed: true, p_score: 100, p_answers_history: fullLightsEvidence,
      });
      expect(completedLights.error).toBeNull();
      const delayedIncompleteLights = await userClient.rpc("save_lights_theory_progress", {
        p_completed: false,
        p_score: 33,
        p_answers_history: {
          catalogueRevision: "colregs-parts-c-d-annex-iv-v1",
          completionState: "in_progress",
          visitedSectionIds: ["part-c-recognition"],
        },
      });
      expect(delayedIncompleteLights.error).toBeNull();
      const { data: lightsRow, error: lightsReadError } = await admin.from("user_progress")
        .select("completed, score, answers_history")
        .eq("user_id", userId).eq("topic_id", "lights-theory").single();
      expect(lightsReadError).toBeNull();
      expect(lightsRow?.completed).toBe(true);
      expect(lightsRow?.score).toBe(100);
      expect(lightsRow?.answers_history).toEqual(fullLightsEvidence);

      const readinessIds = ["passage-plan","charts-notices","tides-ukc","forecast","planning-decision","crew-fitness","crew-brief","documents-shore","hull-openings","bilge-steering","rig-deck","electrical-gas","nav-signals","emergency-readiness","conditional-survival","provisions","stowage-hatches","cold-fluids","machinery-space","prop-clear","ventilation","start-sequence","pressure-charge","cooling-exhaust","running-scan","controls-steering","vhf-dsc","departure-ready","final-information","final-decision"];
      const validEntry = { status: "satisfactory", reason: "", notes: "", evidence: "checked", responsiblePerson: "skipper", recordedAt: "2026-08-11T16:00:00Z", history: [] };
      const fullReadiness = { version: 1, context: { vessel: "Aster", voyage: "Cowes", conditions: "F4" }, entries: Object.fromEntries(readinessIds.map((id) => [id, validEntry])), updatedAt: "2026-08-11T16:00:00Z" };
      const adversarialReadiness = [
        { p_completed: null, p_answers_history: { readinessRecord: fullReadiness } },
        { p_completed: true, p_answers_history: {} },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, context: null } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, updatedAt: null } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, context: { ...fullReadiness.context, vessel: "   " } } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, context: { ...fullReadiness.context, voyage: "" } } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, context: { ...fullReadiness.context, conditions: "\t" } } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, entries: { ...fullReadiness.entries, "passage-plan": { ...validEntry, status: null } } } } },
        { p_completed: true, p_answers_history: { readinessRecord: { ...fullReadiness, entries: { ...fullReadiness.entries, "passage-plan": { ...validEntry, history: [{ ...validEntry, supersededAt: null }] } } } } },
      ];
      for (const forged of adversarialReadiness) {
        const outcome = await userClient.rpc("save_readiness_record_progress", forged as never);
        expect(outcome.error).not.toBeNull();
      }
      const forgedReadinessRow = await admin.from("user_progress").select("topic_id").eq("user_id", userId).eq("topic_id", "passage-planning-checklist").maybeSingle();
      expect(forgedReadinessRow.data).toBeNull();
      const forgedReadinessAward = await admin.from("progress_awards").select("topic_id", { count: "exact", head: true }).eq("user_id", userId).eq("topic_id", "passage-planning-checklist");
      expect(forgedReadinessAward.count).toBe(0);

      const checkpoint = (sequenceIndex: number, attempts: number, families = ["sheltered", "harbour", "exposed", "tidal"]) => ({
        version: 1, completedFamilies: families, attempts, failedChecks: Math.min(2, attempts),
        scenarioSeed: 7, sequenceIndex,
        scenarioIdentity: `anchor-7-${Math.floor(sequenceIndex / 4) + 1}-${sequenceIndex % 4 + 1}-sheltered`,
      });
      const malformed = await userClient.rpc("save_anchorwork_practice_progress", {
        p_completed: false, p_score: 0, p_answers_history: { ...checkpoint(1, 1), scenarioIdentity: "wrong" },
      });
      expect(malformed.error).not.toBeNull();

      const [newer, stale] = await Promise.all([
        userClient.rpc("save_anchorwork_practice_progress", { p_completed: true, p_score: 100, p_answers_history: checkpoint(9, 8) }),
        userClient.rpc("save_anchorwork_practice_progress", { p_completed: false, p_score: 25, p_answers_history: checkpoint(3, 3, ["sheltered"]) }),
      ]);
      expect(newer.error).toBeNull();
      expect(stale.error).toBeNull();
      const { data: practice } = await admin.from("user_progress").select("completed, score, answers_history").eq("user_id", userId).eq("topic_id", "anchorwork-practice").single();
      expect(practice?.completed).toBe(true);
      expect(practice?.score).toBe(100);
      expect(practice?.answers_history).toEqual(expect.objectContaining({ sequenceIndex: 9, attempts: 8, completedFamilies: ["sheltered", "harbour", "exposed", "tidal"] }));
      const practiceAwards = await admin.from("progress_awards").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("topic_id", "anchorwork-practice");
      expect(practiceAwards.count).toBe(0);
    } finally {
      await admin.auth.admin.deleteUser(userId);
    }
  });
});
