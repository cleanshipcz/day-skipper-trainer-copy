# Anchorwork Quiz learner-facing audit

- Audit issue: [#94](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/94)
- Route/topic: `/quiz/anchorwork` / `anchorwork`
- Audited: 2026-07-31
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/anchorwork.ts`
- Quiz services: `src/features/quiz/`
- Parent/practice: `src/pages/AnchorTheory.tsx`,
  `src/pages/AnchorMinigame.tsx`
- Preceding audits: `docs/audits/ANCHORWORK_THEORY_AUDIT.md`,
  `docs/audits/ANCHOR_MINIGAME_AUDIT.md`

## Verdict

**The quiz completes reliably, but it currently certifies unsafe absolutes and
substantial untaught material rather than dependable Anchorwork mastery.** Its
12 stable question IDs, answer shuffling, 70% pass calculation, retry flow, and
shared persistence recovery are mechanically sound. Six questions substantially
match the five-card parent; the rest introduce trip lines, dragging response,
kedge anchors, cable strong points, and chain behavior without teaching them.
No question meaningfully assesses weighing anchor, safe deployment/setting,
anchor watch, signals, or an actual scope/swinging-room calculation.

Safety-sensitive wording repeats the fixed 4:1/7:1 and “best Danforth” claims
already rejected by the theory/minigame audits. It additionally attributes
shock absorption to chain, makes paying out cable the default first response to
dragging, and asks why a cable should “never” be secured to a deck cleat alone
while its intended answer permits a properly backed deck cleat. A learner can
also discover every answer before submission through the shared live-score
oracle. Passing therefore must not yet be presented as “mastery.”

## Evidence and exercised paths

### Runtime method and scope

The production bank, shared quiz shell, scoring/session helpers, parent,
minigame, registry, and preceding audits were inspected. A production build
with placeholder Supabase configuration was exercised in clean Chromium at
375, 768, and 1280 CSS px. The direct route, shuffled options, pointer and
keyboard selection/submission, explanations, Next flow, completion, and retry
were checked against the actual production chunk.

Observed results:

- The parent reveals **Take Quiz** only after all five click-completed theory
  cards and routes to `/quiz/anchorwork`.
- All 12 questions have unique IDs (`a1`–`a12`), four non-empty options, an
  in-range intended answer, and an explanation.
- The shuffled catalogue-defined answer for all 12 questions completes as
  **100%**, **12 out of 12 correct**, and **Excellent work!**.
- At 375, 768, and 1280 px the active question did not create document-level
  horizontal overflow. Answer and action controls remained native buttons
  available to pointer and keyboard users.
- Submit begins disabled, answer selection enables it, submission locks all
  answers and reveals the intended option plus explanation, and Next advances.
  Retry starts a fresh shuffled run at question 1.
- Selecting options before Submit immediately changes the visible score,
  confirming that cycling choices exposes correctness.

No live authenticated Supabase round-trip, assistive-technology session,
rejected dynamic-import injection, offline completion recovery, physical
anchoring trial, or subject-matter-expert validation was performed.

### Coverage of theory and practice

The parent teaches five short topics. Quiz alignment is partial:

- `a1`, `a3`, and `a9` test the parent's fixed scope ratios and denominator
  wording, but only as recall. There is no numerical scenario in which a learner
  calculates total vertical depth, rising tide, rode length, or clearance.
- `a2` tests transit bearings; `a10` tests the broad approach direction and
  speed; `a4` defines swinging room; and `a5` repeats the Danforth/sand pairing.
- `a7` expands the parent's one-line chain tip into abrasion, angle, and shock
  claims that were not taught.
- `a6` (trip line), `a8` (response to dragging), `a11` (kedge use), and `a12`
  (strong point/cable attachment) are not taught by the parent.

The bank omits the parent's spare-anchor tip, controlled lowering/paying out,
progressive setting and holding checks beyond one transit answer, GPS/depth
alarm, anchor ball/light, weighing procedure, avoiding the rode, cleaning,
inspection/chafe, the stated swing-radius approximation, neighbouring anchor
positions, and wind/tidal shifts.

The minigame checks only bottom contact, fixed scope, and position ahead. The
quiz does not expose that simplification or test the practice gaps identified
in audit #93: setting load, holding, available room, hazards/neighbours,
watchkeeping, changing conditions, and recovery. Neither theory clicks nor
minigame success supplies trustworthy prerequisites for a mastery claim.

### Numerical and safety accuracy

The intended answer is syntactically unambiguous for every question, but the
following need qualified subject-matter correction:

- `a1` and `a9` call 4:1 a minimum in calm conditions and at least 7:1 reliable
  in heavy weather/strong tide. Required scope depends on total vertical depth,
  rode and anchor, vessel, seabed, wind/current/waves, room, manufacturer
  guidance, and local constraints; a fixed ratio cannot guarantee holding.
- `a3` says to add “water depth, tidal range, and bow height.” If water depth is
  already the current/anticipated depth, adding the entire tidal range can
  double-count water. The denominator should be maximum anticipated vertical
  distance from bow roller/chock to seabed, with assumptions and units stated.
- `a5` asks for the “best” sandy-seabed anchor and universally selects Danforth.
  Design variation, sizing, vessel, setting/reset behavior, sand type, weed,
  rode, and manufacturer guidance prevent one categorical answer.
- `a6` accurately describes the basic purpose of a trip line but presents a
  buoyed crown line without warning that it can foul the vessel, propeller, or
  other traffic and is not suitable in every anchorage.
- `a7` says chain weight “absorbs shock loads.” Chain weight/catenary can soften
  load in some conditions but straightens as load rises; a suitable nylon
  snubber/bridle provides deliberate elasticity. Chain primarily supplies
  abrasion resistance, weight, and a lower pull angle.
- `a8` says to first pay out more cable when dragging. Immediate priorities
  depend on room, hazards, traffic, weather, crew, engine readiness, and why the
  anchor failed. More rode may help only if safe room exists; regaining control
  and re-anchoring may be urgent.
- `a10` reduces the approach to whichever of wind or tide is “stronger.”
  Learners need the dominant resultant effect on their vessel plus sea room,
  traffic, waves, maneuvering characteristics, and an abort route.
- `a11` treats preventing swing and laying a kedge by dinghy as straightforward
  uses without addressing crossing rodes, changing conditions, tender load,
  crew communication, or warping hazards.
- `a12` is internally contradictory: its stem says never use a deck cleat
  alone, while the intended explanation accepts a deck cleat backed through the
  deck. A bow roller guides the cable but is not necessarily the load-bearing
  strong point. The lesson should identify properly engineered bitts/cleats,
  snubbers/bridles, chafe protection, and manufacturer/vessel guidance rather
  than state an impossible universal.

These are not minor distractor problems: the completion card tells a 70% learner
they have mastered a safety-sensitive topic.

### Explanations and remediation

Every submitted answer receives one concise explanation, and correct/incorrect
state is shown with text/icons as well as colour. The explanations mostly
restate the chosen answer. They do not qualify scenario limits, show a worked
scope calculation, cite a reviewed source, link to the relevant parent card, or
distinguish what the simplified minigame does not model.

Wrong answers do not receive distractor-specific feedback. After failure, the
only guidance is “Review the material and try again,” but Home routes to global
`/`, not `/anchorwork`, and several failed subjects do not exist in the parent
to review. Retry reshuffles rather than offering a targeted remediation path.

### Scoring, retry, completion, and failure states

- `countCorrectAnswers` compares stored choices against each shuffled
  question's remapped answer; percentage is rounded and 70% passes. Client
  scoring intentionally grants zero profile points.
- Correctness is calculated while options remain editable. The header score
  rises as soon as the correct option is selected, so a learner can cycle until
  it changes and then submit. The result cannot evidence independent recall.
- Previous is available only before submission of the current question. Submit
  locks it; Next persists the following index; final Next performs completion.
- Attempt creation, score saving, final progress, engagement, and review seeding
  expose separate retry paths. If score save succeeds but completion save
  fails, duplicate score submission is prevented and Retry is disabled until
  final progress is saved.
- Unknown, empty, and rejected catalogues render an unavailable card. Failed
  catalogue imports are evicted from cache and can be retried.
- Active Back, completion Home, and the unavailable topic action do not return
  to Anchorwork. The unavailable card specifically offers **Nautical Terms**,
  which is unrelated to an unavailable Anchorwork quiz.

### Persistence and edge behavior

- Anonymous attempts live only in component memory and disappear on reload.
  Authenticated attempts use canonical key `quiz-anchorwork`.
- Saved sessions contain shuffled option indices and question position, but no
  stable question/option identities or shuffle seed. Catalogue or shuffle
  changes can reinterpret a restored answer.
- `parseSavedQuizSession` accepts any finite answer number, including negative,
  fractional, and out-of-range values. Initialization is tied to question count
  rather than catalogue identity.
- Completed progress is not resumed as an editable attempt. Local completion
  workflow recovery prevents duplicate score submission after a partial save.

### Accessibility and input

Native answer/action buttons support pointer and keyboard activation, and
submitted feedback uses icon and text in addition to colour. Shared-shell gaps
remain:

- Back has no accessible name.
- Answer selection has no radio, `aria-pressed`, or other programmatic selected
  state before submission.
- The numeric progressbar has no accessible label.
- Explanation, correctness, score, question, and completion changes are not
  deliberately announced.
- Focus is not moved to the new question or completion heading after Next.

These prevent screen-reader users from reliably identifying their choice,
progress, feedback, or newly rendered step.

## Complete focused follow-up issue drafts

### Align the Anchorwork Quiz with taught, assessable learning outcomes

**Problem**

The quiz gates on five click-completed cards but tests four substantially
untaught subjects and extra chain guidance, while omitting core deployment,
setting, watch, signals, weighing, inspection, and numerical scope/swing work.
Neither parent nor minigame provides trustworthy prerequisites or remediation.

**Acceptance criteria**

- Define reviewed Anchorwork learning outcomes and map every quiz item to a
  taught parent/practice outcome or clearly identified prerequisite.
- Teach trip lines, dragging response, kedge use, strong points, and detailed
  chain behavior before assessing them, or remove them from this bank.
- Add scenario-based assessment of controlled deployment/setting, independent
  holding checks, anchor watch, signals/local rules, weighing/recovery, and
  rode inspection at the depth appropriate to this module.
- Include at least one worked numerical scope/total-depth problem and one
  swinging-clearance problem with units, assumptions, and safe-room limits.
- Replace click-only readiness and simplistic minigame success with a defined,
  durable prerequisite/remediation flow.
- Add coverage-map and question-quality tests that fail when assessed outcomes
  lose their teaching source.

### Correct unsafe and contradictory Anchorwork Quiz guidance

**Problem**

The bank treats fixed scope as universally reliable, calls Danforth universally
best in sand, overstates chain shock absorption, defaults to paying out when
dragging, oversimplifies approach/kedge use, omits trip-line hazards, and
contradicts itself about deck cleats/bow rollers.

**Acceptance criteria**

- Have all revised questions/explanations reviewed by a suitably qualified
  anchoring instructor.
- Express scope as scenario-dependent and calculate it from maximum anticipated
  bow-roller/chock-to-seabed distance without double-counting tide.
- Qualify anchor selection, trip-line use, approach direction, dragging
  response, kedge operations, and available-room decisions.
- Distinguish chain weight/catenary from deliberate elastic shock absorption by
  a suitable snubber/bridle.
- Replace `a12` with internally consistent guidance about engineered strong
  points, bow-roller function, chafe, snubbers/bridles, and vessel/manufacturer
  guidance.
- Do not claim “reliable holding” or “mastery” beyond what the reviewed
  questions prove.
- Protect approved safety wording and numerical examples with content fixtures
  or automated tests.

## Existing shared follow-up issues

- [#154 — Restore quiz focus and expose answer/progress state
  accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  — covers Back, selection state, progress naming, announcements, and focus.
- [#155 — Return topic quizzes to their parent module instead of global
  Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  — covers active/completion/unavailable routing and targeted remediation.
- [#156 — Validate persisted quiz answers against stable question and option
  identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  — covers positional persistence, malformed indices, and catalogue/shuffle
  changes.
- [#157 — Do not reveal quiz correctness through the live score before
  submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  — covers the pre-submit answer oracle.
- [#173 — Connect Anchorwork theory, minigame, and quiz as one guided learning
  path](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/173)
  — covers prerequisite, return-context, mastery, and remediation integration.
