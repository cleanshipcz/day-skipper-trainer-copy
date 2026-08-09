import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Tides progress catalogue migration", () => {
  const sql = readFileSync("supabase/migrations/20260809210000_canonical_tides_progress.sql", "utf8").toLowerCase();
  it("merges both historical aliases before removing them and updates the RPC catalogue", () => {
    expect(sql).toContain("canonical.completed or legacy.completed");
    expect(sql).toContain("'tidal-heights-calc'");
    expect(sql).toContain("'tides-heights-calc'");
    expect(sql).toContain("'vector-triangle'");
    expect(sql).toContain("'tides-vector-tool'");
    expect(sql).toContain("pg_get_functiondef");
    expect(sql).toContain("regexp_replace");
    expect(sql).toContain("failed to canonicalize tides progress rpc catalogue");
    expect(sql).toContain("legacy.completed::integer, legacy.score");
  });
});
