# Quality baseline

Issue 59 established a repeatable quality gate for the post-E0 application.

## Automated gates

Run the same checks locally that CI runs:

```sh
npm run lint
npm run typecheck
npm run test -- --run --maxWorkers=1
npm run test:coverage -- --maxWorkers=1
npm run build
npm run test:build-budget
npm run guard:migrations
npm run guard:no-internal-artifacts
```

Vitest coverage is enforced at 90% for lines, statements, functions, and
branches across the architecture seams changed or extended by current work:
topic registry, dashboard completion, progress persistence, and quiz
progress/session logic. Route factories are checked structurally because
executing every dynamic import would turn the unit gate into a full page smoke
suite. Add a module to `coverage.include` when extending one
of these seams; new or changed code must not bypass the 90% gate. The HTML
report is generated in `coverage/` and is ignored by Git.

## Baseline findings

- The topic registry contains 46 stable progress IDs across all 13 syllabus
  areas. Route tests verify every registry route and all 12 dashboard roots.
- The quiz registry contains 16 question banks. Consistency tests require all
  topic quiz links to resolve to a bank and require question-bank metadata to
  match exactly.
- Four remaining passage-planning persistence call sites now use `TOPIC_IDS`
  rather than duplicating durable progress key strings.
- Progress writes use one authenticated atomic RPC; malformed or null outcomes
  now fail closed rather than being coerced into a plausible award result.
- CI now runs coverage, build-budget, migration, and internal-artifact guards
  in addition to lint, typecheck, tests, and production build.

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
