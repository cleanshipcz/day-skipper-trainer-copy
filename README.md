# Day Skipper Trainer

A web application for RYA Day Skipper shorebased training, built with React,
TypeScript, Vite, Tailwind CSS, and Supabase.

## Requirements

- Node.js 22 (the version used by CI)
- npm, using the committed `package-lock.json`
- Docker and the Supabase CLI only when running the local database or live
  database tests

## Clean-checkout setup

```sh
git clone https://github.com/cleanshipcz/day-skipper-trainer-copy.git
cd day-skipper-trainer-copy
npm ci
npm run dev
```

`npm ci` is the supported reproducible install workflow. Use `npm install` only
when intentionally changing dependencies and committing the resulting lockfile
update.

The application expects these public client configuration variables:

```sh
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
```

Put local values in an ignored `.env.local` file. Never commit credentials or a
Supabase service-role key.

## Quality gates

The following block is kept in sync with the `run` commands in the CI quality
job by `scripts/qualityGuards.test.ts`.

<!-- ci-quality-commands:start -->
```sh
npm run lint
npm run typecheck
npm run test -- --run --maxWorkers=1
npm run guard:coverage-scope && npm run test:coverage -- --maxWorkers=1
npm run build
npm run setup:anchor-browser
npm run test:anchor-browser
npm run test:build-budget
npm run test:quiz-chunks
npm run guard:migrations
npm run guard:no-internal-artifacts
```
<!-- ci-quality-commands:end -->

CI supplies `MIGRATION_BASE_SHA` for the migration guard. When validating a
chained branch locally, set it to the intended base branch commit before
running the block:

```sh
export MIGRATION_BASE_SHA="$(git rev-parse origin/<base-branch>)"
```

See [Quality baseline](docs/QUALITY_BASELINE.md#automated-gates) for coverage
scope and [migration-base guidance](docs/QUALITY_BASELINE.md#chained-branch-migration-base)
for the guard's fail-closed behavior.

The live Supabase concurrency suite is intentionally separate:

```sh
npm run test:live-db
```

It requires an isolated configured database and is not part of the default CI
suite.

## Local Supabase

With Docker running, install the pinned project dependencies and start the
local stack:

```sh
npm ci
npm run supabase:start
npm run dev
```

Regenerate the checked-in TypeScript types after adding a migration:

```sh
npm run supabase:types
```

That command starts the local stack, resets it from the complete migration
chain, and writes normalized output from the exact Supabase CLI version pinned
in `package-lock.json`. It uses only the disposable local Docker services and
does not require production credentials. CI runs
`npm run guard:supabase-types` against the same migrated local schema and
fails with the regeneration command if the checked-in file differs. Stop the
stack with `npm run supabase:stop` when finished.

Migrations are forward-only. Add a new timestamped migration and update the
manifest; never edit an applied migration. The full conventions are recorded
in [the historical feature execution plan](docs/FEATURE_TASKS.md#supabase-migration-conventions)
and enforced by `npm run guard:migrations`.

## Project documentation

[Documentation index](docs/README.md) identifies current normative guidance
and historical planning/audit records. Start there before treating a planning
document as current requirements.

## Production

Production deployment and environment configuration are managed outside this
repository. Do not copy local keys into production or commit production values.
