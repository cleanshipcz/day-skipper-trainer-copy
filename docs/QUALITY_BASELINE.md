# Quality baseline

Issue 59 established a repeatable quality gate for the post-E0 application.

## Automated gates

Run the same checks locally that CI runs:

```sh
npm run lint
npm run typecheck
npm run test -- --run --maxWorkers=1
npm run guard:coverage-scope && npm run test:coverage -- --maxWorkers=1
npm run build
npm run test:build-budget
npm run guard:migrations
npm run guard:no-internal-artifacts
```

### Chained-branch migration base

CI supplies `MIGRATION_BASE_SHA` from the pull request base. On a local chained
branch, set it to that branch's intended base commit before running
`guard:migrations`:

```sh
export MIGRATION_BASE_SHA="$(git rev-parse origin/<base-branch>)"
npm run guard:migrations
```

The guard fails closed when it cannot resolve a comparison base. This prevents
an existing migration from being changed alongside its manifest entry.

Vitest coverage is enforced per file at 90% for lines, statements, functions, and
branches across the architecture seams changed or extended by current work:
topic registry, dashboard completion, progress persistence, and quiz
progress/session logic. Route factories are checked structurally because
executing every dynamic import would turn the unit gate into a full page smoke
suite. `scripts/coverage-scope.json` defines the protected architecture
directories and files; `guard:coverage-scope` fails when a new production
module in those directories is not opted into coverage. New or changed code
therefore cannot bypass the per-file gate. The HTML
report is generated in `coverage/` and is ignored by Git.

### Stateful feature coverage expansion

Issue 70 expanded the protected scope to every production module in
`features/exam`, `features/spaced-repetition`, `features/engagement`,
`features/offline`, and `features/export`. The scope guard now enforces 21
modules in total; adding a production module under any protected directory
requires adding it to `scripts/coverage-scope.json`, after which the unchanged
90% per-file thresholds apply.

All included files meet the threshold. The only explicit coverage exclusions
in the new scope are the IndexedDB `onerror`/`onabort` callbacks in
`progressQueue.ts`. Those callbacks contain no domain decision: each only
forwards the browser-provided error to an existing rejected Promise. Successful
transactions, schema creation, legacy queue hydration, retry/quarantine
decisions, and stale-revision races remain behaviorally tested. This narrow
platform-adapter exclusion avoids pretending that fake IndexedDB event
injection tests validate a browser implementation.

Resource measurement on 2026-07-30, using Node 22 with one Vitest worker:

| Job | Tests | Vitest duration | Wall time | Peak RSS |
| --- | ---: | ---: | ---: | ---: |
| Default test | 630 | 61.76s | 62.39s | 318 MiB |
| Coverage | 630 | 69.24s | 70.24s | 429 MiB |

The measured coverage result was 100% statements, functions, and lines and
97.1% branches across the protected scope. These measurements are a regression
reference, not a reason to weaken thresholds; investigate material growth
beyond roughly 90 seconds or 512 MiB before expanding the scope further.

### Route-family smoke inventory

`scripts/route-family-inventory.json` maps every top-level route root to a
representative route, its test file, and either a focused render-smoke or an
existing behavior-test decision. `src/app/routes.test.ts` compares that
inventory with the route registry, verifies each representative route and test
file exists, and fails when a new top-level route family has no explicit
decision.

`tests/routeFamilies.smoke.test.tsx` supplies the previously missing
authentication/error, nautical-basics, rules/lights, tides, and
passage-planning representatives. It uses the reusable
`tests/RouteSmokeHarness.tsx` with in-memory routing and a local anonymous auth
context; Supabase auth and progress badges are replaced with fail-visible
hermetic test doubles. These are render and critical-navigation checks, not
duplicated assertions over static lesson copy. Focused behavior remains in the
feature and page tests named by the inventory.

## Baseline findings

- The topic registry contains 46 stable progress IDs across all 13 syllabus
  areas. Route tests verify every registry route and all 12 dashboard roots.
  `durableProgressIds.ts` is the checked-in compatibility snapshot and must
  remain an exact match.
- The quiz registry contains 16 question banks. Consistency tests require all
  topic quiz links to resolve to a bank and require question-bank metadata to
  match exactly.
- Four remaining passage-planning persistence call sites now use `TOPIC_IDS`
  rather than duplicating durable progress key strings.
- Progress writes use one authenticated atomic RPC; malformed or null outcomes
  now fail closed rather than being coerced into a plausible award result.
- CI now runs coverage, build-budget, migration, and internal-artifact guards
  in addition to lint, typecheck, tests, and production build.
- The migration manifest pins the name and SHA-256 of every applied migration;
  the guard rejects deletion, edits, empty sets/files, duplicate timestamps,
  and invalid UTC date/time prefixes. Existing migrations are also compared
  byte-for-byte with the PR base commit, so changing both SQL and manifest
  cannot bypass immutability. Add a new timestamped SQL file and append its
  SHA-256 to `supabase/migrations/manifest.json`; never edit an existing file.
  CI supplies the PR base automatically; see
  [Chained-branch migration base](#chained-branch-migration-base) for local
  validation.

## Explicitly out of scope

- Quiz data is still imported eagerly into one registry module. Route chunks
  are lazy, but splitting individual question banks needs an async loading
  state and cache/error UX in the quiz page; that product-visible refactor is
  separate debt.
- Legacy large, compressed page components were not reformatted solely for
  style. Refactoring them without behavioral changes has no measurable runtime
  benefit and would make this hardening diff harder to review.
- Live Supabase concurrency tests remain opt-in (`npm run test:live-db`) because
  they require an isolated configured backend. Migration/RLS contract tests
  and mocked retry/race tests remain part of the default suite.
