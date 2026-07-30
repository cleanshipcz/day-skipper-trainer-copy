# Technical debt audit

**Audit date:** 2026-07-30  
**Baseline:** `agent/59-architecture-quality-hardening` at `7fdaea2`

This audit turns maintainability and reliability risks into independently
deliverable GitHub issue proposals. It is not a refactoring specification:
each proposal requires preserving current user-visible behavior unless its
acceptance criteria explicitly say otherwise.

## Method

The audit inspected application structure, quality tooling, CI, documentation,
browser persistence, route loading, and Supabase integration. It also compared
the current implementation with the explicit limitations recorded in
`docs/QUALITY_BASELINE.md`. Lightweight repository measurements found:

- 283 TypeScript/TSX production and test files under `src/`;
- 58 route page components; tests across `src/` and `tests/` directly render at
  least 16 of them, with no representative render test for several route
  families (authentication/error, nautical basics, rules/lights, and tides);
- 65 test files under `src/`;
- 5 production modules directly reading or writing local/session storage, plus
  a separate IndexedDB offline queue;
- several high-change-risk UI modules between 549 and 990 lines;
- coverage enforcement limited to three feature directories and a short
  allowlist of architecture files.

These numbers are navigation aids, not quality targets. A large file or an
untested page is not automatically defective; the issue proposals below pair
each observation with a concrete failure mode and bounded outcome.

## Priority and dependency map

| Order | Topic | Priority | Depends on | Why this order |
| --- | --- | --- | --- | --- |
| 1 | Documentation source of truth | P1 | None | Prevents new work from following obsolete instructions. |
| 2 | Protect stateful feature seams with scoped coverage | P1 | None | Extends an existing guard in a bounded increment. |
| 3 | Add representative route-family smoke tests | P1 | None | Covers currently unrendered route families without blanket page coverage. |
| 4 | Browser persistence boundary | P1 | #2 recommended | Centralizes validation and ownership before more offline flows are added. |
| 5 | App-shell recovery and PWA update UX | P1 | #3 recommended | Prevents recoverable loading/update failures becoming blank or stale sessions. |
| 6 | Quiz bank lazy loading | P2 | #2 | Explicitly deferred by the quality baseline and affects multiple consumers. |
| 7 | Decompose AnchorMinigame behavior | P2 | #2 | Targets a concrete, recently changed interactive module. |
| 8 | Supabase schema/type drift guard | P2 | None | Makes database changes reproducible; can proceed independently. |

Issue numbers should replace the dependency labels after proposals are created.

## Proposed issue drafts

### 1. Establish a current documentation source of truth

**Suggested title:** `Reconcile developer documentation with the enforced quality baseline`

**Problem**

Developer-facing instructions disagree with the repository:

- `docs/FEATURE_TASKS.md` says coverage is not configured, while
  `vite.config.ts`, `package.json`, and CI enforce scoped per-file coverage.
- The README quality command list omits coverage, build-budget, migration, and
  coverage-scope guards documented in `docs/QUALITY_BASELINE.md`.
- The README still contains template-oriented Lovable setup language and a
  placeholder clone command instead of a concise repository workflow.
- `AGENTS.md` lists only `README.md` under documentation despite the active
  documents in `docs/`.

This can cause contributors and automation to run incomplete validation or
plan already-completed foundation work.

**Scope**

Choose one maintained entry point for local setup and quality gates, link
historical planning documents from it, and clearly label status snapshots as
historical where appropriate. Do not rewrite the feature backlog or silently
change product status.

**Acceptance criteria**

- README setup commands work from a clean checkout and name the supported Node
  and package-manager workflow.
- README quality commands match the checks in `.github/workflows/ci.yml`.
- `docs/FEATURE_TASKS.md` no longer claims that configured quality tooling is
  absent; historical claims are dated or explicitly marked as superseded.
- The migration-base requirement for local chained branches links to
  `docs/QUALITY_BASELINE.md`.
- Repository documentation has an index identifying normative versus
  historical documents.
- A test or lightweight documentation check prevents the CI command list from
  silently drifting again, or the PR explains why an automated check is not
  practical.

**Out of scope**

Changing feature requirements, deleting historical plans, or changing CI
behavior.

---

### 2. Extend scoped coverage to stateful feature seams

**Suggested title:** `Add exam, spaced-repetition, engagement, offline, and export seams to the coverage guard`

**Problem**

`scripts/coverage-scope.json` protects dashboard, progress, and quiz
architecture seams, but stateful code in exam orchestration, spaced repetition,
engagement persistence, offline queuing, and export generation can be added
without an explicit coverage decision. These modules handle identity,
durability, scoring, or user data and have focused tests already, making them a
bounded next increment for the existing guard.

**Scope**

Extend the existing scope configuration to those five feature directories.
Explicitly exempt UI adapters or generated types only where per-file 90%
coverage would not measure the relevant risk.

**Acceptance criteria**

- The five named feature directories are governed by
  `guard:coverage-scope`.
