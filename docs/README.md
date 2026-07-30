# Documentation index

Documents are classified so historical plans are not mistaken for current
developer instructions.

## Normative documentation

These documents describe the current repository behavior or constraints:

- [`README.md`](../README.md) — supported local setup, quality commands, and
  development workflow.
- [`QUALITY_BASELINE.md`](QUALITY_BASELINE.md) — enforced quality gates,
  protected coverage scope, migration immutability, and known limitations.
- [`POINTS_TRUST_MODEL.md`](POINTS_TRUST_MODEL.md) — security and trust
  boundaries for progress and points.
- [`BROWSER_PERSISTENCE.md`](BROWSER_PERSISTENCE.md) — browser record versions,
  owner-scoped keys, cleanup, and storage exceptions.
- [`FEATURES.md`](FEATURES.md) — current syllabus coverage map. Update it when
  product coverage changes.

Repository automation and configuration remain authoritative if prose drifts:
`package.json`, `.github/workflows/ci.yml`, `vite.config.ts`,
`scripts/coverage-scope.json`, and the Supabase migration manifest.

## Historical records

These are dated snapshots or planning inputs. They provide context but do not
override normative documentation or current GitHub issues:

- [`FEATURE_TASKS.md`](FEATURE_TASKS.md) — execution plan generated
  2026-03-26. Story statuses and setup proposals reflect points in time.
- [`TECH_DEBT_AUDIT.md`](TECH_DEBT_AUDIT.md) — audit captured 2026-07-30 to
  seed issue proposals. GitHub issues are the backlog after triage.

When a historical document conflicts with current automation, follow the
automation and update the normative documentation.
