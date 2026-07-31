# Man Overboard theory learner-facing audit

- Audit issue: [#130](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/130)
- Route/topic: `/safety/mob` / `safety-mob`
- Audited: 2026-08-01
- Theory: `src/pages/ManOverboardTheory.tsx`
- Ordering game: `src/components/safety/MOBSortingGame.tsx`
- Registry/navigation: `src/pages/SafetyMenu.tsx`,
  `src/constants/topicRegistry.ts`
- Related quiz audit: `docs/audits/MAN_OVERBOARD_QUIZ_AUDIT.md`

## Verdict

**This attractive tabbed reference contains useful alarm/mark/spotter prompts,
but it is not a safe, complete or evidence-based Man Overboard lesson.** It
presents vessel- and condition-dependent manoeuvres as universal recipes,
compresses the distress procedure incorrectly, recommends direct harness/halyard
lifting without recovery-system constraints, and repeats unsupported “Reflow
Syndrome” wording. The strict ordering game further turns concurrent crew roles
and one disputed Williamson shorthand into exact arrays to memorise.

Opening the route immediately records `safety-mob` as completed with 100% and 10
points. The write is not awaited, no learning action is required, failure is
invisible, and restored state is never displayed. The page therefore certifies
completion before the learner sees content. Existing #335 owns the overlapping
approach/Williamson/medical/radio claims shared with the quiz; three new focused
issues own the remaining theory, drill and completion work without duplicating
that remediation.

## Evidence and audit bounds

The route/menu registry, full five-tab page, ordering-game state machine,
progress call and linked quiz were inspected directly. Content was compared
with current RYA Man Overboard guidance and MCA distress, recovery and emergency
drill guidance.[^rya][^vhf][^recovery][^drills]

Typecheck, lint, production build, focused registry/quiz tests and the internal
artifact guard were run. No authenticated/offline persistence round-trip,
physical MOB drill, vessel/rig trial, screen-reader, forced-colours, 200% zoom,
actual touch hardware, fresh automated viewport run, or qualified seamanship/
medical review was performed. Responsive observations are source-based.

## Reachability, navigation and visuals

- `/safety` exposes **Man Overboard (MOB)** and routes correctly. The header and
  final Back actions return to `/safety`; the header icon button has no
  accessible name.
- The Drill tab links to registered `/quiz/safety-mob-quiz`. Its copy promises
  five questions, but the bank has 12; [#336](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/336)
  already owns count, prerequisite and quiz-outcome alignment.
- The page declares `grid-cols-2 lg:grid-cols-4` for five tabs, so one trigger
  necessarily occupies an uneven extra row at every breakpoint. Content cards
  collapse to one column below `md`, but no 320/375 px, high-zoom, touch or long
  localized-label regression is checked in.
- The only visuals are generic Lucide icons, coloured borders/cards and numbered
  text. There is no vessel/relative-wind diagram, track plot, propeller-clear
  recovery-point illustration, lifting-rig visual, DSC/radio sequence or
  accessible alternative. Fixed manoeuvre prose is especially risky without a
  diagram or vessel-dependent decision context.

## Immediate actions and distress

The SHOUT/THROW/POINT/MARK cards align broadly with RYA guidance: raise the
alarm, appoint a spotter, deploy flotation/position markers and press MOB on the
plotter.[^rya] Important operational context is absent:

- There is no immediate helmsman objective to stop/reduce speed/control the
  vessel, prevent a second casualty, allocate roles, reassure the casualty or
  prepare recovery equipment.
- The numbered cards and game imply one serial sequence. On a crewed vessel,
  spotter, flotation/marker, plotter mark, vessel control, distress alert and
  recovery preparation should be delegated/concurrent where possible.
- “Do not jump in” is useful but does not cover attached/tethered MOB, cutting a
  tether only when necessary, single-handed prevention/recovery, PFD/PLB/kill
  cord or an inability to recover.

The MAYDAY section is materially incomplete. It inserts “ALL STATIONS” after
the three MAYDAY prowords, whereas the MCA distress-call template proceeds to
“This is” and the vessel name three times. The message omits number of persons
aboard and other useful information. “Press the red DSC Distress button for 5
seconds ... if possible” does not teach selecting a distress designation when
possible, holding until sent, waiting for acknowledgement/about 15 seconds,
then transmitting the voice call/message and listening on Channel 16.[^vhf]

[#335](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/335)
already owns the shared DSC/Channel 16 and MAYDAY-field correction. New
[#340](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/340)
owns the coherent theory flow and missing roles/outcomes.

## Manoeuvre accuracy and applicability

- “Start your engine immediately, even if sailing” is unsafe as a universal.
  Lines, sails, propeller, crew, sea room, vessel type and conditions must be
  controlled; RYA guidance says to stop/reduce speed and think through the
  approach, not prescribe automatic engine use.[^rya]
- The Williamson card calls one 60° sequence “best” for open water “when
  position is generated by GPS.” The manoeuvre is intended to regain a
  reciprocal track, particularly after visual contact is lost, but execution
  and suitability are vessel/condition dependent. GPS generation does not make
  it universally best.
- Reach–tack–reach is called the quickest sailing method and prescribes 5–6 boat
  lengths. Point of sail, rig, wind/sea, crew, visibility and boat handling can
  invalidate those absolutes. The approach instruction fixes the casualty on
  the leeward bow without controlled-drift, stopping or abort context.
- Heaving-to is called an instant short-handed solution and says turn “the
  wheel” hard to windward after backing the jib. Technique and resulting drift
  vary by wheel/tiller, rig, sail plan and boat; it is not guaranteed to stop
  near the casualty.

Shared Williamson and approach claims are already owned by #335. #340 owns the
remaining engine/sail method selection, qualification and visual teaching.

## Recovery and casualty care

- The ladder card correctly notes that a casualty may be unable to self-recover,
  but it does not restrict stern/platform use to suitable calm conditions or
  teach engine neutral/off and propeller clearance alongside.[^rya]
- “Attach a spinnaker or main halyard to their harness. Winch them up” assumes
  the worn harness and attachment are lifting-rated and safe. Current RYA
  guidance describes a halyard/block-and-tackle coupled with a lifting strop or
  dedicated device. A recovery plan must secure/support the casualty and airway
  without relying on an unsuitable lifejacket/tether harness.
- The parbuckle card gives no rigging, load, airway, injury or crew-safety
  constraints. No method covers an unconscious casualty, securing alongside,
  safe inability-to-lift actions, first aid, monitoring or Coastguard handover.
- MCA guidance recommends horizontal or near-horizontal recovery where
  practicable and recovery clear of propellers.[^recovery] The page instead says
  “treat ... horizontally” and attributes standing/vertical recovery to cold
  blood causing heart failure called “Reflow Syndrome.” That nonstandard,
  simplistic medical claim is already tracked by #335 and requires medical
  review, not repetition.

Missing recovery equipment, planning and aftercare are owned by #340.

## Ordering game and feedback

- Two scenario buttons shuffle five fixed steps. Arrow controls can reorder
  adjacent items; Check compares exact IDs; success locks moves and displays a
  Solved badge; Reset/scenario switch reshuffles. There is no score, completion
  callback or persistence.
- A shuffle can return the already-correct array, allowing immediate success
  without learner action. Incorrect feedback only says “Review the sequence and
  try again” and marks every row red; it does not locate the first mismatch or
  explain concurrency/safety.
- The immediate solution serializes concurrent roles and omits vessel control.
  The Williamson solution embeds the same universal 60° recipe as the theory.
  Memorising either exact array is not evidence of managing an emergency.
- Scenario selectors have only visual active styling. Up/down icon buttons have
  no accessible names, row/list order and selected/moved state have no semantic
  or live announcement, and focus/position feedback is not managed. Native
  buttons are keyboard operable but screen-reader users cannot identify which
  action each arrow performs without surrounding inference.
- Rows combine long text, number badge and two 32px controls in one unwrapping
  flex layout. Narrow, high-zoom, touch-target and reflow behavior is untested.

[#341](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/341)
owns outcome/role modelling, feedback, semantics and interaction coverage.

## Completion, persistence and edge states

- A mount effect immediately calls `saveProgress(safety-mob, true, 100, 10)`.
  It does not await or interpret the Boolean result, catch rejection, distinguish
  anonymous/offline behavior or present saving/saved/failed/retry state.
- React Strict Mode/remounts/auth-hook identity changes can rerun the effect;
  idempotency is delegated invisibly to lower layers. No page-level evidence or
  duplicate-reward guard exists.
- Existing completion is not loaded. The page never displays completion, and
  drill order/state disappears on tab switch/remount/navigation.
- Empty game data would make `every(...)` true and allow false success, though
  production arrays are non-empty. Randomness is unseeded and there are no
  checked-in page/game tests for shuffle, movement, exact matching or edge
  states.

[#342](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/342)
owns evidence-based, recoverable completion plus header/tab accessibility.

## Follow-up ownership

1. [#335 — Correct unsafe and misleading Man Overboard Quiz guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/335) — existing; shared approach, Williamson, medical and DSC/MAYDAY wording in quiz/theory
2. [#336 — Align the Man Overboard Quiz with complete, applied recovery outcomes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/336) — existing; quiz coverage/count/prerequisite/remediation
3. [#340 — Complete and safety-review Man Overboard theory and recovery guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/340) — new; authoritative theory/outcome content for roles, recovery and prevention; game path is alignment-only
4. [#341 — Redesign the MOB ordering game around concurrent roles and usable feedback](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/341) — new; sole owner of drill representation, interaction, feedback and accessibility, consuming #340's reviewed model
5. [#342 — Stop auto-completing Man Overboard theory on page load](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/342) — new; evidence, persistence and page-shell accessibility

## Authoritative sources

All sources were accessed 2026-08-01.

[^rya]: Royal Yachting Association, [Man Overboard](https://www.rya.org.uk/water-safety/cold-water-shock-safety/man-overboard/), alarm, spotter/markers, plotter mark, vessel control, distress, approach, propeller and recovery methods.
[^vhf]: Maritime and Coastguard Agency, [GMDSS VHF DSC procedures for small boat users](https://www.gov.uk/government/publications/gmdss-sea-areas-and-procedures-for-small-boat-users/gmdss-vhf-dsc-procedures-for-small-boat-users), updated 24 July 2024, distress alert/call/message order and required information.
[^recovery]: Maritime and Coastguard Agency, [MGN 544 Amendment 1 Annex 1](https://www.gov.uk/government/publications/mgn-544-amendment-1-mf-means-of-recovery-of-persons-from-the-water-by-ships-and-boats-plans-procedures-and-acceptance-of-recovery-equipment/mgn-544-amendment-1-annex-1), near-horizontal and propeller-clear recovery.
[^drills]: Maritime and Coastguard Agency, [MGN 570 Amendment No. 1 (F)](https://www.gov.uk/government/publications/mgn-570-amendment-no-1-f-fishing-vessels-emergency-drills/mgn-570-amendment-no-1-f-fishing-vessels-emergency-drills), generic MOB actions, communications, recovery preparation and drill expectations.
