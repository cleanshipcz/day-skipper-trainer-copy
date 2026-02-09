# Methods & Code Documentation (Refactor Loop)

This document explains **what changed** and **why** for the quality-refactor PR.

## 1) Progress persistence integrity

### Problem
Client-side read/modify/write patterns can lose point increments under concurrent writes.

### Change
- Added DB RPC migration: `increment_user_points(p_user_id, p_increment)`
- Refactored persistence path to call RPC for atomic increments:
  - `src/features/progress/progressPersistence.ts`
  - `src/hooks/useProgress.ts`

### Why
Atomic server-side increment prevents race-condition point loss.

### Tests
- `src/features/progress/progressPersistence.test.ts`
- `src/features/progress/progressIntegrityProof.test.ts`
- `src/features/progress/progressLiveDbConcurrency.integration.test.ts` (env-gated)

### Rollback plan (migration + write-path)
If the `increment_user_points` RPC path causes regressions, use this sequence:

1. **App-level containment (immediate)**
   - Revert `src/features/progress/progressPersistence.ts` and `src/hooks/useProgress.ts` to the pre-RPC read/modify/write path.
   - Deploy app rollback first to stop new RPC calls while DB state is assessed.

2. **DB strategy (`supabase/migrations/20260209105000_increment_user_points_rpc.sql`)**
   - Prefer **forward-fix** if possible (replace function definition with corrected SQL).
   - If full rollback is required, apply a down migration that restores the prior function behavior/signature (or drops the function if previously absent).
   - Confirm migration history consistency in the target environment before re-enabling writes.

3. **Post-rollback verification**
   - Check function availability/signature:
     - `select routine_name, specific_name from information_schema.routines where routine_schema = 'public' and routine_name = 'increment_user_points';`
   - Verify progress writes still succeed:
     - `select user_id, topic_id, score, completed, last_accessed from public.user_progress order by last_accessed desc limit 10;`
   - Verify point totals are not drifting unexpectedly:
     - `select user_id, points from public.profiles order by updated_at desc limit 10;`

4. **Recovery confirmation**
   - Run `npm test -- --run`, `npm run lint`, `npm run typecheck`, and `npm run build` against the rollback branch before promoting.

---

## 2) Quiz persistence consistency

### Problem
Mixed progress keys (`topicKey` vs `quiz-${topicKey}`) caused fragmented state.

### Change
- Added canonical key resolver + legacy migration helper:
  - `src/features/quiz/progressKeys.ts`
- Updated quiz loading/saving to canonical path:
  - `src/pages/Quiz.tsx`

### Why
Single-source persistence keying avoids data drift and broken resume behavior.

### Tests
- `src/features/quiz/progressKeys.test.ts`

---

## 3) Quiz randomization correctness

### Problem
Retry shuffle behavior could be non-deterministic/ineffective.

### Change
- Added seed-based randomization utilities:
  - `src/features/quiz/randomization.ts`
- Wired quiz flow to seed-aware shuffle:
  - `src/pages/Quiz.tsx`

### Why
Predictable randomization for testability + guaranteed re-randomization on retry.

### Tests
- `src/features/quiz/randomization.test.ts`

---

## 4) Dashboard completion semantics

### Problem
Badge/completion state and CTA text could diverge.

### Change
- Centralized completion derivation:
  - `src/features/dashboard/topicCompletion.ts`
- Applied shared derivation in dashboard:
  - `src/pages/Index.tsx`

### Why
One completion model removes contradictory UI states.

### Tests
- `src/features/dashboard/topicCompletion.test.ts`

---

## 5) Routing hygiene

### Problem
Route duplication risk and weak route contract checks.

### Change
- Added route registry:
  - `src/app/routes.tsx`
- App routes now rendered from registry:
  - `src/App.tsx`
- Added uniqueness/smoke tests:
  - `src/app/routes.test.ts`

### Why
Single route source of truth improves maintainability and prevents duplicate path regressions.

---

## 6) Performance build guardrail

### Problem
Build size warning had no enforceable threshold.

### Change
- Added budget evaluator and checks:
  - `scripts/build-budget-core.mjs`
  - `scripts/check-build-budget.mjs`
  - `scripts/performance-budget.json`
  - `scripts/buildBudget.test.ts`
  - `package.json` script: `test:build-budget`
- Added manual chunk strategy for safer headroom:
  - `vite.config.ts`

### Why
Prevents size regressions from silently accumulating.

---

## Known residuals
- Live DB integration test is env-gated and skipped without service-role env vars.
- React Router future-flag warnings are non-blocking and remain follow-up work.
