# PR #3 Deduplication Inventory & Evidence

## Scope
Strict deduplication cleanup for quiz progress backtracking/persistence in PR #3.

## Duplication Inventory (pre-refactor)

| Cluster | Exact file refs (before) | Repeated logic |
|---|---|---|
| C1: Session persistence call shape repeated in 3 handlers | `src/pages/Quiz.tsx` (`handleAnswerSelect`, `handleNext`, `handlePrevious`) | Same `persistQuizSessionProgress({ isAuthenticated, topicKey, saveProgress, progress: buildQuizSessionProgress(...) })` object literal repeated per handler |
| C2: Empty answers array construction repeated | `src/pages/Quiz.tsx` (init fallback + restart reset), `src/features/quiz/sessionProgress.ts` (parser normalization base array) | Same null-initialized answer array construction pattern repeated (`new Array(...).fill(null)`) |

## Refactor Implemented

1. Added reusable `createEmptyQuizAnswers(questionCount)` in `src/features/quiz/sessionProgress.ts`.
2. Replaced duplicated null-array construction in:
   - `src/features/quiz/sessionProgress.ts`
   - `src/pages/Quiz.tsx` init fallback and restart paths.
3. Added local `persistSession(nextAnswers, nextQuestion)` helper in `src/pages/Quiz.tsx` and routed all three handlers through it.
4. Added/updated tests in `src/features/quiz/sessionProgress.test.ts` for `createEmptyQuizAnswers`.

## Before/After Evidence Table

| Metric | Before | After | Delta |
|---|---:|---:|---:|
| Raw `persistQuizSessionProgress({` occurrences in `src/pages/Quiz.tsx` | 3 | 1 | -2 |
| Raw `new Array(questions.length).fill(null)` in `src/pages/Quiz.tsx` | 2 | 0 | -2 |
| Raw `new Array(questionCount).fill(null)` in `src/features/quiz/sessionProgress.ts` | 1 | 0 | -1 |
| Reusable `createEmptyQuizAnswers(...)` call sites across quiz session flow | 0 | 3 | +3 standardized usages |

## Exact Post-Refactor References

- `src/features/quiz/sessionProgress.ts:9` — `createEmptyQuizAnswers`
- `src/features/quiz/sessionProgress.ts:40` — parser now uses `createEmptyQuizAnswers`
- `src/pages/Quiz.tsx:942` — init fallback uses `createEmptyQuizAnswers`
- `src/pages/Quiz.tsx:950-957` — consolidated `persistSession` helper
- `src/pages/Quiz.tsx:992`, `:1017`, `:1030` — three handler call-sites now reuse helper
- `src/pages/Quiz.tsx:1072` — restart path uses `createEmptyQuizAnswers`

## Validation
See command evidence in PR checks section (lint, typecheck, tests, build).
