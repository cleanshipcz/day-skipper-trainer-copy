# PR #3 Design Plan — Quiz Backtracking & Durable In-Session Progress

## Context
The current quiz flow supports in-memory backtracking and server persistence, but persistence is not consistently triggered at the same interaction boundaries where users change quiz state. This can cause answer loss when users refresh/leave mid-question before pressing **Next**/**Previous**.

## Problem Map (with file references)

1. **Persistence trigger mismatch with user actions**
   - File: `src/pages/Quiz.tsx`
   - `handleAnswerSelect` mutates local answers but does not persist.
   - Persistence is only triggered in `handleNext` and `handlePrevious`.
   - Risk: changed answer can be lost if navigation/reload occurs before moving question index.

2. **Quiz progress payload logic duplicated in event handlers**
   - File: `src/pages/Quiz.tsx`
   - `progressData = { answers, currentQuestion: ... }` is rebuilt in multiple handlers.
   - Risk: drift/inconsistent serialization over time.

3. **Load-time normalization is implicit and scattered**
   - File: `src/pages/Quiz.tsx`
   - Parsing + shape checks for `answers_history` happen inline in `useEffect`.
   - Risk: edge cases (invalid indices/length mismatch) are harder to enforce and test.

## Design Goals

1. Preserve user quiz answers during backtracking and mid-question interruptions.
2. Centralize quiz session payload/hydration logic in a reusable feature module.
3. Maintain compatibility with existing canonical/legacy key migration logic.
4. Keep behavior parity for scoring/completion thresholds.

## Proposed Target Design

### A. Extract reusable quiz-session progress helpers
Create `src/features/quiz/sessionProgress.ts`:
- `buildQuizSessionProgress(answers, currentQuestion)`
- `parseSavedQuizSession(raw, questionCount)`
- strict normalization:
  - answer array length forced to current question set length
  - non-number answer values treated as `null`
  - `currentQuestion` clamped to `[0, questionCount - 1]`

### B. Persist on answer mutation
In `Quiz.tsx`, persist session whenever user selects/changes an answer (if authenticated), using extracted helper.

### C. Standardize persistence calls
Replace ad-hoc inline payload objects in `handleAnswerSelect`, `handleNext`, and `handlePrevious` with helper usage.

### D. Preserve migration path
Keep existing canonical key fallback/migration (`resolveQuizProgressForLoad`) intact and only replace payload parsing with the new parser.

## Tranche Plan

### Tranche 1 (TDD)
- Add unit tests for session helper behavior:
  - valid parse/hydration
  - invalid/partial payload normalization
  - clamped question index
  - payload builder shape
- Implement `sessionProgress.ts` until tests pass.

### Tranche 2 (TDD + integration at page level)
- Add focused `Quiz` behavior test(s) proving progress save on answer selection.
- Refactor `Quiz.tsx` to use helper for parse/build and persist on answer change.
- Ensure no behavior regressions in next/previous/complete paths.

### Tranche 3 (review hardening)
- Run lint, typecheck, tests, build.
- Address reviewer findings until all gates pass.

## Acceptance Gates

1. **Durability Gate**: selecting an answer triggers persistence call (authenticated flow).
2. **Normalization Gate**: malformed saved payload does not crash and is normalized deterministically.
3. **Reuse Gate**: session payload shape defined once in feature helper module, reused by page handlers.
4. **Regression Gate**: scoring/completion tests remain green; full quality suite passes.

## Risks & Controls

- **Risk**: extra writes on answer changes.
  - **Control**: only persist for authenticated users; payload is small and bounded.
- **Risk**: parser normalization can alter previously tolerated malformed states.
  - **Control**: deterministic normalization with tests; fallback defaults preserved.
- **Risk**: accidental breakage to legacy migration path.
  - **Control**: keep key migration flow unchanged; only replace payload parsing internals.

## Rollback Strategy

If regressions appear, rollback is clean by reverting:
- `src/features/quiz/sessionProgress.ts`
- related test file
- `Quiz.tsx` integration edits

No schema changes required.

## Non-goals

- Cross-device real-time sync conflict resolution.
- New scoring mechanics or pass thresholds.
- Broad persistence retrofit for all non-quiz mini-games in this PR.
