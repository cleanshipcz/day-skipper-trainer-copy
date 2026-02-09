# Critical Review — Loop 2 (2026-02-09)

Branch: `chore/persona-review-tdd-foundation`  
Base: `main`  
Reviewer mode: `personas/reviewer.md` (strict, evidence-first)

## Blocking issues (must fix before approval)

1. **Type-contract mismatch in quiz progress resolver (code quality / maintainability)** — **FAIL**
   - Evidence:
     - `src/features/quiz/progressKeys.ts:1` defines `type ProgressRow = { topic_id: string } | null`.
     - `src/pages/Quiz.tsx:908-913, 919` consumes `savedData.answers_history`, `savedData.completed`, and `savedData.score` from `resolution.record`.
   - Why this is blocking:
     - The resolver’s declared contract does not match actual consumer needs, so type guarantees are misleading.
     - This risk is currently masked because the pipeline does not enforce a TypeScript typecheck gate.
   - Required fix:
     - Define an explicit shared progress row type containing all consumed fields (`topic_id`, `answers_history`, `completed`, `score` at minimum) and use it end-to-end in resolver + consumer.
     - Add CI/local gate for typechecking (`tsc --noEmit`) so this class of mismatch fails fast.

2. **Rollback clarity missing for high-impact persistence migration (regression risk / rollback)** — **FAIL**
   - Evidence:
     - PR body has strong *what/why/validation* sections but no explicit rollback runbook for `supabase/migrations/20260209105000_increment_user_points_rpc.sql` + persistence path switch.
   - Why this is blocking:
     - This PR changes write semantics for user points and progress. Without explicit rollback steps, incident recovery is under-specified.
   - Required fix:
     - Add a **Rollback Plan** section to the PR description and `docs/engineering/methods-and-code.md` covering:
       - DB rollback/forward strategy for `increment_user_points` function changes,
       - app-level fallback behavior,
       - verification queries/checks after rollback.

3. **Commit message body formatting is malformed (commit quality)** — **FAIL**
   - Evidence:
     - Commits on this branch contain literal escaped newline sequences in body text (e.g., `Why:\n- ...`) instead of real line breaks.
     - Affected commits: `fd04a2f`, `53e921d`, `4306d16`.
   - Why this is blocking:
     - Reduces readability and audit quality in git history; violates intent+rationale clarity standard.
   - Required fix:
     - Rewrite commit messages (interactive rebase + reword) to use proper multiline bodies with real newlines.
     - Preserve conventional headline + clear Why/What/Validation structure.

---

## PASS/FAIL by required criterion

1. **Architecture and module boundaries** — **FAIL**
   - Positive: extraction into `src/features/*` modules is directionally good (`progressPersistence`, `topicCompletion`, `randomization`, `progressKeys`, route registry).
   - Fail reason: resolver type boundary in quiz progress flow is inconsistent with actual usage (`progressKeys.ts` vs `Quiz.tsx`).

2. **Test coverage relevance (not just count)** — **PASS (with risk note)**
   - Strong targeted tests exist for new logic:
     - Progress persistence + integrity proof + env-gated live concurrency
     - Quiz key migration + randomization + scoring
     - Route uniqueness + build budget evaluator
   - Risk note: live DB concurrency test is env-gated/skipped by default, so critical concurrency behavior is not guaranteed in standard CI runs.

3. **Regression risk and rollback clarity** — **FAIL**
   - Regression risk addressed partially via tests.
   - Explicit rollback procedure is missing for DB/function + write-path changes.

4. **PR description quality (what changed + why)** — **PASS**
   - PR body is clear, structured, and maps changes to motivation and validation commands.

5. **Commit message quality (intent + rationale)** — **FAIL**
   - Intent/rationale content exists but body formatting is malformed (escaped newline literals).

6. **Documentation quality** — **FAIL**
   - Positive: `docs/engineering/methods-and-code.md` is useful and maps changes to tests.
   - Fail reason: lacks rollback/runbook details for critical persistence migration and runtime recovery path.
   - Temporary review clutter check: no new temporary review clutter found in this branch diff.

---

## Validation run (reviewer execution)

- `npm test -- --run` ✅ (12 passed files, 1 skipped env-gated integration)
- `npm run lint` ✅
- `npm run build` ✅
- `npm run test:build-budget` ✅

---

## Final verdict

**Overall: FAIL (changes required before approval).**

Approval can be reconsidered after all three blocking issues are fixed:
1) resolve type-contract mismatch + add typecheck gate,  
2) add explicit rollback plan,  
3) rewrite malformed commit bodies.