- Each production file is covered at the configured threshold or appears in a
  reviewed exemption list with a risk-based reason.
- The guard fails when a new production module is added to those directories
  without an explicit coverage decision.
- Tests added to meet the threshold assert behavior rather than implementation
  details.
- Coverage and default test jobs remain within documented CI resource bounds.

**Dependencies**

None.

---

### 3. Add representative route-family smoke tests

**Suggested title:** `Add hermetic smoke coverage for currently unrendered route families`

**Problem**

Test files live in both `src/` and `tests/`. Counting only colocated tests is
misleading: at least 16 route pages are directly rendered somewhere in the
suite, including dashboard, quiz, exam, review, pilotage, safety, and selected
navigation pages. However, `src/app/routes.test.ts` verifies route definitions
without rendering them, and no representative direct-render test was found for
the authentication/error, nautical-basics, rules/lights, or tides route
families. Passage-planning has builder-flow coverage but not a route-family
render smoke test.

**Scope**

Add one representative hermetic render test per uncovered route family, using
shared router/auth fixtures. This is not a requirement to duplicate a test for
all 58 pages or assert static lesson copy.

**Acceptance criteria**

- A checked-in inventory maps each route family to its representative render
  test.
- Authentication/error, nautical basics, rules/lights, tides, and passage
  planning each have a representative render test.
- Tests assert successful render, critical navigation, and absence of an
  uncaught exception; interactive behavior remains in focused tests.
- Fixtures do not contact a live Supabase project and are reusable by future
  route smoke tests.
- A new route family requires an explicit representative-test decision.

**Dependencies**

None.

---

### 4. Introduce a typed, user-scoped browser persistence boundary

**Suggested title:** `Centralize and validate browser persistence workflows`

**Problem**

Browser persistence is implemented independently in:

- `src/pages/Quiz.tsx`;
- `src/pages/Exam.tsx`;
- `src/features/engagement/engagementService.ts`;
- `src/components/passagePlanning/PassagePlanBuilder.tsx`;
- `src/integrations/supabase/client.ts`;
- the IndexedDB queue in `src/features/offline/progressQueue.ts`.

The implementations use different key formats, parsing/fallback behavior,
versioning, cleanup, and owner scoping. Some validate parsed data through
dedicated helpers while others cast partial JSON or construct keys inline.
Future schema changes, account switches, corrupt values, quota failures, and
private-mode storage errors therefore require repeated fixes and can produce
inconsistent recovery.

**Scope**

Create a small browser-storage boundary for application-owned records. Supabase
auth storage may remain configured through its SDK, but its ownership and
failure behavior must be documented. Migrate one workflow at a time without
changing durable key compatibility unexpectedly.

**Acceptance criteria**

- Storage records have typed codecs/validators, explicit versions, and
  documented key ownership conventions.
- User-owned records cannot hydrate under a different authenticated user.
- Corrupt, obsolete, unavailable, and quota-exceeded storage have defined,
  tested behavior that does not crash rendering.
- Account sign-out/switch cleanup rules are centralized and tested.
- Existing durable records are migrated or remain readable; compatibility
  tests cover representative legacy payloads.
- Quiz, exam, engagement, passage planning, and offline progress use the common
  boundary or have a documented reason not to.
- No secrets or service-role credentials are persisted client-side.

**Dependencies**

Scoped coverage from proposal 2 is recommended before the final migrations.

---

### 5. Add app-shell error recovery and explicit PWA update behavior

**Suggested title:** `Make lazy-route and service-worker failures recoverable`

**Problem**

`src/App.tsx` wraps lazy routes in `Suspense`, but has no error boundary for a
failed dynamic import or render exception. `src/main.tsx` registers the service
worker with immediate updates but does not expose offline-ready, update-ready,
or registration-error callbacks. A deployment that invalidates an old lazy
chunk, an offline navigation to an uncached route, or a component exception can
leave the user without an actionable recovery path.

**Scope**

Add a minimal app-shell recovery boundary and a deliberate service-worker
update lifecycle. Avoid introducing remote telemetry unless separately
approved.

**Acceptance criteria**

- Lazy import and render failures show an accessible recovery view with retry
  and reload actions.
- Recovery avoids infinite reload loops and preserves user-owned unsynced data.
- Service-worker update behavior is explicit: users are told when a refresh is
  required, or the application proves that immediate activation is safe.
- Offline-ready and registration-error states are handled without noisy
  repeated notifications.
- Tests cover failed route imports, render exceptions, offline navigation, and
  update-ready behavior.
- The production build and PWA asset budget continue to pass.

**Dependencies**

Proposal 3 is recommended so the shell becomes part of the representative
route test surface.

---

### 6. Load quiz banks on demand without breaking exam and review flows

**Suggested title:** `Replace the eager quiz registry with a cached async question-bank loader`

**Problem**

