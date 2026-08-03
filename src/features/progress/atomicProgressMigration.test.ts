// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260729235500_atomic_save_topic_progress.sql"),
  "utf8",
).toLowerCase();
const ropeworkCatalogueSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260801170000_register_ropework_progress.sql"),
  "utf8",
).toLowerCase();
const anchorworkCatalogueSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260801183000_register_anchorwork_progress.sql"),
  "utf8",
).toLowerCase();
const atomicAnchorworkSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260801190000_atomic_anchorwork_progress.sql"),
  "utf8",
).toLowerCase();
const anchorPracticeCatalogueSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260802050000_register_anchor_practice_progress.sql"),
  "utf8",
).toLowerCase();
const atomicAnchorPracticeSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260802053000_atomic_anchor_practice_progress.sql"),
  "utf8",
).toLowerCase();

describe("atomic progress migration", () => {
  it("derives identity from auth.uid and accepts no user-id argument", () => {
    const signature = sql.slice(sql.indexOf("save_topic_progress("), sql.indexOf("returns table"));
    expect(signature).toContain("p_topic_id");
    expect(signature).not.toContain("p_user_id");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("authentication required");
  });

  it("serializes first completion and awards through an immutable ledger", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("insert into public.user_progress");
    expect(sql).toContain("v_completion_awarded");
    expect(sql).toContain("insert into public.progress_awards");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
    expect(sql).toContain("primary key (user_id, topic_id)");
    expect(sql).toContain("update public.profiles");
  });

  it("uses server-catalogued rewards and never uses the caller-controlled point amount", () => {
    expect(sql).toContain("application-owned catalogue");
    expect(sql).toContain("p_points remains in the");
    expect(sql).toContain("when 'weather-systems' then 10");
    expect(sql).toContain("when 'weather-beaufort' then 10");
    expect(sql).toContain("when 'weather-forecasts' then 10");
    expect(sql).toContain("when 'weather-fog' then 10");
    expect(sql).toContain("when 'pilotage-plan' then 15");
    expect(sql).toContain("unknown progress topic");
    expect(sql).toContain("return query select");
    expect(sql).not.toMatch(/coalesce\(p_points,\s*0\)/);
    expect(sql).not.toMatch(/v_award_points\s*:=\s*p_points/);
    expect(sql).toContain("coalesce(points, 0) + v_award_points");
  });

  it("registers ropework with a server-owned 105 point completion reward", () => {
    expect(ropeworkCatalogueSql).toContain("'ropework', 'pilotage-plan'");
    expect(ropeworkCatalogueSql).toContain("when 'ropework' then 105");
    expect(ropeworkCatalogueSql).toContain("save_topic_progress catalogue marker was not found");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
  });

  it("registers anchorwork with a server-owned 100 point completion reward", () => {
    expect(anchorworkCatalogueSql).toContain("'anchorwork', 'ropework', 'pilotage-plan'");
    expect(anchorworkCatalogueSql).toContain("when 'anchorwork' then 100");
    expect(anchorworkCatalogueSql).toContain("anchorwork catalogue marker was not found");
  });

  it("registers Anchor practice as diagnostic progress with no reward case", () => {
    expect(anchorPracticeCatalogueSql).toContain("'anchorwork-practice', 'ropework', 'pilotage-plan'");
    expect(anchorPracticeCatalogueSql).not.toContain("when 'anchorwork-practice'");
    expect(anchorPracticeCatalogueSql).toContain("practice catalogue marker was not found");
  });

  it("keeps completed Anchor practice mutable without rewards or mastery regression", () => {
    expect(atomicAnchorPracticeSql).toContain("public.user_progress.completed or excluded.completed");
    expect(atomicAnchorPracticeSql).toContain("answers_history = excluded.answers_history");
    expect(atomicAnchorPracticeSql).toContain("v_merged_families");
    expect(atomicAnchorPracticeSql).toContain("v_was_completed or v_family_count = 4");
    expect(atomicAnchorPracticeSql).toContain("greatest(v_attempts");
    expect(atomicAnchorPracticeSql).toContain("invalid anchor practice checkpoint bounds");
    expect(atomicAnchorPracticeSql).toContain("v_index > v_existing_index");
    expect(atomicAnchorPracticeSql).toContain("v_seed >= v_existing_seed");
    expect(atomicAnchorPracticeSql).toContain("pg_advisory_xact_lock");
    expect(atomicAnchorPracticeSql).toContain("return query select false");
    expect(atomicAnchorPracticeSql).not.toContain("insert into public.progress_awards");
    expect(atomicAnchorPracticeSql).toContain("generic anchor practice catalogue marker was not found");
  });

  it("merges stale Anchorwork snapshots monotonically under a user-scoped lock", () => {
    expect(atomicAnchorworkSql).toContain("pg_advisory_xact_lock");
    expect(atomicAnchorworkSql).toContain("v_existing_ids || p_completed_topic_ids");
    expect(atomicAnchorworkSql).toContain("greatest(coalesce(public.user_progress.score, 0), excluded.score)");
    expect(atomicAnchorworkSql).toContain("on conflict (user_id, topic_id) do nothing");
  });

  it("derives Anchorwork completion from the exact server catalogue", () => {
    expect(atomicAnchorworkSql).toContain("invalid anchorwork topic ids");
    expect(atomicAnchorworkSql).toContain("submitted.id <> all(v_catalogue)");
    expect(atomicAnchorworkSql).toContain("v_is_complete := cardinality(v_merged_ids) = cardinality(v_catalogue)");
    expect(atomicAnchorworkSql).not.toContain("p_completed boolean");
    expect(atomicAnchorworkSql).toContain("gamification");
  });

  it("removes Anchorwork from the forgeable generic completion RPC", () => {
    expect(atomicAnchorworkSql).toContain("generic progress anchorwork catalogue marker was not found");
    expect(atomicAnchorworkSql).toContain("position($$when 'anchorwork' then 100$$ in updated_definition) > 0");
  });

  it("supports direct completion without a forgeable client engagement ceremony", () => {
    expect(sql).not.toContain("progress_engagements");
    expect(sql).not.toContain("verified completion evidence required");
    expect(sql).not.toContain("clock_timestamp() - interval");
    expect(sql).toContain("v_completion_awarded := coalesce(p_completed, false)");
  });

  it("validates mutable progress and preserves completed evidence", () => {
    expect(sql).toContain("score must be between 0 and 100");
    expect(sql).toContain("jsonb_typeof(p_answers_history) <> 'object'");
    expect(sql).toContain("pg_column_size(p_answers_history) > 65536");
    expect(sql).toContain("case when public.user_progress.completed");
    expect(sql).toContain("then public.user_progress.answers_history");
  });

  it("keeps award history outside resettable progress with no delete grant or policy", () => {
    expect(sql).toContain("revoke all on public.progress_awards");
    expect(sql).toContain("grant select on public.progress_awards");
    expect(sql).not.toContain("for delete");
    expect(sql).not.toContain("delete from public.progress_awards");
  });

  it("backfills immutable markers for completed rows before defining the RPC", () => {
    const backfill = sql.indexOf("select up.user_id, up.topic_id, 0");
    const functionDefinition = sql.indexOf("create or replace function public.save_topic_progress");
    expect(backfill).toBeGreaterThan(0);
    expect(backfill).toBeLessThan(functionDefinition);
    expect(sql).toContain("from public.user_progress up");
    expect(sql).toContain("where up.completed is true");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
  });

  it("restricts execution to authenticated users", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("revoke all");
    expect(sql).toContain("from anon");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("increment_user_points(uuid, integer) from authenticated");
  });

  it("prevents direct client mutation of progress and profile points", () => {
    expect(sql).toContain("revoke insert, update on public.user_progress from anon, authenticated");
    expect(sql).toContain("revoke insert, update on public.profiles from anon, authenticated");
    expect(sql).toContain("grant update (username, display_name, avatar_url, learning_preferences, updated_at)");
    expect(sql).not.toMatch(/grant (insert|update) \([^)]*points/);
    expect(sql).toContain("where user_id = v_user_id");
    expect(sql).not.toContain("where id = v_user_id");
  });
});
