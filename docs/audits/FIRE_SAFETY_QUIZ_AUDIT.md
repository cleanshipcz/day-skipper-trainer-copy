# Fire Safety Quiz learner-facing audit

- Audit issue: [#131](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/131)
- Route/topic: `/quiz/safety-fire-quiz` / `safety-fire-quiz`
- Audited: 2026-08-01
- Quiz shell: `src/pages/Quiz.tsx`, `src/features/quiz/`
- Question bank: `src/data/quizzes/safetyFire.ts`
- Registry/parent: `src/data/quizzes/index.ts`,
  `src/pages/FireSafetyTheory.tsx`
- Parent audit: `docs/audits/FIRE_SAFETY_AUDIT.md`

## Verdict

**The eight-item quiz is reachable and mechanically completable, but it repeats
unsafe parent content and does not assess the prevention or escape-first
procedure promised by its subtitle.** Six items are isolated triangle/class/
medium recall. Two concern a compressed engine-space procedure. There is no
question about alarm, muster, escape, distress, smoke, isolation, installed
systems/ratings, re-ignition, inspection, detection, drills or deciding not to
fight.

`fire4` calls CO2 uniquely most suitable for an unspecified engine-room fire;
`fire5` calls stopping the engine the universal first action; `fire6` wrongly
includes cooking oil in Class B; and `fire3` calls a blanket the best first
response without alarm, heat isolation, escape or safe-use context. Issues #337
and #338 already own those source safety models. New #343 owns only the quiz
coverage, applied assessment, explanations and mastery/remediation design that
must consume their reviewed corrections.

The shared shell shuffles questions/options and remaps answers correctly, but
its live Score reveals correctness before Submit; submitted answers can later
be revisited and edited; in-progress saves can fail invisibly; shuffled array
indices are not durable identities; and anonymous reload loses the attempt.
Existing focused shared issues own those behaviors.

## Evidence and audit bounds

The complete production bank, catalogue/parent route, quiz shell, scoring,
randomisation, session/attempt persistence and related automated tests were
inspected. Safety content was compared with current RYA boat-fire guidance, the
UK Government/Boat Safety Scheme fire-safety guide and current UK fire-class
guidance.[^rya][^govboat][^classes]

Typecheck, lint, production build, focused catalogue/data/helper tests and the
internal-artifact guard were run. No authenticated Supabase or offline
round-trip, physical fire drill/equipment test, competent fire-risk assessment,
screen-reader, forced-colours, 200% zoom, actual touch device or fresh browser
viewport run was performed. Responsive observations are source-based and rely
on the already audited shared shell.

## Reachability and catalogue integrity

- `/safety/fire` exposes **Take the Fire Safety Quiz** and routes to the intended
  topic. Direct navigation also works; theory/drill completion is not enforced.
- The catalogue maps `safety-fire-quiz` to the correct title/subtitle and lazy
  bank. The bank has eight unique IDs (`fire1`–`fire8`), four non-empty options,
  in-range keyed answers and non-empty explanations.
- Runtime question/option shuffling preserves each keyed answer. Data tests lock
  the bank length at eight and include the first five IDs, but no test asserts
  fire-safety outcome coverage or content accuracy.
- Parent completion is itself invalid: merely opening `/safety/fire` can be
  marked complete independently of quiz/drill evidence. #339 owns the parent's
  evidence/persistence path; #343 owns quiz prerequisite/remediation alignment.

## Fire and extinguisher accuracy

- `fire1` correctly recalls the basic heat/fuel/oxygen fire triangle. Its
  explanation is introductory rather than operational; it does not teach
  containment/re-ignition or that removing one component safely can be
  difficult on a vessel.
- `fire2` correctly identifies the blue label band for dry powder, but label
  colour alone does not establish ABC/BC/D powder, capacity, fire rating,
  approval, serviceability or suitability. A learner must read the actual
  marked canister and instructions.[^rya]
- `fire3` correctly rejects water on burning cooking oil, and a blanket can be
  appropriate for a small contained Class F pan fire. Calling it the “BEST
  first response” omits raising the alarm, turning off heat if safe, preserving
  escape, not moving the pan, being familiar/confident with the blanket and
  evacuating/calling if unsafe. The scenario records no Class F concept.
- `fire4` lacks engine-space size, fuel, installed/portable system, rating,
  detection, shutdown, discharge port and crew location, yet declares CO2
  uniquely best because it leaves no residue. RYA warns about asphyxiation,
  cold injury, rapid dispersal and lack of cooling; engine-bay systems must be
  sized/advised for the space.[^rya]
- `fire6` says Class B includes “cooking oil.” Current UK classification places
  cooking oils/fats in Class F. Petrol/diesel/paraffin remain Class B.[^classes]
- `fire8` calls electronic damage/cleanup the main powder disadvantage. On a
  yacht, dense powder can impair breathing and visibility/escape, wind reduces
  effectiveness, and lack of cooling permits re-ignition. “Main” is therefore
  context-dependent and the explanation omits the most immediate life risks.

[#337](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/337)
is authoritative for class/medium/rating/equipment corrections. #343 must
consume, not duplicate, that model in quiz scenarios.

## Emergency procedure and prevention coverage

- `fire5` asks for the first engine-room action but omits raising the alarm,
  crew/muster/lifejackets/escape and distress communication from its options.
  Stopping the engine may be an important remote isolation action, not a
  universally safe first action for the person discovering fire.
- `fire7` correctly warns that opening the main engine hatch admits oxygen and
  may cause flare-up. It does not test using an appropriate discharge port,
  installed system, remote shutdowns or avoiding smoke/compartment entry.
- No item assesses early MAYDAY/Coastguard action offshore, evacuation/999
  alongside, handheld VHF, accounting for crew, fuel/battery/gas/ventilation
  isolation, fixed-system operation, monitoring/boundary cooling, re-ignition
  or no-reopen criteria.
- Despite “prevention” in the subtitle, no question addresses detection/alarms,
  extinguisher/blanket inspection/service/approval/rating/location, escape
  routes and drills, unattended cooking, gas locker/leaks, refuelling, wiring/
  fuses, heaters, batteries/charging or shore power.
- The bank never asks the primary safety decision: whether firefighting can be
  attempted without jeopardising escape. Government guidance prioritises
  alarm/evacuation and fighting only when confident and safe.[^govboat]

[#338](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/338)
is authoritative for alarm/escape/isolation/procedure. #343 owns traceable quiz
coverage and applied use of that corrected sequence.

## Explanations and assessment quality

- Every answer receives one concise explanation after Submit. Most restate the
  keyed fact; none cites/review-dates a source, identifies equipment rating,
  states scenario limitations, explains why each unsafe distractor fails or
  links to the exact parent tab.
- All eight items are text recognition. There is no applied multi-step decision,
  equipment-label visual, engine-space plan, smoke/escape scenario or changing
  condition. Four wrong alternatives often make the keyed answer obvious.
- Three items (`fire2`, `fire4`, `fire8`) focus on extinguisher medium/label and
  two (`fire5`, `fire7`) focus on engine space. This overweighting leaves no
  defensible sample of the subtitle's full outcomes.
- A 70% threshold means six of eight produces 75% and “You've mastered this
  topic!” A learner can miss two safety-critical questions and never be asked
  any prevention/escape question. Failed remediation says only to review the
  material and Home returns to global `/`, not `/safety/fire`.

[#343](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/343)
owns outcome mapping, scenario/explanation quality and assessment language.

## Scoring, submission and retry

- `countCorrectAnswers` compares answers with the shuffled bank;
  `quizCompletionOutcome` rounds percentage and passes at 70%. Client scoring
  intentionally grants zero trusted profile points.
- The Score badge includes tentative selection before Submit. Cycling options
  reveals the correct answer; [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns the answer oracle.
- Submit requires a choice and transiently locks the current view. Next clears
  explanation/lock; Previous from a later unsubmitted question clears it again,
  so submitted answers can be revisited and changed. #157's atomic assessed
  answer/navigation contract owns this shared validity path.
- Retry clears answers, advances the seed and starts a new authenticated
  attempt. Completion retry is blocked after score save until final progress
  succeeds, reducing duplicate score submissions. Failed review seeding has a
  separate alert/retry.

## Persistence and edge states

- Authenticated partial state uses canonical `quiz-safety-fire-quiz`.
  Selection/navigation updates UI then awaits `saveProgress`, but ignores a
  resolved `false`; rejection escapes without status/retry. Concurrent writes
  have no ordering contract. [#313](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)
  owns this.
- Sessions persist shuffled positions/option indices, not stable question and
  answer identities or a seed. Catalogue/shuffle changes can reinterpret them;
  any finite malformed option index survives parsing. [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns this.
- Anonymous progress exists only in component memory and vanishes on reload;
  [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns the policy.
- Attempt start failure is silent and completion retry does not restart the RPC;
  [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)
  owns recovery.
- Unknown/empty/rejected catalogue states are explicit; failed imports can be
  retried. Their fallback actions go to global Home and unrelated Nautical
  Terms. [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns topic-aware navigation.

## Accessibility, viewport and input

- Native answer/action buttons support pointer and keyboard. Submitted feedback
  uses icon/text as well as colour. The bank has no images or audio.
- Back lacks an accessible name; selection has no radio/pressed state; Progress
  lacks a useful label; score/question/feedback/completion changes are not
  deliberately announced; focus is not moved after Next/results. [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  owns these shared defects.
- Text-only questions avoid media-alt defects. Shared sticky header/card layout,
  hover scaling and long copy still lack checked-in 320/375 px, 200% zoom,
  reduced-motion, forced-colours and touch regression. No fresh browser claim
  is made here.

## Follow-up ownership

1. [#337 — Correct Fire Safety classifications and extinguisher suitability guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/337) — existing authoritative equipment/class model
2. [#338 — Teach a complete, escape-first onboard fire procedure](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/338) — existing authoritative procedure model
3. [#339 — Make Fire Safety drill and completion durable, evidence-based, and accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/339) — existing parent/drill completion; not quiz-shell ownership
4. [#343 — Align the Fire Safety Quiz with corrected, applied emergency outcomes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/343) — new quiz-specific coverage/assessment/remediation
5. Shared shell: [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154), [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155), [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156), [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157), [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194), [#209](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209), [#313](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/313)

## Authoritative sources

All sources were accessed 2026-08-01.

[^rya]: Royal Yachting Association, [Fire Safety on Boats](https://www.rya.org.uk/water-safety/boat-safety-and-maintenance/fire-safety-on-boats/), extinguisher types/ratings, placement, cooking-oil/blanket, engine-bay protection and medium limitations.
[^govboat]: UK Government/Boat Safety Scheme, [Fire safety on boats](https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version), escape-first response, smoke/engine-hatch warnings, offshore/alongside calls, equipment confidence/inspection/approval and powder-cloud risk.
[^classes]: UK Government, [Fire safety risk assessment: offices and shops](https://www.gov.uk/government/publications/fire-safety-risk-assessment-offices-and-shops/fire-safety-risk-assessment-offices-and-shops-accessible), fire classes A/B/C/D/F and Class F cooking oils.