`src/data/quizzes/index.ts` eagerly imports all 16 question banks. As recorded
in `docs/QUALITY_BASELINE.md`, route-level lazy loading does not split those
banks because quiz, exam, and spaced-repetition consumers import the same
registry. Every quiz route can therefore download and parse content it does
not need. A naive dynamic import would break synchronous consumers and lacks
loading/error/cache UX.

**Scope**

Design one typed asynchronous catalogue supporting single-topic quiz loading
and intentional bulk loading for exam/review. Preserve stable question IDs and
topic metadata.

**Acceptance criteria**

- Opening one topic quiz loads only its bank plus shared quiz code, demonstrated
  by a bundle/chunk assertion.
- Exam and spaced-repetition flows can load their required catalogue with
  bounded concurrency and a visible loading/error/retry state.
- Loaded banks are cached for the session and duplicate requests are
  coalesced.
- Unknown topics and failed chunk loads fail closed with an actionable UI.
- Registry consistency tests still prove unique stable question IDs, matching
  topic metadata, and topic-registry links.
- Existing scoring, issued-attempt, review, and offline behavior remains
  covered.
- Build-budget thresholds are updated only with measured justification.

**Dependencies**

Proposal 2 should land first. Coordinate with proposal 5 for chunk-load error
recovery.

---

### 7. Decompose AnchorMinigame along tested behavior boundaries

**Suggested title:** `Extract AnchorMinigame geometry, state transitions, and presentation seams`

**Problem**

`src/pages/AnchorMinigame.tsx` is 666 lines and combines SVG geometry,
simulation state, scoring/completion behavior, controls, and rendering. Git
history shows a targeted geometry memoization fix (`e8a3b1c`) and a later
performance PR merge, evidence that its calculation/render boundary has
already required maintenance. Unlike `NauticalTerms`, no test directly imports
`AnchorMinigame`; its behavior is therefore less characterized despite the
stateful interaction surface.

Line count alone is not the defect. The bounded debt is that geometry and game
state cannot be tested independently from the full page, increasing the risk
of scoring or progress regressions during performance work.

**Scope**

Characterize the current anchor drill, extract pure geometry and game-state
transitions into typed modules, and split only cohesive presentation pieces
needed to make those boundaries clear. Preserve the current route, visuals,
timing, scoring, and progress contract.

**Acceptance criteria**

- Characterization tests capture start/reset, placement or drag interaction,
  scoring/completion, progress persistence, and keyboard-accessible controls.
- Pure anchor/rode geometry and game-state transitions are exported from
  framework-independent modules with boundary-condition tests.
- Pure domain logic is separated from rendering and has focused tests.
- Extracted components have narrow typed props and no hidden browser-storage or
  Supabase dependency.
- `/anchor-minigame`, its durable progress ID, scoring thresholds, and stored
  progress payload remain compatible.
- SVG behavior and controls are verified at 375px, 768px, and 1280px, including
  pointer and keyboard interaction.
- The PR reports the extracted state/geometry API and before/after dependency
  boundaries; total line-count reduction is not a success criterion.
- No repository-wide formatting churn is included.

**Dependencies**

Proposal 2 should land first or this issue must add `AnchorMinigame` and its
extracted production modules to the coverage-scope guard.

---

### 8. Detect Supabase migration and generated-type drift

**Suggested title:** `Verify generated Supabase types against the migration schema`

**Problem**

The migration manifest strongly protects migration immutability, while
`src/integrations/supabase/types.ts` is a checked-in generated artifact updated
by a README command. There is no automated evidence that the generated client
types match the current migration chain. A schema change can therefore pass the
migration guard while stale types hide new columns/RPC signatures or encourage
local casts.

**Scope**

Add a reproducible schema/type verification path suitable for CI. It must not
connect to production or require committed credentials.

**Acceptance criteria**

- A documented command applies migrations to an isolated local database and
  regenerates Supabase TypeScript types.
- CI, or a deterministic equivalent guard, fails when the checked-in generated
  types differ.
- The check never reads production credentials and works with rootless Docker
  or a documented CI service.
- RPC argument/return types used by progress, exam, engagement, and review
  services are covered.
- Generated output is normalized to avoid tool-version-only churn; the
  Supabase CLI/tool version is pinned.
- Failure messages explain the regeneration command.

**Dependencies**

None. Coordinate CI resource use with proposal 2.

## Explicit non-issues

The following observations do not justify standalone work without new
evidence:

- Generated shadcn UI modules being numerous is not itself debt; audit unused
  dependencies/components only when bundle analysis identifies impact.
- Large static lesson components do not need splitting solely to satisfy a
  line-count limit.
- Live Supabase tests remaining opt-in is appropriate until CI provides an
  isolated database; hermetic tests should not be excluded merely because
  their filename contains `integration`.
- Replacing React, Vite, Supabase, Tailwind, or the router would add migration
  risk without addressing a demonstrated defect.

## Completion of this audit

This document is complete when the proposals are triaged into GitHub issues,
dependency placeholders are replaced with issue links, and accepted work is
tracked there. Future audits should update evidence and avoid duplicating open
issues rather than treating this file as a second backlog.
