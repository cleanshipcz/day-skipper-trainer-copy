# Fire Safety learner-facing audit

- Audit issue: [#129](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/129)
- Route/topic: `/safety/fire` / `safety-fire`
- Audited: 2026-08-01
- Theory page: `src/pages/FireSafetyTheory.tsx`
- Drill: `src/components/safety/FireExtinguisherDrill.tsx`
- Content model: `src/data/fireExtinguishers.ts`
- Registry/navigation: `src/pages/SafetyMenu.tsx`,
  `src/constants/topicRegistry.ts`

## Verdict

**The page is reachable and its six-scenario drill works mechanically, but its
classification, equipment and emergency-response guidance is not safe enough
to teach as authoritative marine firefighting procedure.** The content omits
Class F while placing cooking oil in Class B, models a fire blanket as a
red-coded A/B/electrical extinguisher, overgeneralises powder/foam/CO2
suitability and calls CO2 uniquely best for an unspecified diesel engine-space
fire. The engine procedure delays MAYDAY and omits essential alarm, muster,
lifejacket, escape, smoke-entry, installed-system and re-ignition controls.

The drill shuffles and scores six stable scenarios, prevents double submission
within a question, gives visible feedback and can restart. It tests only one
extinguisher label per scenario, however, so it reinforces the unsafe absolutes
rather than an escape-first decision process. Both theory and drill completion
are fire-and-forget writes: any learner can claim 100% theory completion, even a
0/6 drill is persisted as completed with points, failures are invisible, and
neither state is restored. There are no component tests for the page or drill.

## Evidence and audit bounds

The complete page, data model, drill state machine, route/menu registry,
progress hook contract and related quiz link were inspected. Content was
compared with current RYA boat-fire guidance, the UK Government/Boat Safety
Scheme fire-safety-on-boats guide, UK fire-class guidance and Boat Safety
Scheme equipment placement/rating requirements.[^rya][^govboat][^classes]
[^bss]

Typecheck, lint, production build, data/type tests and the internal-artifact
guard were run. No live authenticated or offline persistence round-trip,
physical extinguisher/drill, competent fire-risk assessment, screen-reader,
forced-colours, 200% zoom, actual touch device or fresh automated browser
viewport run was performed. Responsive observations are therefore source-based.

## Reachability, structure and visuals

- `/safety` exposes **Fire Safety** and routes to `/safety/fire`; both the
  header Back control and final **Back to Safety Menu** return correctly.
- The Drill tab links to registered `/quiz/safety-fire-quiz`. The separate quiz
  is queued for audit under [#131](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/131).
- Five keyboard-operable Radix tabs expose fire triangle, classes,
  extinguishers, prevention/procedure and drill. The completion action remains
  visible below every tab, so the learner need not visit any content.
- The page has no extinguisher photographs, approval/rating labels, engine-space
  plan, fire-triangle diagram, escape-plan visual or discharge-port diagram.
  Lucide icons and textual coloured badges are decorative cues, not sufficient
  equipment-identification training. Colour names are displayed as text, which
  avoids colour-only identification but still teaches medium label colours
  without showing the red extinguisher body or actual rating/approval marks.
- The mobile tab grid becomes two columns and content grids collapse to one;
  drill options become one column below `sm`. Long type/colour headers use an
  unwrapping `justify-between` row and have no checked-in 320/375 px or zoom
  regression. No horizontal-scroll or overflow fallback is declared.

## Fire classes and extinguisher suitability

- The type model contains only A, B, C and “Electrical.” Current UK
  classification includes D and F; electrical equipment is a hazard context,
  not an official class. Cooking oil is incorrectly included in Class B while
  the galley scenario is therefore recorded as B rather than F.[^classes]
- Generic dry powder is presented as A/B/C/electrical and working on “almost
  all” fires. RYA guidance distinguishes ABC, BC and specialist D powders and
  warns that powder effectiveness depends on the actual type. Dense powder can
  reduce visibility and impair breathing, an escape-critical cabin risk.
- Foam is universally A/B and categorically not electrical, although RYA says
  Class B suitability varies by manufacturer. Learners are never taught to
  read the marked rating, approval, instructions, size or service state.
- CO2 is described as “ideal for engine rooms” and uniquely correct for an
  unspecified engine-space diesel fire. RYA describes it as most effective on
  small B fires and warns of cold injury, confined-space asphyxiation, rapid
  open-space dispersal and lack of cooling. Engine-bay protection depends on
  volume, rating, installed/portable system and manufacturer advice.[^rya]
- A fire blanket is given a “Red” extinguisher colour code and broad
  A/B/electrical suitability. It should be presented as separate equipment for
  a small contained cooking-oil fire with safe-use/escape limits, not as a
  universal extinguisher. “Simple to use with no training required” conflicts
  with guidance to be familiar/confident and avoid personal danger.[^govboat]
- Water/water-mist and wet-chemical media are absent, so the claimed four types
  are neither a complete equipment reference nor a transparent yacht-specific
  selection. Equipment quantity, combined rating and location are also absent.

Correction is tracked by
[#337](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/337).

## Prevention and emergency procedure

The cards contain useful basics: unattended cooking, gas shutoff/leak checks,
overboard-draining locker, wiring/fuses, refuelling controls and petrol-engine
blower use. Important operational coverage is missing:

- smoke/heat/CO alarms; extinguisher/blanket inspection, expiry/service,
  approval and rating; equipment near exits/risk points; escape routes and
  drills; crew briefing; heaters, batteries/charging and shore power;
- raising the alarm, accounting for crew, lifejackets, handheld VHF, moving to
  an escape position and never entering smoke;
- early Coastguard/MAYDAY action offshore versus evacuation and 999 alongside/
  inland; the page instead waits until the fire is not controlled “quickly”;
- vessel-specific remote engine/fuel/battery/ventilation shutdowns, fixed-system
  controls, correct discharge port/system sizing, boundary monitoring/cooling,
  re-ignition and criteria for not reopening the compartment.

Closing the compartment, stopping the engine/fuel and avoiding the main hatch
are directionally useful, but “Use CO2 or dry powder — never water” ignores the
installed system, fire rating, compartment volume and manufacturer/vessel fire
plan. Current government guidance prioritises evacuation/crew safety, early
calling for help and fighting only when confident without jeopardising escape.
[#338](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/338)
owns complete, escape-first procedure and prevention.

## Drill behavior and assessment quality

- Six scenarios and four options are shuffled; every scenario appears once.
  Check Answer is disabled until selection, one submission increments totals
  once, options lock, correct and selected-wrong states use icon/text/colour,
  explanation appears, and Next advances. Completion reports the correct/total
  score; Restart resets and reshuffles.
- All scenarios require one supposedly best medium. They never assess whether
  to alarm, evacuate, call, isolate fuel/power/ventilation, preserve escape or
  decline firefighting. The engine, mattress and gas cases omit information
  needed to declare one safe action.
- Incorrect feedback always reveals the answer. Restart repeats the same six,
  enabling memorised completion; there is no pass threshold or remediation.
- Reaching the end calls `onComplete` once per run, but the parent marks
  `safety-fire-drill` completed and sends 10 points regardless of score. A 0/6
  run is therefore “completed.” Restart permits repeated completion writes.
- No checked-in test mentions `FireSafetyTheory`, `FireExtinguisherDrill` or the
  fire data. Shuffle mapping, score, reset, one-shot callback, zero score,
  persistence and accessibility are unprotected.

## Completion and persistence

- **Mark as Complete** is immediately available with no reading/drill evidence.
  It calls `saveProgress(safety-fire, true, 100, 10)` without awaiting the
  Boolean/promise and immediately sets local Completed.
- Drill completion similarly ignores the return/rejection from
  `saveProgress(safety-fire-drill, true, score, 10)`. Neither path shows
  saving/saved/queued/failed state, catches rejection or offers retry.
- Existing progress is never loaded. Both completed displays reset on remount;
  anonymous use and auth-owner changes are not distinguished. Rapid/repeated
  attempts have no local idempotency or duplicate-award contract.
- The registered parent/submodule IDs are coherent, but the evidence and
  persistence semantics are not. [#339](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/339)
  owns durable, evidence-based completion.

## Accessibility, input and edge states

- Radix tabs and native buttons support keyboard activation. Header Back has an
  accessible name, and feedback includes text/icons rather than colour alone.
- Drill options visually behave as a single-choice group but have no
  radio-group/radio or `aria-pressed` selected state. A screen reader cannot
  reliably query which extinguisher is selected before submission.
- Score/question, correctness, explanation and completion are not in a live
  region; focus remains on a replaced Next control after question/completion
  transitions rather than moving to the new scenario/result heading.
- Reset has no confirmation and discards an in-progress run. Tab switches and
  navigation also discard drill state without warning; no partial state is
  persisted. Empty scenario data would render a 0/0 completion and calculate
  `NaN` in the parent, though production data is non-empty.
- Save false/rejection, offline queueing and auth changes are invisible. There
  is no loading/failure edge state because the page never attempts to restore
  completion.

Accessibility, persistence and assessment remediation are tracked together in
[#339](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/339).

## Follow-up ownership

1. [#337 — Correct Fire Safety classifications and extinguisher suitability guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/337)
2. [#338 — Teach a complete, escape-first onboard fire procedure](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/338)
3. [#339 — Make Fire Safety drill and completion durable, evidence-based, and accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/339)
4. [#131 — Audit functionality and content quality: Fire Safety Quiz](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/131) — existing queued adjacent audit; it does not own this theory/drill remediation

## Authoritative sources

All sources were accessed 2026-08-01.

[^rya]: Royal Yachting Association, [Fire Safety on Boats](https://www.rya.org.uk/water-safety/boat-safety-and-maintenance/fire-safety-on-boats/), extinguisher media, ratings, placement, maintenance, cooking-oil/fire-blanket, engine-bay and medium-specific limitations.
[^govboat]: UK Government/Boat Safety Scheme, [Fire safety on boats](https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version), escape-first response, offshore/alongside calls, smoke, engine-hatch, extinguisher confidence/inspection/approval and powder-cloud warnings.
[^classes]: UK Government, [Fire safety risk assessment: offices and shops](https://www.gov.uk/government/publications/fire-safety-risk-assessment-offices-and-shops/fire-safety-risk-assessment-offices-and-shops-accessible), UK fire classes A/B/C/D/F and Class F cooking oils; supplemented by [small-premises guidance](https://www.gov.uk/government/publications/making-your-small-non-domestic-premises-safe-from-fire/a-guide-to-making-your-small-non-domestic-premises-safe-from-fire-accesible) on Class F equipment and trained first-aid firefighting.
[^bss]: Boat Safety Scheme, [number of fire extinguishers](https://www.boatsafetyscheme.org/requirements-examinations-and-certification/non-private-boat-standards/part-6-fire-prevention-extinguishing-equipment/number-of-fire-extinguishers/) and [equipment location](https://www.boatsafetyscheme.org/requirements-examinations-certification/non-private-boat-standards/part-6-fire-prevention-extinguishing-equipment/location-of-fire-fighting-equipment/), minimum ratings/combined ratings and accessible placement near main risks without fully opening an engine hatch.
