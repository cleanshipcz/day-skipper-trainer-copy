# Quality baseline

Issue 59 established a repeatable quality gate for the post-E0 application.

## Automated gates

Run the same checks locally that CI runs:

```sh
npm run lint
npm run typecheck
npm run test -- --run --maxWorkers=1
npm run test:coverage -- --maxWorkers=1
npm run guard:coverage-scope
npm run build
npm run test:build-budget
npm run guard:migrations
npm run guard:no-internal-artifacts
```

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
  and invalid UTC date/time prefixes.

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
