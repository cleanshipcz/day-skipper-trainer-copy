# Ropework Quiz learner-facing audit

- Audit issue: [#91](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/91)
- Route/topic: `/quiz/ropework` / `ropework`
- Audited: 2026-07-30
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/ropework.ts`
- Quiz services: `src/features/quiz/`
- Parent and registry: `src/pages/RopeworkTheory.tsx`,
  `src/constants/topicRegistry.ts`

## Verdict

**The quiz can complete, but it is not yet a trustworthy assessment of the
Ropework module.** Its 12 questions have unique stable IDs, shuffled answers
retain their correct mapping, the 70% pass calculation is sound, and the shared
quiz shell provides retry and explicit load/save recovery. The bank nevertheless
omits the taught Rolling Hitch while testing six subjects the parent never
teaches. Several safety-sensitive answers are absolute, materially incomplete,
or unsafe as general advice.

The shared shell also exposes the correct answer through its live score before
submission, so a learner can obtain 100% by cycling options. Anonymous progress
is lost on reload; authenticated records persist unstable option indices; and
an authenticated attempt-start failure is silent and cannot be retried from the
completion recovery action. The accessible name, answer-state, progress,
announcement, and focus gaps found
in the preceding Full Nautical Terms Quiz audit apply unchanged here. Back and
completion return to global Home instead of the Ropework parent.

## Evidence and exercised paths

### Runtime method and scope

The production build was served locally with placeholder Supabase configuration
(no credentials and no live backend) and exercised in clean headless Chromium
through the Chrome DevTools Protocol. The direct route, actual production
question chunk, seeded shuffle, answer submission, explanation, Next flow, and
completion state were exercised. Parent gating/navigation and Previous behavior
were source-verified rather than replayed.

Observed results:

- Source inspection confirms the parent unlocks **Take Quiz** only after all
  seven knot cards have been clicked, and that action navigates to
  `/quiz/ropework`.
- At 375, 768, and 1280 CSS px the active quiz remained readable without
  document-level horizontal overflow. The four native answer buttons and
  Submit/Next controls worked with pointer and keyboard input.
- All 12 shuffled questions accepted their catalogue-defined answer, displayed
  an explanation, and completed as **100%**, **12 out of 12 correct**.
- Submit starts disabled, locks the selected answer when activated, and exposes
  correct/incorrect text/icon feedback. Retry starts at question 1 with a new
  shuffle.
- Back had no accessible name. Answer selection exposed no radio,
  `aria-pressed`, or other selected state. The progressbar had no accessible
  label, and inserted explanation/completion state was not deliberately
  focused or announced.

An authenticated Supabase round-trip, mid-session reload, rejected dynamic
import, offline recovery, and assistive-technology session were not exercised
against a live backend. Those paths were assessed from `Quiz.tsx`, the focused
quiz helpers, and their tests.

### Alignment with the taught module

The parent teaches seven named knots: Bowline, Clove Hitch, Reef Knot, Figure
Eight, Round Turn & Two Half Hitches, Sheet Bend, and Rolling Hitch. Questions
1–6 cover the first six, mostly at recognition/purpose level. **Rolling Hitch is
never assessed**, and no question checks the learner's ability to recognize a
correctly dressed knot, choose safe tail length, inspect a loaded knot, or
identify the parent module's described construction steps.

Half of the bank instead tests material absent from the parent:

- surging a cleat or winch;
- rope lay and coiling direction;
- the Alpine Butterfly;
- riding turns on winches;
- sealing/whipping synthetic rope ends;
- cleating turn count and a locking turn.

Those are useful rope-handling topics, but the locked quiz currently presents
them as the outcome of a seven-knot learning activity that supplies no
instruction or remediation for them.

### Answer accuracy and safety

The intended answer index is unambiguous for all 12 catalogue entries, but the
following wording needs subject-matter correction:

- `r1` says a Bowline “won't slip” and is essential for mooring. Bowlines can
  loosen or capsize under cyclic/unloaded movement and may need securing; the
  parent audit already records this missing qualification.
- `r2` asks for the “best” knot for attaching to a post and calls a Clove Hitch
  ideal. Its suitability depends on load direction and whether it is backed up;
  it can slip, roll, or bind and should not be taught as a generally safe
  attachment.
- `r5` only rejects a Reef Knot for unequal ropes. A Reef Knot is a binding knot,
  not a safe load-bearing bend even when ropes are equal.
- `r6` promises that Round Turn & Two Half Hitches is easy to untie after heavy
  loading. The round turn helps control load, but the hitches can still tighten
  or jam depending on rope and loading.
- `r8` says ropes should **always** be coiled clockwise. Direction should follow
  the rope's construction; braided line and left-hand-laid rope invalidate the
  absolute rule, and some lines are better flaked.
- `r11` recommends melting “synthetic rope” without limiting that advice to
  heat-fusible fibres or warning about heat, fumes, fire, and manufacturer
  guidance.
- `r12` prescribes two or three complete figure-eights plus a locking turn.
  Cleat size, line/load, and operating need govern the turns; a locking hitch
  can jam and is inappropriate where a loaded line must be released promptly.

The quiz therefore reinforces the same unsafe absolutes identified in the
parent, plus three rope-handling claims not present there.

### Scoring, retry, completion, and failure states

- `countCorrectAnswers` compares stored selections with each shuffled
  question's remapped answer. Percentage is rounded; 70% passes; client-scored
  quizzes intentionally grant zero profile points.
- Correctness is calculated before Submit. Selecting an option immediately
  changes `answers` and the visible **Score** while all choices remain enabled.
  Cycling choices until the score rises reveals every correct answer and makes
  the completion score unsuitable evidence of learning.
- Previous is available only before submitting the current answer. Submit locks
  the question; Next persists the following index; the final Next calls
  completion. Retry clears answers, increments the seed, and requests a new
  authenticated attempt.
- Unknown, empty, and rejected catalogues render an unavailable card. Rejected
  imports can be retried and are evicted from the catalogue cache.
- Active Back and completed Home both navigate to `/`. The unavailable card's
  only topic action is **Nautical Terms**, which is incorrect for Ropework and
  sends a failed Ropework learner to an unrelated module.

### Persistence and edge behavior

- Anonymous state exists only in component memory, so reload discards the
  attempt. Authenticated state uses the canonical `quiz-ropework` key.
- Score submission, final progress, engagement, and spaced-review seeding have
  separate recovery paths. A submitted score is retained locally if final
  progress saving fails, preventing duplicate score submission and disabling
  retry until completion is saved.
- Authenticated attempt creation is the exception: an RPC error or empty result
  is silently reduced to a null workflow while answering remains enabled. At
  completion, **Retry completion save** calls completion again but does not
  restart the attempt, so it cannot recover the visible run; **Retry Quiz**
  discards that run.
- Saved sessions contain only shuffled option indices and a question index.
  `parseSavedQuizSession` accepts negative, fractional, and out-of-range finite
  answers. It records no question/option identities or shuffle seed, so reload
  or future catalogue edits can reinterpret a stored selection.
- The current initialization depends on question count, not catalogue identity.
  Completed records are deliberately not resumed as editable sessions.

### Accessibility and input

Native answer/action buttons support keyboard activation, and submitted
correctness uses icon and text as well as colour. The multi-step workflow still
lacks:

- an accessible name on Back;
- programmatic selected/radio state on answer choices;
- a labelled numeric progressbar;
- a status/live relationship for explanation and result changes;
- intentional focus movement after Next and on completion.

These shared-shell gaps make it difficult for screen-reader users to identify
their selection, progress, feedback, or the new question.

## Focused follow-up issues

- [#165 — Align the Ropework Quiz with taught knots and prerequisite
  material](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/165)
  — covers the missing Rolling Hitch, six untaught rope-handling subjects, and
  the absence of construction, dressing, inspection, and safe-use assessment.
- [#166 — Correct unsafe and overbroad Ropework Quiz
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/166)
  — covers the Bowline, Clove Hitch, Reef Knot, Round Turn, coiling,
  heat-sealing, and cleating safety inaccuracies.
- [#154 — Restore quiz focus and expose answer/progress state
  accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  — reused for the unnamed Back control, unexposed answer selection, unlabelled
  progress, missing announcements, and unmanaged focus.
- [#155 — Return topic quizzes to their parent module instead of global
  Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155) —
  reused for Ropework Back/completion routing and the incorrect Nautical Terms
  unavailable-state action.
- [#156 — Validate persisted quiz answers against stable question and option
  identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  — reused for positional answer persistence, malformed indices, and
  catalogue/shuffle instability.
- [#157 — Do not reveal quiz correctness through the live score before
  submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  — reused for the pre-submit score oracle that allows learners to discover
  every answer.
- [#209 — Surface and recover authenticated quiz attempt-start
  failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
  — reused for silent attempt-start failure and the completion action that
  cannot retry it without discarding the learner's visible run.
