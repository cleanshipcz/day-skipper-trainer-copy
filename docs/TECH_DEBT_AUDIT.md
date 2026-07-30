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
- 58 page components, but only 6 colocated page test files;
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
| 2 | Risk-based coverage expansion | P1 | None | Creates regression protection for the remaining changes. |
| 3 | Browser persistence boundary | P1 | #2 recommended | Centralizes validation and ownership before more offline flows are added. |
| 4 | App-shell recovery and PWA update UX | P1 | #2 recommended | Prevents recoverable loading/update failures becoming blank or stale sessions. |
| 5 | Quiz bank lazy loading | P2 | #2 | Explicitly deferred by the quality baseline and affects multiple consumers. |
| 6 | Decompose oversized interactive modules | P2 | #2 | Safer after characterization tests exist. |
| 7 | Supabase schema/type drift guard | P2 | None | Makes database changes reproducible; can proceed independently. |

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

### 2. Expand regression protection using a risk-based coverage policy

**Suggested title:** `Extend test and coverage guards to high-risk application seams`

**Problem**

`scripts/coverage-scope.json` protects dashboard, progress, and quiz
architecture seams, but high-risk code outside that list can be added without
coverage enforcement. Examples include exam orchestration, spaced repetition,
engagement persistence, offline queuing, passage-plan persistence, routing,
authentication context, and export generation. Vitest also excludes every
`*.integration.test.*` file from its default run, so the naming convention can
make a test opt-in even when it does not need external infrastructure.

The current 6 colocated page tests across 58 pages additionally leave route
rendering and interactive page behavior unevenly characterized. The goal is
not blanket line coverage for static lesson markup; it is protection for
stateful boundaries.

**Scope**

Define risk categories, classify existing integration tests as hermetic or
live-service, and incrementally bring stateful production seams under the
coverage-scope guard.

**Acceptance criteria**

- Document which production seams require per-file coverage and which content
  pages are better protected by smoke/accessibility tests.
- Hermetic integration tests run in the default CI test job; only tests that
  require configured external services remain opt-in.
- Add architecture-scope entries for at least exam, spaced repetition,
  engagement, offline persistence, and export logic, with thresholds justified
  in the PR.
- Add route-level smoke coverage that renders every route category using
  representative fixtures without loading a live Supabase project.
- The guard fails when a new production module is added to a protected
  directory without an explicit coverage decision.
- CI runtime and memory remain within documented bounds.

**Dependencies**

None. This should precede behavior-preserving structural refactors.

---

### 3. Introduce a typed, user-scoped browser persistence boundary

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

Risk-based tests from proposal 2 are recommended before the final migrations.

---

### 4. Add app-shell error recovery and explicit PWA update behavior

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

Proposal 2 is recommended so the shell becomes part of the protected test
surface.

---

### 5. Load quiz banks on demand without breaking exam and review flows

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

Proposal 2 should land first. Coordinate with proposal 4 for chunk-load error
recovery.

---

### 6. Decompose oversized interactive modules along behavior boundaries

**Suggested title:** `Extract testable domain and presentation seams from oversized interactive pages`

**Problem**

Several modules combine content, mutable interaction state, calculations, and
large render trees:

- `src/pages/NauticalTerms.tsx` — 990 lines;
- `src/pages/SailControls.tsx` — 881 lines;
- `src/pages/AnchorMinigame.tsx` — 666 lines;
- `src/components/navigation/VirtualChartPlotter.tsx` — 623 lines;
- `src/pages/Quiz.tsx` — 563 lines;
- `src/pages/Index.tsx` — 557 lines;
- `src/components/navigation/TidalPassageCalculator.tsx` — 549 lines.

Line count alone is not the defect. The debt is the co-location of independently
changing behavior, data, and presentation, which increases review surface and
makes narrow tests difficult. `docs/QUALITY_BASELINE.md` correctly rejects
reformatting these files merely for style.

**Scope**

Start with the module having the clearest behavioral seams and highest change
frequency. Extract pure calculations/state transitions and cohesive child
components; do not create generic abstractions based only on visual similarity.
Treat each major module as a separate PR or sub-issue.

**Acceptance criteria**

- Before refactoring a selected module, characterization tests capture its
  critical keyboard, scoring/calculation, persistence, and completion flows.
- Pure domain logic is separated from rendering and has focused tests.
- Extracted components have narrow typed props and no hidden browser-storage or
  Supabase dependency.
- User-visible content, route URLs, progress IDs, and stored payloads remain
  compatible.
- Accessibility semantics and responsive behavior are verified at the
  repository's target viewports.
- The PR reports objective before/after coupling or complexity evidence; total
  line-count reduction is not required.
- No repository-wide formatting churn is included.

**Dependencies**

Proposal 2. Split this umbrella into one issue per selected module after a
short change-frequency review.

---

### 7. Detect Supabase migration and generated-type drift

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
