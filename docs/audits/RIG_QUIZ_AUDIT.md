# Rig Preparation Quiz learner-facing audit

- Audit issue: [#100](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/100)
- Route/topic: `/quiz/rig` / `rig`
- Audited: 2026-07-31
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/rig.ts`
- Quiz services: `src/features/quiz/`
- Parent audit: `docs/audits/RIG_THEORY_AUDIT.md`

## Verdict

**The generic quiz workflow can be completed reliably, but the Rig bank is not
yet a fair, safe or applied assessment.** Its twelve entries have unique stable
IDs, shuffled answers retain their correct mapping, percentage/pass calculation
is sound, retry reshuffles, and authenticated completion has explicit recovery
  paths after an attempt has started successfully. The learner can reach the
quiz from `/rig` and complete it through pointer/programmatic native-control
activation at phone, tablet and desktop widths. End-to-end browser keyboard
activation was not established by this audit.

The content does not meet the same standard. Five questions assess terminology
the parent never teaches. Several others reward unsupported universal rules:
a fixed seasonal/annual schedule, visually judging “correct” spreader angle,
generic relative shroud tension, and immediate replacement as the whole
response to a broken wire. The quiz asks recall questions with conspicuously
absurd distractors rather than testing safe observation, rig-specific limits,
no-sail decisions, preparation or escalation. No diagram or scenario tests
whether the learner can locate a component or distinguish normal from abnormal.
[Issue #206](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/206)
already owns the complete theory/quiz alignment and safety correction.

The shared shell also exposes correctness through its live score before Submit.
Anonymous work disappears on reload; authenticated answers persist unstable
option indices; answer selection, progress, feedback and focus are not fully
accessible; and Back/completion return to global Home instead of Rig Checks.
Existing shared quiz-shell issues own those defects.

## Evidence and exercised paths

### Method and scope

The twelve-question bank, lazy catalogue, randomization, scoring, session
persistence, attempt workflow, route/registry, parent page and parent audit were
inspected directly. Every intended answer and explanation was compared with
the parent teaching and the authoritative sources used by its audit.

A production build using local placeholder Supabase configuration (no
credentials or live backend) was served locally and exercised in headless
Chromium through the Chrome DevTools Protocol with a clean profile. The parent
handoff, pointer selection, programmatic native-control activation, feedback,
full completion, retry, reload, focus and layout were exercised at 375, 768
and 1280 CSS px. Focused
quiz tests, typecheck, lint, production build and the internal-artifact guard
were also run.

Source-confirmed behavior:

- `/quiz/rig` resolves through `/quiz/:topicId`; `rig` is a registered lazy
  catalogue with title **Rig Prep Quiz** and subtitle **Standing and running
  rigging inspections**.
- The bank contains twelve four-option questions with unique IDs `rg1`–`rg12`
  and in-range intended answers. Individual catalogue loading rejects an empty
  bank and duplicate IDs; bulk loading also rejects IDs duplicated across
  topics.
- Seeded shuffling remaps every intended answer to its shuffled option index.
  Choosing all catalogue-defined answers completes as 100%.
- Submit is disabled until a selection, then locks the choices and reveals
  text/icon correctness plus an explanation. Previous is available before
  submitting the current question. Retry clears answers and reshuffles.
- Percentage is rounded and 70% passes. Client-side answers intentionally
  award zero profile points.
- Unknown, empty and rejected catalogues render an unavailable card. Rejected
  imports leave the cache and can be retried.

Observed browser results:

- At all three widths, twelve parent check activations revealed **Take Quiz**;
  activating it navigated from `/rig` to `/quiz/rig` and rendered **Question 1
  of 12**.
- Pointer selection enabled Submit. Before Submit, changing the selected answer
  changed the visible score immediately; this reproduced the answer oracle.
- Submit locked the answer choices and inserted **Explanation**. Next advanced
  the question. A complete automated control-activation run reached **Quiz
  Complete!**; native button semantics support keyboard activation, but this
  run did not establish browser-specific Space/Enter behavior end to end.
- An all-correct run displayed **100%**, **12 out of 12 correct** and
  **Excellent work!** Retry returned to **Question 1 of 12** with 0/12.
- Reload during an anonymous partial attempt returned to Question 1 with no
  selection or score, confirming that the attempt is ephemeral.
- Document `scrollWidth` equalled viewport client width at the three tested
  sizes; no document-level horizontal overflow was observed.
- The initial tab sequence contained the unnamed Back button, four answer
  buttons and disabled Submit. Answer buttons exposed no checked/selected/
  pressed semantics. After Next, focus did not deliberately move to the new
  question heading or first answer. Completion likewise supplied no deliberate
  heading focus.
- No uncaught browser runtime exception was recorded.

The run did not emulate a screen reader, touch hardware, high zoom, forced
colours, reduced motion, long localization or a live authenticated Supabase
round-trip. Those behaviors remain unverified; authenticated recovery paths
were inspected and covered by focused helper/component tests rather than a
remote write. No yacht or rig was inspected.

### Alignment with Rig Checks theory

Seven questions have at least a direct prompt in `/rig`:

- `rg2` repeats the seasonal, before-every-sail and annual inspection schedule;
- `rg3` repeats turnbuckle/bottlescrew split-pin, crack and thread checks;
- `rg4` repeats spreader cracks, tip protection and angle;
- `rg5` repeats that tension affects safety and performance;
- `rg8` repeats free-running, unchafed and secured halyards;
- `rg9` repeats the gooseneck check, while adding its failure consequences;
- `rg12` repeats broken strands, while adding replacement/no-sail significance.

Five questions are not taught by the parent:

- `rg1` defines standing rigging;
- `rg6` defines the forestay;
- `rg7` defines running rigging;
- `rg10` defines shrouds and their chainplate connection;
- `rg11` defines the topping lift.

Those are useful foundational objectives, but the quiz is not the place to
introduce them. The parent instead miscategorizes halyards under **Mast** and
the boom, blocks and cleats under **Running Rigging**, making `rg7` especially
unfair: its intended definition conflicts with the page's visible taxonomy.

The handoff is gated by twelve irreversible physical-checklist clicks rather
than demonstrated learning. It supplies no objective map, review link,
question-level remediation or route back to the relevant parent section.
#203 owns honest parent completion; #205 owns the practical visual lesson; #206
owns the stable corrected theory↔quiz coverage matrix and handoff.

### Terminology, technical and safety accuracy

All intended indices identify one syntactic answer, and several basic
definitions are directionally sound. The bank still turns conditional,
configuration-specific rigging guidance into categorical truth:

- `rg1` calls standing rigging “fixed wires.” Standing rigging can use wire,
  rod or fibre and supports spars; “fixed” usefully distinguishes it from
  running rigging but should not define the material.
- `rg2` presents **before season start** as the one answer to “When should you
  perform a full rig inspection?” Its explanation adds visual checks before
  every sail and aloft inspection annually. Maker guidance, material, use,
  age, environment, incidents, racing/coding/insurer obligations and survey
  history determine scope and intervals. It must not instruct a learner to go
  aloft without a safe-work boundary.
- `rg3` usefully checks locking and cracks, but its explanation says threads
  must not show “excessively” without defining adequate/balanced engagement,
  approved locking, alignment or the specific fitting. Exposed thread is not
  by itself a universal failure criterion.
- `rg4` asks the learner to recognize an “incorrect angle” without showing the
  rig design or reference. Spreader sweep/elevation and tip arrangements vary;
  visible cracks, damage or movement and comparison with maker/vessel
  information are assessable.
- `rg5` correctly says tension affects performance and safety, but its
  distractors make this trivial and it does not assess how to avoid improvised
  tuning or defer to rig-specific measured instructions.
- `rg6` says the forestay “prevents the mast from falling backwards.” A
  forestay provides forward support against aft displacement/load; the answer
  is an oversimplified single-component model that ignores the whole stayed
  system and different rig geometries.
- `rg7` directionally defines running rigging as lines used to hoist/control/
  adjust sails. Its option “fixed wires” repeats the material limitation, and
  its explanation should acknowledge control lines beyond the listed examples
  and configuration differences.
- `rg8` adds that the halyard shackle pin must be “moused.” That is not taught,
  and shackles are not the only attachment. Secure maker-appropriate retention,
  correct reeving/lead, chafe and safe loaded-line handling matter.
- `rg9` correctly identifies gooseneck failure as an injury/control hazard.
  The parent only says “secure,” and neither item teaches unloading/boom
  support or safe inspection boundaries.
- `rg10` accurately locates conventional shrouds laterally between mast and
  hull chainplates, but again defines them only as wire and does not distinguish
  cap, intermediate and lower shrouds or alternative materials/geometries.
- `rg11` gives a broadly useful topping-lift purpose but introduces the
  component only in the assessment. Some boats instead use a rigid vang or
  other boom-support arrangement; reefing procedures remain vessel-specific.
- `rg12` correctly treats a visible broken strand as serious, but “replace a
  wire shroud immediately” is incomplete as the learner action. Do not touch,
  load or sail with the defect; secure the situation and obtain competent
  assessment because the cause/age/damage can affect more than one stay. The
  “meat hooks” nickname should be paired with a cut warning.

The quiz omits the most consequential objectives identified by the parent
audit: loaded-line/stored-energy and sharp-wire hazards, safe deck-level versus
aloft work, overhead electrical clearance, chainplate/hidden load-path limits,
no-sail criteria, post-incident inspection, safe preparation order, crew/boom/
winch precautions, defect recording/escalation and dismasting readiness.

Seldén publishes rig-specific tuning sequences and maintenance instructions,
demonstrating why generic relative-tension and alignment slogans are not enough
for assessment.[^selden] The MAIB dismasting case demonstrates that recently
inspected/replaced visible rigging cannot establish the health of a hidden
below-deck tie-bar weld.[^maib-rig] World Sailing requires a properly rigged,
fully seaworthy boat, but does not validate the quiz's universal seasonal and
annual schedule.[^ws]

### Explanations and assessment quality

- Explanations are concise but mostly restate the intended option. None states
  assumptions, cites a source or links to a parent subsection.
- Incorrect learners are not told why their distractor is wrong or unsafe.
  There is no remediation path other than global Home or whole-quiz retry.
- Distractors such as colour, manufacturer name, weight, “too clean,” different
  brand, fuel consumption and “purely cosmetic” are implausible. They allow
  test-wise recognition without understanding rig evidence.
- Ten of twelve intended answers are at option index 1 in source; shuffling
  hides the visible pattern, but the source bank still lacks disciplined
  distractor design review.
- Every item is text-only single-answer recall. No diagram, defect photograph,
  ordered preparation, evidence comparison or scenario assesses application.
- No question asks the learner to recognize uncertainty, consult the correct
  rig instructions, stop sailing, unload/secure a hazard or call a competent
  rigger.

#206 already requires corrected objectives, explanations, plausible
distractors, applied evidence and critical safety tests. #205 owns the parent
visuals needed to support visual assessment.

### Scoring, retry, completion and failure states

- `countCorrectAnswers` compares positional selections with each shuffled
  question's remapped correct index. `percentageScore` safely returns zero for
  an empty denominator; 70% passes.
- The visible **Score** is derived immediately when an option is selected,
  before Submit, while every option remains enabled. Cycling choices until the
  score rises reveals the answer and permits a manufactured 100%. Shared
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns this reproduced defect.
- Submit locks the current selection. Previous exists only before current
  submission. Next persists the next index; final Next enters completion.
- Retry clears answers, increments the seed and starts a new authenticated
  attempt. Browser verification confirmed the anonymous reset and reshuffle
  entry state.
- Anonymous completion displays pass/fail but writes no progress. Authenticated
  score submission, final progress, engagement and spaced-review seeding have
  independent failure/retry behavior. A failed review seed does not erase quiz
  completion.
- If score submission succeeded but final progress failed, local workflow
  recovery retains completion and disables retry until final saving succeeds.
- Authenticated attempt start has no visible loading, failure or retry state.
  If `start_quiz_attempt` returns an error or no data, `workflow` remains null
  while the learner can still answer every question. Completion then sets
  **Your completion is not fully saved yet**, but **Retry completion save**
  calls the same completion path with the same null workflow and cannot start
  an attempt. **Retry Quiz** destructively clears the in-memory answers and
  triggers a new attempt cycle. Reload is different: it can rerun
  `start_quiz_attempt` and separately rehydrate incomplete answers/current
  position from canonical progress if those per-answer saves succeeded. That
  recovery is opaque, depends on a second persistence channel which may itself
  fail, and does not give the completion screen a direct, idempotent way to
  recover attempt creation while preserving the visible run.
- Active Back and completion Home navigate to `/`, not `/rig`. The unavailable
  state's **Nautical Terms** action is unrelated to Rig. Shared #155 owns
  contextual navigation.

### Persistence and edge behavior

- Anonymous state exists only in component memory, so reload/navigation loses
  the attempt silently. Browser verification reproduced this. Shared
  [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns a privacy-safe expiring policy or explicit ephemeral warning.
- Authenticated state uses canonical `quiz-rig` progress. Saved sessions contain
  shuffled option indices/current position, not stable question/option
  identities or catalogue/shuffle versions.
- `parseSavedQuizSession` accepts negative, fractional and out-of-range finite
  answer values. A catalogue change can reinterpret an old selection or enable
  Submit while no visible option is selected. Shared
  [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns identity/version validation and migration.
- Initialization reacts to question count, not question identity/order.
  Completed records intentionally do not resume as editable sessions.
- Catalogue loading validates non-empty banks and IDs, but not blank question/
  explanation text, option count/uniqueness or answer bounds. Shared
  [#193](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193)
  owns complete runtime validation and tests.
- Loading, unknown-topic, empty-bank and rejected-import states avoid a crash.
  Import rejection can be retried. Their Home/Nautical Terms actions are
  generic or wrong for Rig.

### Reachability, accessibility, responsive layout and input

- The quiz is registered and reachable from `/rig` only after all twelve
  checklist clicks. #203 and #206 own the meaning of that gate and handoff.
- Native answer/action buttons support pointer, touch and keyboard activation.
  Correct/incorrect state uses text/icons as well as colour.
- The icon-only Back button has no accessible name. Answers expose no radio,
  selected or pressed state. The progressbar has a numeric value but no
  contextual accessible label. Explanation/result insertion is not
  deliberately announced, and focus is not moved to a new question or
  completion. Shared #154 owns these defects.
- Browser runs observed no document-level horizontal overflow at 375, 768 or
  1280 CSS px. The centered max-width card and responsive padding fit the
  current English bank at those widths.
- Long answer text and feedback icons share a horizontal row. The sticky header
  also keeps title/subtitle and score together. High zoom, long localization
  and large text remain unverified and need the reflow coverage already in
  #154.
- Hover scaling and explanation transitions do not explicitly honor reduced
  motion. #154 owns motion and responsive accessibility.

## Focused follow-up issues

One new issue proposal is needed for authenticated attempt-start recovery.
Every other distinct worthwhile remediation found here is already owned by a
focused Rig or shared quiz-shell issue. The new draft below is complete and
ready to file; the remaining bullets are existing reuse targets.

### Surface and recover authenticated quiz attempt-start failures

**Proposed issue:** _pending_

**Proposed title:** `Surface and recover authenticated quiz attempt-start failures`

**Body:**

> ## Context
>
> `Quiz.tsx` starts an authenticated attempt with `start_quiz_attempt`. An RPC
> error or empty response is silently ignored, leaving `workflow` null while
> the learner can complete all questions. At completion, **Retry completion
> save** calls `handleComplete` again, sees the same null workflow and cannot
> restart the attempt. **Retry Quiz** discards the visible run and starts a new
> cycle. Reload may instead rerun attempt creation and independently hydrate
> incomplete answers/current position from canonical progress, but only when
> those separate progress writes succeeded; this recovery is neither explained
> nor controlled from the completion screen.
>
> ## Learner impact
>
> A transient start failure is invisible until the end of a potentially long
> quiz. The advertised save retry is inert for this failure class. Recovery
> either destroys the visible run or relies opaquely on a reload plus separately
> persisted progress that may be missing, while repeated manual recovery risks
> abandoned or duplicate attempt semantics.
>
> ## Acceptance criteria
>
> - Model attempt start as explicit idle/starting/ready/failed states and expose
>   a clear, accessible failure message without waiting until completion.
> - Define whether answering is blocked while start is pending/failed or safely
>   buffered; never imply an authenticated run is saveable when no attempt ID
>   exists.
> - Provide a retry that actually reruns `start_quiz_attempt` and, after
>   success, preserves/submits the current answers and completion where policy
>   permits.
> - Make start retry and eventual score submission idempotent across repeated
>   clicks, delayed responses, reload, owner/topic change and ambiguous network
>   outcomes; do not create duplicate scored attempts.
> - Separate attempt-start failure copy/actions from final progress-save and
>   review-sync failures so each retry invokes the correct operation.
> - Preserve honest anonymous behavior and the existing successful
>   authenticated workflow.
> - Add component/integration tests for RPC error, empty data, delayed success,
>   retry success/failure, completion before recovery, repeated retry, reload,
>   owner/topic change and duplicate-submission prevention.
>
> ## Relevant paths
>
> - `src/pages/Quiz.tsx`
> - quiz attempt RPC/migration definitions
> - quiz workflow/component tests

### Existing focused issues reused

- [#206 — Align Rig theory handoff with safe, taught quiz
  objectives](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/206)
  owns terminology, coverage, safety accuracy, explanations, plausible
  distractors, applied scenarios, remediation, handoff and critical-content
  tests.
- [#203 — Make Rig checklist outcomes reversible, durable, and
  honest](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/203)
  owns the parent gate's meaning and durable completion.
- [#205 — Turn Rig Checks into a practical, visual preparation
  lesson](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/205)
  owns parent diagrams, defect evidence and applied preparation teaching.
- [#154 — Restore quiz focus and expose answer/progress state
  accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
- [#155 — Return topic quizzes to their parent module instead of global
  Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
- [#156 — Validate persisted quiz answers against stable question and option
  identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
- [#157 — Do not reveal quiz correctness through the live score before
  submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
- [#193 — Validate every quiz question and explanation at catalogue load
  time](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193)
- [#194 — Define privacy-safe anonymous quiz attempt persistence and
  recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)

## Authoritative sources

All sources were accessed 2026-07-31. Manufacturer and offshore-racing
material demonstrate configuration/operating-context requirements; neither is
asserted to govern every recreational yacht.

[^selden]: Seldén Mast AB, [“Rigging instructions & sailmakers
  guide”](https://support.seldenmast.com/en/technical_info/rigging_instructions.html)
  and [“Hints and advice on rigging and tuning of your Seldén
  mast”](https://support.seldenmast.com/files/595-540-E.pdf), including
  rig-specific tuning sequences and maintenance guidance.
[^maib-rig]: Marine Accident Investigation Branch, [“MAIB Safety Digest
  2/2018”](https://assets.publishing.service.gov.uk/media/5e81e5d2e90e0706ead5f5b1/2018-SD2-MAIBSafetyDigest.pdf),
  Case 22, **“The Cyclic Effect,”** PDF pages 50–51.
[^ws]: World Sailing, [“Offshore Special Regulations
  2026–2027”](https://media.sailing.org/sailing/wp-content/uploads/2025/12/05110802/WS_Offshore_Special-Regulations_2026-2027_v1_wcover.pdf),
  rule 3.01, **Strength of Build and Rig**.
