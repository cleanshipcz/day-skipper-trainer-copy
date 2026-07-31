# Life Raft & Abandon Ship learner-facing audit

- Audit issue: [#132](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/132)
- Route/topic: `/safety/life-raft` / `safety-life-raft`
- Audited: 2026-08-01
- Theory: `src/pages/LifeRaftTheory.tsx`
- Ordering game: `src/components/safety/AbandonShipSortingGame.tsx`
- Content model: `src/data/lifeRaftProcedures.ts`
- Adjacent quiz audit: [#133](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/133)

## Verdict

**The page is reachable and structurally clear, but its raft categories, SOLAS
pack inventory and fixed abandonment/survival sequences are too inaccurate and
underqualified for emergency training.** “Coastal within 3 nm,” universal
annual service, automatic SOLAS B offshore pack/features and a single general
open-reversible category conflate certification, vessel coding, operating area,
temperature and manufacturer requirements. The displayed SOLAS B contents are
untraceable/incomplete and include quantities without defining scope.

The four ordering exercises mechanically shuffle and compare arrays, but
several “correct” orders are concurrent or condition-dependent. The game
therefore rewards memorising leeward launch, strongest-first boarding, cutting
free, paddling clear and withholding food/water for 24 hours as absolutes. Page
completion requires only one click, immediately displays Completed without
awaiting persistence, never restores state and ignores drill performance.

## Evidence and audit bounds

The complete page, data arrays, game state machine, route/parent registry,
progress call and quiz link were inspected. Claims were compared with current
MCA non-SOLAS/SOLAS liferaft standards, small-vessel Code requirements and MCA
survival-craft training criteria.[^mgn553][^code][^pscrb]

Typecheck, lint, production build, focused registry/data tests and the internal
artifact guard were run. No authenticated/offline persistence, physical raft
deployment/righting/boarding, canister/pack inspection, survival exercise,
screen-reader, forced-colours, 200% zoom, touch device, fresh browser viewport
run or qualified survival-craft review was performed. Responsive observations
are source-based.

## Reachability, navigation and visuals

- `/safety` exposes **Life Raft & Abandon Ship** and routes correctly. Header
  Back is named and both Back actions return to `/safety`.
- The Drill tab links to registered `/quiz/safety-life-raft-quiz`; direct access
  is possible and no theory/drill prerequisite exists. #133 owns the separate
  quiz audit, not this page's remediation.
- Five Radix tabs fit the declared five-column large grid and two-column mobile
  grid. Cards collapse to one column below `md`; long rows in the game retain a
  single flex line with number, text and two 32 px controls. No 320/375 px,
  200% zoom, touch, localized-copy or overflow regression is checked in.
- The page has no life-raft/canister label image, painter/HRU diagram, launch/
  inflation/righting/boarding illustration, pack photographs, grab-bag model or
  raft layout. Generic icons and text cards cannot teach equipment recognition
  or a physical procedure, and no accessible nonvisual procedural diagram is
  supplied.

## Raft type, certification and service accuracy

- “Coastal Life Raft” is defined as within 3 nm with no SOLAS B pack. “Offshore”
  always has full SOLAS B pack, double floor and heavy-weather construction.
  Those are not adequate purchasing/carrying categories: applicable standards
  distinguish SOLAS and non-SOLAS/ISO 9650 type/group, approval, vessel
  category, distance from safe haven, sea temperature, capacity, boarding ramp,
  pack, hard/valise stowage and float-free arrangement.[^code][^mgn553]
- Open reversible rafts are described as a leisure/racing third category usable
  whichever way up. MCA accepts them only in defined operations/standards; the
  small-fishing Code, for example, limits an approved open-reversible/E pack
  route to under three miles. A racing reference does not establish suitability
  for a learner's yacht.
- Every coastal/offshore raft says it “must be serviced annually.” SOLAS systems
  generally have 12-month requirements, while non-SOLAS servicing follows MGN
  553, the relevant instrument/manufacturer and approved service arrangements.
  Learners need to inspect certification/instructions, not infer from marketing
  category.[^mgn553]
- Capacity is reduced to “typically 4–8,” with no total-person/redundancy,
  access, stowage, painter/HRU or float-free selection teaching.

[#344](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/344)
owns authoritative equipment/type/selection correction.

## SOLAS pack and emergency equipment

- The page calls one 12-item list “the SOLAS B equipment pack” and “standard for
  offshore yacht life rafts.” It does not identify the applicable SOLAS/ISO/code
  instrument, raft capacity, pack marking, quantities, permitted grab-bag
  supplements or difference from SOLAS A and other packs.
- The list includes “Fresh Water (1.5 L per person)” and unspecified handheld/
  parachute flares but omits or under-specifies other equipment/instructions
  expected by the relevant certification. The MCA course criteria, for example,
  include rescue line/quoit, heliograph, survival instructions/signal table,
  rations, radio equipment and pyrotechnic types in a complete training set;
  actual pack requirements must be taken from the applicable standard.[^pscrb]
- EPIRB/SART appear later as universal grab-bag actions even though carriage,
  registration, stowage and activation depend on vessel/equipment. No handheld
  VHF, personal medication, documents, spare clothing/thermal protection or
  vessel-specific grab-bag planning is taught.
- Purposes are often useful, but there are no counts, markings, locations,
  inspection/service checks or practical instructions. “Paddles ... toward
  rescue” and flares “visible over long distances” omit conserve-use/search-
  confirmation and signal-selection constraints.

Pack correctness and traceability are owned by #344.

## Abandonment, deployment and boarding procedure

- “Step UP into the raft” is a valuable last-resort mnemonic, but “vessel should
  be sinking beneath you” is too literal. Uncontrollable fire, breakup and other
  immediate hazards can require leaving before that condition, under the
  skipper's order and rescue coordination.
- The abandon array starts MAYDAY, then lifejackets/warm clothing, grab bag,
  launch, board, cut and paddle clear. Alarm/order, crew protection, distress,
  equipment preparation and raft deployment can be concurrent and time/hazard
  dependent; gathering gear must never delay escape.
- Painter-before-launch is fundamental, but “launch leeward” is not universal:
  wind/sea, fire/smoke, damage, obstruction and rescue plan determine the safe
  side. Pulling the painter requires paying out its full length and following
  manufacturer instructions, which is omitted.
- The model omits canister/valise and hydrostatic-release differences, float-free
  action, failed inflation, inverted raft/righting, securing alongside, direct
  dry boarding, water entry, casualty transfer, counting people and recovery of
  survivors/supplies.
- “Strongest person first” may be a useful capable-helper tactic but is not a
  universal first boarder. Direct boarding, injured/weak crew, raft position,
  ladder/ramp and a trained capable person dictate order.
- Cutting the painter merely when everyone is aboard is unsafe if it loses a
  valuable stable/rescue platform or is premature; remaining attached versus
  cutting/clearing depends on sinking, fire, entanglement, drift and rescue.

These outcome/procedure corrections belong to #344.

## Actions in the raft and survival advice

- Drogue, canopy, bailing/drying, first aid/seasickness, lookout and signalling
  are relevant, but exact order varies with immediate hazards, inversion,
  injuries, damage, weather and rescue contact.
- “Paddle clear of the sinking vessel” conflicts with the page's own visibility
  principle unless sinking/fire/debris/entanglement presents a hazard. A raft
  may remain near/attached to the larger visible platform or coordinate with
  rescuers; the decision cannot be universal.
- “Ration water — no food or water for the first 24 hours” is presented without
  climate, rescue estimate, medical condition, injury, seasickness, supplies or
  official survival-instruction context. A blanket prohibition can harm an
  already dehydrated/ill casualty and should not replace the raft's approved
  survival manual and medical judgment.
- No action covers headcount, activating/monitoring EPIRB/SART/VHF, raft repair/
  inflation, thermal protective aids/huddling, seasickness tablets/bags, water
  collection, signal discipline, morale/watch rotation or following on-pack
  instructions.

Survival content is owned by #344 and requires qualified review.

## Ordering game and feedback

- Four scenario selectors shuffle 5–7 fixed steps. Arrow buttons reorder
  adjacent items, Check compares exact IDs, success locks moves/shows Solved and
  Reset/scenario switch reshuffles. No score, completion callback or persistence
  exists.
- Random shuffle can produce the correct array, allowing success without a
  learner move. Empty arrays would also pass `every(...)`, though production is
  non-empty.
- Incorrect feedback marks every row red and says only “Review the sequence.” It
  does not identify violated dependencies or explain conditional/concurrent
  actions. Exact matching rejects defensible alternatives and reinforces unsafe
  absolutes from the content model.
- Scenario active state is only visual. Arrow icon buttons have no accessible
  names; list/order/move state is not semantic/announced; focus is not managed
  after moves/check/reset. Native buttons provide basic keyboard activation but
  not an understandable screen-reader sorting experience.

[#345](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/345)
solely owns game representation/interaction, consuming #344's reviewed model.

## Completion, persistence and edge states

- Mark as Complete is always enabled. It sends
  `saveProgress(safety-life-raft, true, 100, 10)` without awaiting/interpreting
  the result, then immediately sets local Completed. No content/drill evidence
  is required.
- False/rejection/offline/anonymous outcomes have no status or retry. Existing
  completion is not loaded, the badge resets on remount/auth changes, and
  repeated actions/attempts have no page-level idempotency/reward contract.
- Drill state disappears on tab unmount/navigation and contributes no evidence.
  There are no checked-in page/game/data tests for these flows.
- Completion/feedback changes are not deliberately announced; only the header
  Back control is explicitly named.

[#346](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/346)
owns page-level evidence, persistence/recovery and completion accessibility.

## Follow-up ownership

1. [#344 — Correct and complete Life Raft equipment and survival guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/344) — authoritative equipment/procedure/survival model; game path alignment-only
2. [#345 — Redesign the Abandon Ship game beyond brittle exact ordering](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/345) — sole game representation/interaction owner; consumes #344
3. [#346 — Make Life Raft theory completion durable and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/346) — page completion/persistence/integration
4. [#133 — Audit functionality and content quality: Life Raft & Abandon Ship Quiz](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/133) — existing adjacent quiz audit only

## Authoritative sources

All sources were accessed 2026-08-01.

[^mgn553]: Maritime and Coastguard Agency, [MGN 553 Amendment 1 (M+F)](https://www.gov.uk/government/publications/mgn-553-amendment-1mf-inflatable-non-solas-liferafts-and-life-saving-appliances/mgn-553-amendment-1mf-inflatable-non-solas-liferafts-and-life-saving-appliances), published 22 April 2024, non-SOLAS/ISO 9650 standards and servicing.
[^code]: Maritime and Coastguard Agency, [Code of Practice for the Safety of Small Fishing Vessels under 15 m](https://www.gov.uk/government/publications/the-code-of-practice-for-the-safety-of-small-fishing-vessels-of-less-than-15m-length-overall/the-code-of-practice-for-the-safety-of-small-fishing-vessels-of-less-than-15m-length-overall), section 7.4, explicit examples of distance/temperature/standard/pack/stowage/capacity requirements.
[^pscrb]: Maritime and Coastguard Agency, [Proficiency in Survival Craft and Rescue Boats — Restricted Course](https://www.gov.uk/government/publications/pscrb-restricted-guidelines/maritime-coastguard-agency-mca-proficiency-in-survival-craft-and-rescue-boats-other-than-fast-rescue-boats-pscrb-restricted-course), survival-craft construction, abandonment actions, pack/training equipment and markings.
