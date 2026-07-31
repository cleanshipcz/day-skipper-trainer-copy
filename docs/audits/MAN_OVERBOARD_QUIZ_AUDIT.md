# Man Overboard Quiz learner-facing audit

- Audit issue: [#128](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/128)
- Route/topic: `/quiz/safety-mob-quiz` / `safety-mob-quiz`
- Audited: 2026-08-01
- Quiz shell: `src/pages/Quiz.tsx`, `src/features/quiz/`
- Question bank: `src/data/quizzes/safetyMob.ts`
- Registry/navigation: `src/data/quizzes/index.ts`,
  `src/pages/ManOverboardTheory.tsx`, `src/pages/SafetyMenu.tsx`

## Verdict

**The quiz is reachable and mechanically completable, but its safety content
does not support the claim that a 70% result demonstrates Man Overboard
mastery.** The catalogue resolves 12 stable question IDs, runtime shuffling
preserves the keyed answers, submission locks a choice and reveals an
explanation, retry starts a new shuffle, and authenticated save failures have
explicit recovery paths.

The assessment is disproportionately radio recall and Williamson-turn recall:
four of 12 questions concern distress/urgency communications and two describe
the same turn. It omits several operational outcomes needed to manage the
casualty and vessel. Some of the material it does test is dangerously absolute
or misleading: it presents one approach side and turn as universal, gives a
nonstandard medical explanation for horizontal recovery, says all MAYDAY calls
are made on Channel 16 without distinguishing DSC, and offers an incomplete
answer to its own MAYDAY-message question. These defects need subject-matter
correction before the result is used as evidence of emergency competence.

Shared quiz-shell defects also apply: the live Score badge reveals correctness
before Submit, persisted shuffled indices can be reinterpreted, anonymous
reload loses the attempt, topic actions return to global Home, attempt-start
failure has no direct retry, and in-progress writes can fail without any
learner-visible saving/failed state or retry. Selection/progress/feedback/focus
semantics are also insufficient for assistive technology. Existing focused
issues own those shared problems.

## Evidence and audit bounds

### Method

The exact route registration, parent navigation, complete production bank,
shared shell, scoring, randomisation, session persistence and relevant tests
were inspected directly. Question content was compared with current RYA Man
Overboard guidance, MCA VHF DSC procedure, MCA recovery guidance and MCA
emergency-drill guidance.[^rya][^vhf][^recovery][^drills]

Typecheck, lint, focused quiz/helper tests, production build and the internal
artifact guard were run for this branch. No authenticated Supabase round-trip,
offline reconciliation, physical recovery drill, screen-reader session,
forced-colours/high-zoom session, real touch hardware or qualified medical/
seamanship review was performed. Responsive findings below are source-based;
the shared shell's already recorded 375/768/1280 behavior was not independently
repeated in this audit.

### Reachability and catalogue integrity

- `/safety` exposes **Man Overboard (MOB)** and routes to `/safety/mob`.
  The parent's Drill tab exposes **Take the MOB Quiz** at the intended route.
- The parent advertises “5 questions,” but the loaded bank contains 12.
- `safety-mob-quiz` is a valid topic ID, maps to the correct title/subtitle and
  dynamically imports `safetyMob.ts`.
- The bank has 12 unique IDs (`mob1`–`mob12`), four non-empty options per item,
  in-range keyed answers and non-empty explanations. Runtime shuffling remaps
  the answer index correctly.
- The parent is not an enforced prerequisite. Visiting the quiz directly is
  sufficient, and parent progress is recorded merely by mounting the theory
  page rather than demonstrating learning.

## Procedure and safety coverage

The bank samples the parent's immediate shout, flotation/marking, pointer,
Williamson turn, leeward-side wording, MAYDAY, VHF Channel 16 and recovery
orientation. Coverage is nevertheless too narrow for the subtitle
“procedures, distress signals, and recovery actions”:

- `mob4` and `mob9` duplicate the Williamson turn. No item asks a learner to
  choose a return manoeuvre based on sail/power, visual contact, sea room,
  weather, crew or vessel characteristics.
- `mob3`, `mob8`, `mob11` and `mob12` devote one third of the bank to short
  radio-recall prompts. They do not make the learner assemble or transmit a
  complete, ordered DSC-plus-voice distress procedure.
- `mob1`, `mob6` and `mob7` cover shout, flotation/position marker and pointer,
  but the quiz never tests pressing MOB on the plotter, stopping/reducing speed
  to prevent another casualty, briefing roles or readying the recovery system.
- It does not assess recovery of an unconscious/incapacitated casualty,
  securing them alongside, vessel-specific lifting equipment, airway/first
  aid/aftercare, or what to do when own-boat recovery is not immediately safe.
- Prevention, tethers/kill cord, crew competence, recovery-plan rehearsal and
  equipment drills are absent. A text-only bank never assesses sequence under
  pressure, visual position keeping, equipment recognition or changing
  conditions.

These gaps are tracked by [#336](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/336).

## Answer accuracy and explanations

Several intended answers need safety-critical correction:

- `mob2` universally keys approaching with the casualty on the leeward side.
  Current RYA guidance instead says to think through the approach and aim to
  position the vessel upwind so it is blown towards the casualty. Vessel type,
  rig, wind/sea, sea room and the intended recovery point matter. The existing
  explanation acknowledges the boat may drift onto the person but provides no
  controlled-drift, stopping or abort context.
- `mob4` calls a Williamson turn a “60° turn then hard over”; `mob9` says “hard
  over, then when 60° off course, hard over the other way” and promises an exact
  reciprocal track. The duplicated shorthand is internally inconsistent and
  suppresses vessel/condition/turn-direction procedure and limitations.
- `mob5` labels the benefit of horizontal recovery “Reflow Syndrome (heart
  failure)” and explains that vertical lifting makes cold blood rush from the
  legs to the core. Current MCA guidance recommends horizontal or
  near-horizontal (“deck-chair”) recovery where practicable, but does not
  support this named syndrome or simplistic causal certainty. This wording
  should be medically reviewed rather than memorised as a diagnostic fact.
- `mob8` says **all** MAYDAY calls are made on Channel 16. MCA procedure uses a
  VHF DSC distress alert first where fitted, followed after acknowledgement or
  about 15 seconds by the voice distress call/message on Channel 16.
- `mob12` asks what information “must” be included, but its keyed option omits
  assistance required and other useful information even though its explanation
  lists them. It adds MMSI without distinguishing the call/identification
  sequence or equipment availability.
- `mob10` correctly identifies propeller injury and neutral alongside, but its
  wording should align with recovery guidance: engines are neutral or switched
  off as circumstances allow, and the casualty must remain clear of the
  propeller/recovery should use an appropriate safe point.

`mob1`, `mob3`, `mob6`, `mob7` and `mob11` are broadly defensible within their
stated alternatives. Their explanations remain terse answer restatements,
without scenario limits, distractor-specific correction, source/review date or
a route to the exact parent material. Accuracy remediation is tracked by
[#335](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/335).

## Scoring, submission and remediation

- `countCorrectAnswers` compares stored indices with the shuffled bank;
  `quizCompletionOutcome` rounds the percentage and passes at 70%. Eight of 12
  correct produces 67% and fails; nine produces 75% and passes. Client scoring
  intentionally grants zero trusted profile points.
- The Score badge recalculates on selection, before Submit. Cycling choices
  exposes the correct answer; [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns this assessment-validity defect.
- Submit is unavailable until a choice exists. Submission disables the current
  view's options, marks correct/selected-wrong with icon and text, shows one
  generic explanation and enables Next. That lock is transient: Next clears
  `showExplanation`, and navigating Previous from a later unsubmitted question
  clears it again, so an earlier submitted answer becomes editable. Together
  with the live Score oracle, this permits answer correction after feedback;
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns the validity problem.
- A passing result says “You've mastered this topic!” although nine short
  recognition answers can omit multiple safety-critical outcomes. A failing
  result only says to review material; it does not identify missed outcomes or
  link back to `/safety/mob`.
- Retry clears in-memory answers, advances the shuffle seed and starts a new
  authenticated attempt. Completion retry is disabled after a score has saved
  until final progress saving succeeds, reducing duplicate submissions.

## Persistence and edge states

- Authenticated selection/navigation persists via canonical key
  `quiz-safety-mob-quiz`; anonymous attempts exist only in component state and
  disappear on reload. [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns the anonymous policy.
- For authenticated in-progress attempts, selection and Previous/Next update
  React state first and then await `saveProgress`. A resolved `false` result is
  ignored, while a rejection escapes the async event handler. There is no
  saving/saved/failed indicator, navigation warning or retry, so the UI can
  appear successful even when resumable state was not stored. Concurrent slow
  writes also have no explicit ordering/version contract. Existing
  [#313](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)
  owns failure reporting, retry and write ordering.
- Saved sessions store shuffled question-position and option indices, not stable
  question/option identities or a shuffle seed. Catalogue/shuffle changes can
  reinterpret restored answers; malformed finite answer indices also survive
  parsing. [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns validation and identity-safe persistence.
- Score submission, final progress, engagement and review seeding are separate
  operations with distinct recovery behavior. A partially saved completion is
  retained locally and can be retried.
- Attempt creation failure is silent and has no direct retry. Completion then
  says the attempt is still starting, but retrying completion does not rerun the
  failed start RPC. [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
  owns recovery.
- Unknown, empty and rejected catalogues render an unavailable state; failed
  imports are evicted from cache and Retry loading can request them again.
  Unavailable fallback navigation points to unrelated Nautical Terms.

## Accessibility, viewport and input behavior

- Answer choices and actions are native buttons, so pointer and keyboard
  activation work. Feedback uses icons and text in addition to colour.
- The icon-only Back control has no accessible name. Answer selection has no
  radio/`aria-pressed` state, Progress lacks a topic-specific accessible label,
  and feedback, score, question and completion transitions are not deliberately
  announced or focused. [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  owns these shared defects.
- Back, completion Home and unavailable Home route to `/`, not `/safety/mob`;
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns topic-aware return/remediation navigation.
- The text-only bank avoids image-alt and media-legibility defects. The shared
  sticky header/card shell still lacks checked-in regression coverage for long
  localized text, high zoom, forced colours, touch and reduced motion. Existing
  shared-shell audits reproduced narrow-width pressure at 375 px; this audit
  does not claim a fresh browser reproduction.

## Follow-up ownership

New MOB-specific issues:

1. [#335 — Correct unsafe and misleading Man Overboard Quiz guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/335)
2. [#336 — Align the Man Overboard Quiz with complete, applied recovery outcomes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/336)

Existing shared issues:

1. [#154 — Restore quiz focus and expose answer/progress state accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
2. [#155 — Return topic quizzes to their parent module instead of global Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
3. [#156 — Validate persisted quiz answers against stable question and option identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
4. [#157 — Do not reveal quiz correctness through the live score before submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
5. [#194 — Define privacy-safe anonymous quiz attempt persistence and recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
6. [#209 — Surface and recover authenticated quiz attempt-start failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
7. [#313 — Surface and recover in-progress quiz session persistence failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)

## Authoritative sources

All sources were accessed 2026-08-01.

[^rya]: Royal Yachting Association, [Man Overboard](https://www.rya.org.uk/water-safety/cold-water-shock-safety/man-overboard/), immediate alarm, spotter/markers, MOB plotter mark, distress alert, approach planning, propeller and recovery guidance.
[^vhf]: Maritime and Coastguard Agency, [GMDSS VHF DSC procedures for small boat users](https://www.gov.uk/government/publications/gmdss-sea-areas-and-procedures-for-small-boat-users/gmdss-vhf-dsc-procedures-for-small-boat-users), updated 24 July 2024, distress-alert and Channel 16 voice procedure/message fields.
[^recovery]: Maritime and Coastguard Agency, [MGN 544 Amendment 1 Annex 1](https://www.gov.uk/government/publications/mgn-544-amendment-1-mf-means-of-recovery-of-persons-from-the-water-by-ships-and-boats-plans-procedures-and-acceptance-of-recovery-equipment/mgn-544-amendment-1-annex-1), horizontal/near-horizontal recovery and propeller-clear recovery position.
[^drills]: Maritime and Coastguard Agency, [MGN 570 Amendment No. 1 (F): Fishing vessels: emergency drills](https://www.gov.uk/government/publications/mgn-570-amendment-no-1-f-fishing-vessels-emergency-drills/mgn-570-amendment-no-1-f-fishing-vessels-emergency-drills), generic MOB actions, communications, recovery preparation and drill expectations.
