import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260812152000_version_personal_safety_mastery.sql", "utf8").toLowerCase();
const progressRpc = readFileSync("supabase/migrations/20260729235500_atomic_save_topic_progress.sql", "utf8").toLowerCase();

describe("personal safety mastery migration", () => {
  it("makes legacy completion stale without erasing its audit record", () => {
    expect(sql).toMatch(/create table public\.personal_safety_legacy_progress/);
    expect(sql).toMatch(/user_id uuid primary key/);
    expect(sql).toMatch(/select up\.user_id, up\.completed, up\.score, up\.last_accessed, up\.answers_history/);
    expect(sql).toMatch(/exists \(\s+select 1 from public\.progress_awards/);
    expect(sql).toMatch(/on conflict \(user_id\) do nothing/);
    expect(sql).toMatch(/set completed = false,\s+score = 0,\s+answers_history = null/);
    expect(sql).not.toMatch(/last_accessed\s*=\s*now\(\)/);
  });

  it("keeps the audit snapshot immutable, owner-scoped, bounded, and separate from future RPC replacement", () => {
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/revoke all on public\.personal_safety_legacy_progress from public, anon, authenticated/);
    expect(sql).toMatch(/grant select on public\.personal_safety_legacy_progress to authenticated/);
    expect(sql).toMatch(/using \(\(select auth\.uid\(\)\) = user_id\)/);
    expect(sql).not.toMatch(/grant (insert|update|delete).*personal_safety_legacy_progress/);
    expect(progressRpc).toMatch(/on conflict \(user_id, topic_id\) do update/);
    expect(progressRpc).toMatch(/answers_history = case/);
    expect(progressRpc).not.toContain("personal_safety_legacy_progress");
  });

  it("requires exact current v2 evidence for new completion", () => {
    expect(sql).toContain("personal-safety-practical-v2");
    expect(sql).toContain('["pfd","fit","tether","kill-cord","beacon"]');
    expect(sql).toMatch(/jsonb_array_length\(evidence -> 'masteredscenarioids'\) <> 5/);
  });
});
