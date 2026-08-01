# Life Raft & Abandon Ship Quiz learner-facing audit

- Audit issue: [#133](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/133)
- Route/topic: `/quiz/safety-life-raft-quiz` / `safety-life-raft-quiz`
- Audited: 2026-08-01
- Quiz shell: `src/pages/Quiz.tsx`, `src/features/quiz/`
- Question bank: `src/data/quizzes/safetyLifeRaft.ts`
- Registry/parent: `src/data/quizzes/index.ts`,
  `src/pages/LifeRaftTheory.tsx`
- Parent audit: `docs/audits/LIFE_RAFT_ABANDON_SHIP_AUDIT.md`

## Verdict

**The ten-item quiz is reachable and mechanically completes, but it is almost
entirely a test of unsafe, unqualified absolutes inherited from the parent.** It
equates “offshore” with one SOLAS B pack, treats leeward launch and strongest-
first boarding as universal, cuts the painter merely when everyone is aboard,
and mandates no food or water for 24 hours. It omits certification, stowage/
float-free arrangements, service, pack scope, failed/inverted inflation,
casualty accounting, beacons/radio, exposure, repair and conditional decisions
to stay attached or clear.

Issue #344 is authoritative for the underlying equipment/procedure/survival
model. New #347 solely owns quiz coverage, applied scenarios, explanations,
remediation and mastery claims while consuming #344. The shared shell also
reveals correctness before Submit, permits later editing of submitted answers,
can lose in-progress writes silently, persists unstable shuffled indices and
loses anonymous attempts on reload; existing shared issues own those defects.

## Evidence and audit bounds

The complete production bank, catalogue and parent link, shared quiz shell,
scoring, shuffle/session/attempt persistence and related tests were inspected.
Safety claims were compared with current MCA non-SOLAS standards, small-vessel
Code examples and survival-craft training criteria.[^mgn553][^code][^pscrb]

Typecheck, lint, production build, focused catalogue/data/helper tests and the
internal-artifact guard were run. No authenticated/offline persistence round-
trip, raft/canister/pack trial, physical abandonment exercise, screen-reader,
forced-colours, 200% zoom, touch hardware, fresh browser viewport run or
qualified survival-craft review was performed. Responsive findings are
source-based and rely on the already audited shared shell.

## Reachability and catalogue integrity

- `/safety/life-raft` exposes **Take the Life Raft Quiz** and routes correctly.
  Direct navigation works; no theory/drill prerequisite is enforced.
- `safety-life-raft-quiz` maps to the intended title/subtitle and lazy bank. Ten
  stable unique IDs (`raft1`–`raft10`) each have four non-empty options, an
  in-range keyed answer and explanation. Runtime shuffling remaps correctly.
- Tests lock bank length at ten and basic catalogue validity, but do not assert
  life-raft outcomes, standards, safety wording or explanation quality.
- The parent can itself be marked complete with a click and ignores persistence
  failure; [#346](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/346)
  owns that page path, not this quiz.

## Equipment, standards and pack accuracy

- `raft3` asks which “type” includes a full SOLAS B pack and keys “Offshore life
  raft.” Actual selection depends on SOLAS/non-SOLAS/ISO 9650 certification,
  type/group, vessel category, distance from safe haven, temperature, capacity,
  boarding ramp, pack and stowage. “Offshore” alone does not prove one pack.
- The `raft3` explanation names flares, water and first aid without defining
  quantities, pack marking, integral versus grab-bag equipment, raft capacity or
  differences between A/B/E/other packs.
- `raft10` presents open-reversible as a generic alternative whose advantage is
  avoiding righting. Open reversible rafts are accepted only in defined
  approved operations/standards and trade canopy/insulation/weather protection;
  suitability cannot be inferred from this one feature.[^code]
- No item asks learners to identify certification/approval markings, capacity,
  ISO type/group, temperature limits, container/valise, access, painter, HRU,
  float-free installation or applicable service instructions/approved station.
- `raft9` keys repair kit for a puncture; its explanation appropriately adds
  bellows after patching. The stem's “maintain buoyancy” is still incomplete:
  locating/isolating damage, patch instructions and restoring/monitoring tube
  pressure are a combined procedure, not one object recognition fact.

[#344](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/344)
owns corrections to standards, packs and equipment. #347 must consume them.

## Abandonment and deployment accuracy

- `raft1` turns “step up into the raft” into a literal requirement that the
  vessel be sinking beneath the crew. Remaining aboard is normally preferable,
  but uncontrollable fire, breakup or another immediate hazard can require an
  earlier skipper-ordered abandonment coordinated with rescuers.
- `raft4` correctly prioritises preventing an unsecured throw-over raft from
  drifting away, but calls painter attachment the universal first action. Raft
  stowage, lashings, HRU/float-free arrangement, fire/damage, manufacturer
  instructions and concurrent crew preparation affect the sequence. It does not
  teach paying out the painter fully or failed/inverted inflation.
- `raft7` universally keys leeward launch. Leeward shelter can help, but fire/
  smoke, vessel damage, obstruction, drift, sea state and rescue plan determine
  the safe side. A correct applied question needs those conditions.
- `raft8` says cut the painter “only when everyone is safely aboard.” The safety
  decision is whether remaining attached risks being dragged down, burned,
  fouled or struck versus retaining the larger stable/visible platform and
  rescue connection. Headcount is necessary but not sufficient.
- No question tests skipper order, alarm/MAYDAY, lifejackets/warm clothing,
  time-safe grab-bag/EPIRB/SART/VHF collection, direct dry boarding, water entry,
  raft righting, occupant counting, casualties or recovery of people/supplies.

The source procedure is owned by #344; applied quiz ownership is #347.

## Boarding and survival accuracy

- `raft5` universally says the strongest person boards first. A capable person
  aboard to assist may be useful, but direct dry transfer, injury/weakness,
  ladder/ramp, raft position, sea state and trained crew determine safe order.
- `raft2` broadly identifies drogue function, but claims it holds the raft
  “bow-to-waves” although raft shape/attachment and instructions vary. Slower
  drift may help remain nearer the datum, but the explanation should not promise
  orientation/location beyond equipment design and conditions.
- `raft6` mandates no food or water for 24 hours and justifies this because “the
  body can manage.” It gives no exception for dehydration, injury, illness,
  medication, heat, sea state, rescue estimate or approved survival manual.
  “Never drink seawater” is sound; blanket withholding is not safe personalized
  guidance without the missing context.
- No item covers canopy/insulation/thermal aids, bailing/drying, first aid,
  seasickness, repair/inflation, EPIRB/SART/VHF operation, lookout/watch, flare/
  signal discipline, water collection, morale or following the raft's survival
  instructions.

These source outcomes remain #344; quiz coverage/remediation is #347.

## Explanations and assessment quality

- All ten questions are single-fact text recognition. There is no equipment-
  label visual, pack comparison, launch/inversion/boarding diagram, hazard-
  dependent sequence or survival decision scenario.
- Explanations mostly restate the intended answer and often intensify its
  certainty. They do not cite source/review date, name applicable certification/
  manufacturer instructions, correct each unsafe distractor or link to the
  relevant parent tab.
- Seven correct out of ten is exactly 70% and receives “You've mastered this
  topic!” A learner can miss three life-critical items and never face numerous
  omitted outcomes. Failure only says review material; Home returns to global
  `/`, not `/safety/life-raft`.
- The live Score lets learners discover each answer before submitting, further
  invalidating pass/mastery evidence.

[#347](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/347)
owns traceable coverage, scenario/explanation design and honest result language.

## Scoring, submission and retry

- `countCorrectAnswers` uses shuffled remapped answers; percentage is rounded
  and pass threshold is 70%. Client scoring intentionally grants zero trusted
  profile points.
- Tentative choices immediately affect Score. Cycling options exposes the keyed
  answer; [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns this shared oracle.
- Submit requires a choice and locks only the current rendered view. Next clears
  the lock; Previous from a later unsubmitted question permits revisiting and
  editing an earlier submitted answer. #157's atomic assessed-answer contract
  owns the shared validity behavior.
- Retry clears answers, increments shuffle seed and starts another authenticated
  attempt. A partially saved completion retains workflow state; restart is
  disabled after score save until final progress succeeds. Review-sync failure
  has its own alert/retry.

## Persistence and edge states

- Authenticated partial state uses canonical `quiz-safety-life-raft-quiz`.
  Selection/navigation first updates UI, then awaits `saveProgress`, ignores
  resolved `false`, and lets rejection escape without status/retry. Concurrent
  writes have no explicit ordering. [#313](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)
  owns this.
- Sessions store shuffled positions and option indices, not stable question/
  option identity or seed. Catalogue changes can reinterpret answers; malformed
  finite indices survive parsing. [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns this.
- Anonymous state vanishes on reload; [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns the policy. Attempt-start failure is silent/non-retryable at completion;
  [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
  owns it.
- Unknown/empty/rejected catalogues render an unavailable card and import errors
  can retry. Home and unrelated Nautical Terms fallbacks are not topic-aware;
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns navigation.

## Accessibility, viewport and input

- Answers/actions are native buttons and keyboard operable; submitted feedback
  combines icon/text/colour. The bank has no images/audio.
- Back lacks an accessible name; selection lacks radio/pressed semantics;
  Progress lacks a useful label; score/question/feedback/completion updates are
  not deliberately announced or focused. [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  owns these shared gaps.
- The sticky header, badge, long emergency copy and hover scaling have no
  checked-in 320/375 px, 200% zoom, touch, forced-colours or reduced-motion
  regression. No fresh browser behavior is claimed in this audit.

## Follow-up ownership

1. [#344 — Correct and complete Life Raft equipment and survival guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/344) — authoritative equipment/procedure/survival model
2. [#345 — Redesign the Abandon Ship game beyond brittle exact ordering](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/345) — game only; no quiz ownership
3. [#346 — Make Life Raft theory completion durable and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/346) — parent completion only
4. [#347 — Align the Life Raft Quiz with reviewed equipment and survival outcomes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/347) — new quiz coverage/assessment/remediation consuming #344
5. Shared shell: [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154), [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155), [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156), [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157), [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194), [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209), [#313](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)

## Authoritative sources

All sources were accessed 2026-08-01.

[^mgn553]: Maritime and Coastguard Agency, [MGN 553 Amendment 1 (M+F)](https://www.gov.uk/government/publications/mgn-553-amendment-1mf-inflatable-non-solas-liferafts-and-life-saving-appliances/mgn-553-amendment-1mf-inflatable-non-solas-liferafts-and-life-saving-appliances), published 22 April 2024, non-SOLAS/ISO 9650 standards and servicing.
[^code]: Maritime and Coastguard Agency, [Code of Practice for the Safety of Small Fishing Vessels under 15 m](https://www.gov.uk/government/publications/the-code-of-practice-for-the-safety-of-small-fishing-vessels-of-less-than-15m-length-overall/the-code-of-practice-for-the-safety-of-small-fishing-vessels-of-less-than-15m-length-overall), section 7.4 examples of distance/temperature/standard/pack/stowage/capacity requirements.
[^pscrb]: Maritime and Coastguard Agency, [Proficiency in Survival Craft and Rescue Boats — Restricted Course](https://www.gov.uk/government/publications/pscrb-restricted-guidelines/maritime-coastguard-agency-mca-proficiency-in-survival-craft-and-rescue-boats-other-than-fast-rescue-boats-pscrb-restricted-course), equipment/marking, abandonment actions and survival-craft training scope.
