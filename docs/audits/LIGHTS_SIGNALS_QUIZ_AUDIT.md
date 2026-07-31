# Lights & Signals Mastery Quiz learner-facing audit

- Audit issue: [#105](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/105)
- Route/topic: `/quiz/lights-signals` / `lights-signals`
- Audited: 2026-07-31
- Quiz shell: `src/pages/Quiz.tsx`, `src/features/quiz/`
- Question bank: `src/data/quizzes/lightsSignals.ts`
- Registry/navigation: `src/data/quizzes/index.ts`, `src/pages/LightsSignalsMenu.tsx`

## Verdict

**This reachable 20-question recall quiz is not the “30+ scenarios covering
all signal types” promised by its parent, and it is not a valid mastery
assessment of COLREG Parts C and D.** The catalogue resolves the intended bank,
questions and options are shuffled, immediate explanations are available,
scoring uses a 70% pass threshold, and authenticated completion has explicit
retry UI. The shared quiz helpers have useful automated coverage.

The bank is text-only and almost every item asks learners to recall one
mnemonic, colour stack, shape or blast duration. It never presents vessel
aspect, relative placement, range, a timed/audible signal, or an applied
identification and safe-action scenario. It samples fragments of Rules 23–30,
32, 34–35 and Annex IV, while omitting Rules 20–22, 31, 33 and 36 and most
conditional configurations inside the sampled rules.

Several answers are unsafe or materially underqualified. `ls14` says five
short blasts rather than **at least five short and rapid** blasts. `ls19`
treats a diamond alone as uniquely identifying a tow over 200 m although a
diamond is also the centre shape in the ball-diamond-ball signal for restricted
ability to manoeuvre. Status-light questions omit the additional lights shown
when making way, anchored or engaged in particular operations. Explanations
mostly repeat the keyed fragment; they do not establish applicability,
exceptions, aspect or why alternatives are wrong.

The shared shell exposes correctness through its live Score badge before
Submit, persists shuffled array indices rather than stable answer identities,
silently drops anonymous progress, and cannot recover an attempt-start failure
without completing and trying to save. Back and completion Home return to the
global home page rather than Lights & Signals. Selection/progress/feedback and
focus transitions remain weak for assistive technology. These are already
owned by focused shared issues.

## Evidence and audit bounds

### Method

The parent, route registry, complete 20-item bank, shared quiz shell, scoring,
randomisation and persistence helpers, and related tests were inspected
directly. Content was compared rule-by-rule with the current official US Coast
Guard International Rules amalgamation and corrected Navigation Rules and
Regulations Handbook; the IMO overview was used for convention scope.[^uscg]
[^handbook][^imo]

Typecheck, lint, focused quiz/data tests, production build and the internal
artifact guard were run for this audit. Browser behavior at 375, 768 and 1280
CSS px was not re-exercised within the audit window; responsive observations
below are source-based and inherit the already reproduced shared-shell behavior
recorded by the Rules of the Road quiz audit. No authenticated backend
round-trip, offline reconciliation, actual touch hardware, screen reader,
forced colours, high zoom or audible output was exercised.

## Reachability, promise and prerequisites

- `/rules/lights` exposes **Mastery Quiz** at `/quiz/lights-signals`; the
  catalogue maps that topic to **Lights & Signals Mastery** and loads the
  correct bank.
- The parent promises “30+ scenarios covering all signal types.” There are
  exactly 20 questions, no images or audio, and no scenario containing vessel
  aspect, operational context, visibility history or required action.
- The adjacent theory page is not enforced as a prerequisite. More
  importantly, that page does not teach enough of the tested detail: towing
  lights, hovercraft, exact blast durations and several fog signals appear in
  the quiz despite being absent or only compressed in theory. Existing
  [#217](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/217),
  [#218](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/218)
  and [#219](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/219)
  own content correction and prerequisite alignment.

## Coverage and answer accuracy

### Part C: Rules 20–31

- Rules 20–22 foundations, definitions and visibility ranges are absent, as is
  Rule 31. Learners are not assessed on when lights/shapes apply, sectors,
  placement or range.
- `ls16` correctly keys the flashing yellow light for an air-cushion vessel in
  non-displacement mode, but Rule 23's ordinary power-driven configurations,
  size thresholds and WIG craft are absent.
- `ls12` correctly identifies the yellow towing light vertically above the
  sternlight for towing astern, and `ls19` recalls the over-200 m tow diamond.
  The bank omits masthead counts, sidelights, length exceptions, pushing,
  composite units and inconspicuous/partly submerged tows. `ls19` is ambiguous:
  a diamond alone does not uniquely mean a long tow because Rule 27 also uses a
  diamond between two balls.
- `ls13` correctly keys the apex-down cone for a sailing vessel also propelled
  by machinery. `ls20` correctly recalls optional red-over-green all-round
  lights, but does not state that they are at or near the masthead, cannot be
  combined with the optional combined lantern, and supplement rather than
  replace required sidelights/sternlight.
- `ls2` and `ls3` correctly key the basic fishing/trawling status stacks.
  They omit making-way lights, day shapes, gear extending over 150 m and
  trawler masthead-light conditions.
- `ls4` and `ls11` correctly key NUC and generic RAM all-round stacks. They omit
  day shapes, making-way additions and RAM operation-specific towing, dredging,
  diving and mine-clearance signals.
- `ls6` omits that constrained-by-draught status applies to a power-driven
  vessel and that the cylinder and red-red-red lights are optional (“may”).
- `ls1` correctly keys pilot white-over-red, but omits underway sidelights and
  sternlight, anchor additions and the fallback when not on pilotage duty.
- `ls5` and `ls7` key the basic anchor and aground shapes. They omit anchor
  size/configuration requirements, aground lights and small-vessel exceptions.

### Part D: Rules 32–36

- `ls17` and `ls18` correctly define short and prolonged blast durations.
  Whistle/bell definitions and Rule 33 equipment are otherwise absent.
- `ls14` is materially wrong: Rule 34's doubt signal is **at least five short
  and rapid blasts**, not exactly five. Its in-sight context and permitted
  synchronized light signal are absent, as are manoeuvring, overtaking and bend
  signals.
- `ls8` and `ls9` correctly distinguish a power-driven vessel making way from
  one underway but stopped. `ls10` broadly identifies the
  prolonged-short-short group, but “Power-driven vessel” is an imprecise
  distractor because several listed special-status vessels may also be
  power-driven. Anchor, aground, pilot, tow-specific and small-vessel signals
  are omitted.
- Rule 36 attention signals are absent. No question produces sound or encodes
  rhythm accessibly; compact prose cannot test auditory recognition.

### Distress

`ls15` correctly keys orange smoke among its alternatives, but one recognition
item cannot substantiate “all signal types.” It does not test the wider Annex
IV set, transmission/use conditions, false-alert boundaries or response. No
signal is shown, sounded or described with an accessible structured equivalent.

## Assessment quality and explanations

- All 20 source answers are index zero. Runtime option shuffling prevents a
  visible all-A pattern, but the source design makes authoring mistakes harder
  to notice and does not improve construct coverage.
- Seventeen items are direct “what is it/what does it mean” recall; none asks
  the learner to interpret an aspect, choose between confusable combinations,
  apply an exception or decide a safe response.
- Mnemonics such as “Captain is Dead” are memorable but explanations do not
  distinguish memory aids from rule text. Most feedback merely restates the
  keyed answer and rule number.
- The live Score derives from selected answers before Submit, revealing whether
  the current selection is correct. Existing
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns this validity defect.

## Scoring, retry, completion and persistence

- `countCorrectAnswers` compares stored indices with the current shuffled
  questions; `percentageScore` and `quizCompletionOutcome` apply a 70% pass
  threshold. A failed quiz is still saved as completed but does not receive
  trusted completion points.
- Previous navigation permits changing an unsubmitted answer. After Submit,
  answer buttons are disabled and feedback appears before Next. Retry reshuffles
  the bank/options and starts a new authenticated attempt.
- Authenticated partial progress is saved after selection/navigation. Persisted
  indices are not tied to stable question/option identities, so reload after a
  new shuffle can reinterpret answers. Existing
  [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns this.
- Anonymous attempts are session-state only and disappear on reload; existing
  [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns the required privacy-safe policy.
- Attempt creation failure is silent. Completion then reports that the attempt
  is still starting, but retrying only completion does not restart the failed
  RPC. Existing [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
  owns recovery.
- Score submission, final progress, engagement and spaced-review seeding are
  separate operations. The shell retains a submitted score locally and blocks
  restart while final progress needs retry, reducing duplicate score writes;
  review-sync failure has a separate alert and retry.

## Accessibility, responsive behavior and input

- Answer choices are native buttons and keyboard operable, but selection is
  conveyed primarily by styling; the group has no radio semantics or explicit
  selected state. Progress lacks an adjacent programmatic question count, the
  icon-only Back control has no accessible name, and feedback/focus are not
  deliberately moved or announced after Submit/Next. Existing
  [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  owns these shared defects.
- Header Back, unavailable-state actions and completion Home navigate to `/`,
  not `/rules/lights`. Existing
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns topic-aware return navigation.
- The shell uses hover scaling and fixed header/card composition. The existing
  375 px shell reproduction found horizontal clipping; 768 and 1280 fitted the
  initial text-only state. Long/localized content, high zoom, touch, reduced
  motion and forced colours still lack checked-in regression coverage under
  #154.
- Unlike the Rules of the Road bank, this bank contains no images. Existing
  [#223](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/223)
  owns accessible/traceable scenario imagery in the related Rules quiz; it
  should not be expanded to disguise this quiz's broader absence of applied
  vessel-aspect and sound assessment.

## Follow-up ownership

No new issue is required; the findings fit existing focused scopes:

1. [#217 — Correct and complete COLREG lights and day shapes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/217)
2. [#218 — Complete COLREG sound and light signal teaching](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/218)
3. [#219 — Correct and contextualize Annex IV distress signals](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/219)
4. [#154 — Restore quiz focus and expose answer/progress state accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
5. [#155 — Return topic quizzes to their parent module instead of global Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
6. [#156 — Validate persisted quiz answers against stable question and option identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
7. [#157 — Do not reveal quiz correctness through the live score before submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
8. [#194 — Define privacy-safe anonymous quiz attempt persistence and recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
9. [#209 — Surface and recover authenticated quiz attempt-start failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)

## Authoritative sources

All sources were accessed 2026-07-31.

[^uscg]: United States Coast Guard Navigation Center, [“Amalgamated Navigation
  Rules — International & U.S.
  Inland”](https://www.navcen.uscg.gov/navigation-rules-amalgamated), current
  International Rules text, Rules 20–37 and Annex IV.
[^handbook]: United States Coast Guard, [“Navigation Rules and Regulations
  Handbook, corrected 8 August
  2024”](https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf).
[^imo]: International Maritime Organization, [“COLREG — Preventing collisions
  at sea”](https://www.imo.org/en/ourwork/safety/pages/preventing-collisions.aspx),
  convention structure and annex scope.
