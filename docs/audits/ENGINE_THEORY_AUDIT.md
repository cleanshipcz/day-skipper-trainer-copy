# Engine Checks & Maintenance learner-facing audit

- Audit issue: [#97](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/97)
- Route/topic: `/engine` / `engine`
- Audited: 2026-07-31
- Primary implementation: `src/pages/EngineTheory.tsx`
- Checklist catalogue: `src/data/engineChecks.ts`
- Related quiz: `src/data/quizzes/engine.ts`, `src/pages/Quiz.tsx`
- Related registry/route: `src/constants/topicRegistry.ts`, `src/app/routes.tsx`

## Verdict

**This is a compact memory aid, not yet a safe or complete engine-checks
lesson.** The route is registered and reachable, its ten checkboxes have
associated labels, and the completion action targets the registered Engine
quiz. But ten irreversible clicks are treated as proof that physical
maintenance checks were completed. State and points vanish on reload, no
theory completion reaches the shared progress system, and an empty catalogue
would immediately claim completion.

More importantly, the content silently combines different installations. A
four-minute gasoline-vapour blower warning and “never run engine with blower
off” are presented alongside diesel-specific fuel contamination teaching.
Fixed oil-check conditions, belt deflection, consumable intervals, filter
frequency, and anode replacement thresholds are stated without an engine,
gearbox, cooling system, stern gear, or manufacturer manual. Coolant can be
topped up without a hot-system warning, and the learner is not told to isolate
rotating, electrical, fuel, exhaust, or pressurized hazards before inspection.

The linked quiz compounds the problem. Seven of twelve questions are not taught
by the page, and several answers make installation-specific claims universal:
coolant colour as a health test, every stern gland dripping, a generic first
overheat check, and neutral warm-up for gearbox-oil circulation. The page needs
an explicit representative scope, manufacturer-led procedures, safe response
boundaries, diagrams and practical inspection teaching before checklist clicks
or quiz scores can represent readiness.

## Evidence and exercised paths

### Method and scope

The route, registry, dashboard entry, page state transitions, checklist
catalogue, shared progress architecture, linked quiz bank, quiz shell and
preceding audit patterns were inspected directly. The page and quiz were
compared with current RYA engine-check guidance, US Coast Guard gasoline
ventilation requirements, an MCA/MAIB rotating-machinery case, and current
manufacturer operation manuals. Focused catalogue tests, typecheck, lint,
production build and the internal-artifact guard were run.

Observed and source-confirmed behavior:

- `/engine` is a lazy route and a registered root topic. The dashboard card and
  registry point to it, and the completion button targets `/quiz/engine`.
- The page starts at 0/10 and 0 local points. Each first activation awards ten
  points, so all entries yield 10/10 and 100 points.
- Activating a checked Radix checkbox requests `false`, but the handler ignores
  that value and only changes entries whose current `checked` field is false.
  An accidental check cannot be undone.
- Repeated activation does not award duplicate points, but supplies no reason
  why the visible checkbox cannot be cleared.
- At 10/10 the page says **All checks complete** and reveals the quiz. It cannot
  know whether any item was physically inspected, whether the vessel has the
  named component, or whether a condition was acceptable.
- `checks` and `score` are component state only. Navigation, remount or reload
  restores catalogue defaults. `useProgress`, authenticated storage, anonymous
  storage and registered topic completion are not used.
- If `maintenanceChecks` is empty, `checkedCount === checks.length` is true and
  the page renders completion and quiz readiness.
- No page-specific component test exists. The data has no runtime validation
  for duplicate/blank IDs, task/description/frequency text or malformed items.
- The checkboxes are associated with their full labels and operate by pointer
  or keyboard. The Back icon has no accessible name; score/count and completion
  insertion have no deliberate status/focus behavior.

Browser control was unavailable, so no claim is made for pixel-level overflow,
touch-device behavior, screen-reader output or browser-specific focus. Static
responsive classes and DOM semantics were assessed for 320–1280 CSS px and
high-zoom/large-text risk. No real engine was operated, no engine compartment
was inspected, and no live authenticated persistence round-trip occurred.

### Current-chain reconciliation

The audit was reconciled after rebasing onto the current chained base
`d52dba3` on 2026-07-31. No scoped implementation changed between the original
audit base `e129553` and that chain tip: `EngineTheory.tsx`, `engineChecks.ts`,
the Engine quiz catalogue/shell, topic registry and route remain unchanged.
The evidence and verdict therefore still describe the current chain. Focused
follow-ups #196–#200 and reused quiz-shell follow-ups #154–#157, #193 and #194
were also verified open with the `agent-queue` label.

### Scope and learning model

The page never states what plant it describes. “Sea cock,” raw-water impeller,
header tank, shaft gland and diesel bug suggest an inboard, heat-exchanger-cooled
diesel with shaft drive. The blower warning instead reproduces a gasoline
vapour-control rule. Outboards, direct raw-water cooling, keel cooling,
saildrives, sterndrives, mechanical packed glands, dripless seals, different
gearboxes and electronically managed engines need different checks.

BWORCA is presented as a universal sequence:

- **Blower** — four minutes;
- **Water** — seacock and coolant;
- **Oil** — dipstick;
- **Reserve** — fuel and lines;
- **Controls** — neutral and free movement;
- **Ancillaries** — battery, belts and leaks.

As a memory prompt it omits where components are, how to identify them on the
actual vessel, what normal looks like, what evidence makes a check fail, what
must be isolated, and what to do next. A learner can click every entry without
opening a manual or seeing an engine. There are no objectives, labelled system
diagram, photographs, normal/abnormal examples, worked inspection, maintenance
record, tools/spares plan or remediation.

The module should explain the relationships among fuel, lubrication, cooling,
air/exhaust, starting/electrical, controls, gearbox/drive, stern gear and
instruments. It also needs to distinguish:

- observations safe for an operator before or immediately after starting;
- maintenance requiring a stopped, cooled and isolated engine;
- tasks requiring system-specific training, tools or a competent engineer.

Current completion is self-attestation, not knowledge or vessel readiness.
Issue [#198](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/198)
owns the practical teaching model and visuals; issue
[#196](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/196)
owns reversible, durable and honest progress.

### Pre-start and maintenance correctness

Some prompts align directionally with RYA guidance: look for leaks, inspect
belts/hoses, check enough fuel plus reserve, oil and coolant levels, stern-gland
leaks where applicable, filters/water separators, a clear propeller, and
cooling-water discharge immediately after starting.[^rya-checks] The app still
turns those prompts into unsupported universal procedures:

- **Blower and vapours.** The US Coast Guard four-minute warning is expressly
  for boats with a covered gasoline engine compartment: operate the blower,
  then check the engine-compartment bilge for gasoline vapours before
  starting.[^uscg-ventilation] The app never says gasoline, while diesel bug
  dominates later content. “Never run engine with blower off” is also not the
  cited four-minute rule and ignores installation/manufacturer ventilation
  design. A learner needs fuel/installation-specific guidance, a vapour
  detector where fitted, and instructions not to start or create ignition
  sources if a leak/vapour is suspected.
- **Oil.** “Check when engine is cold” is not a safe universal measurement
  method. The relevant manual governs vessel attitude, whether the dipstick is
  screwed in, engine state and wait time. One Yanmar manual, for example,
  requires a post-run stop and wait before a specified recheck in its running-in
  procedure.[^yanmar-6cxbm] The app should not teach a generic state as more
  authoritative than the installed engine manual.
- **Coolant.** “Inspect header tank. Top up” does not identify expansion/header
  tank markings, compatible chemistry or mixture, and omits the critical hot
  cap/scald warning. Yanmar instructs users never to remove a hot coolant filler
  cap and warns against mixing coolant types/brands in the cited manual.[^yanmar-8lv]
  Colour alone does not establish chemistry, compatibility, concentration or
  serviceability.
- **Fuel.** “Sufficient fuel” lacks passage consumption, reserve, usable tank
  volume, contamination/water-separator checks, shutoff location, bleeding
  implications and spill control. “Fuel lines” omits hoses, unions, tank,
  filters, smells/sheens, safe leak response and no-start boundaries.
- **Seacock.** Opening the correct intake before starting is important, but the
  page does not teach identification, position, operability, strainer,
  blockage/leak checks, consequences of dry-running, or what to do if the valve
  cannot be confirmed. It also does not prevent a learner from confusing
  another through-hull.
- **Belts.** A universal 10–15 mm deflection under “moderate pressure” has no
  identified belt span, force, belt type or engine specification. Incorrect
  tension can damage a belt or bearings. Condition, guard/isolation, tension
  method and interval must follow the manual.
- **Impeller.** Monthly/season-start removal is not universally applicable.
  Inspection/replacement access, cover sealing, blade recovery, lubrication,
  interval and priming vary. The learner is not warned to close/restore the
  intake correctly, isolate starting, or account for missing blade fragments.
- **Filters.** The data says annually; the quiz says before every passage.
  Neither distinguishes observation of a water separator/restriction indicator
  from isolated filter replacement, nor follows hours/calendar/fuel-condition
  criteria in the manufacturer schedule.
- **Anodes.** “Replace at 50%” and “prevents corrosion of engine parts” are too
  broad. Location, alloy, bonding, inspection interval, replacement threshold
  and protected components vary with the engine/cooling/drive system and
  manufacturer.
- **Exhaust.** Looking for corrosion/leaks/blockage and water flow is useful,
  but the page omits hot surfaces, carbon monoxide, hose/waterlock/anti-siphon
  arrangements, clamps, flooding/backflow risk and immediate no-flow response.
- **Battery.** Cleaning live terminals is unsafe as generic advice. Isolation,
  polarity, tool/jewellery control, short-circuit risk, acid, hydrogen
  ventilation, charger state, terminal protection and manufacturer torque are
  absent.

Issue [#197](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/197)
owns installation-specific correction, authoritative sourcing and critical
warnings.

### Sequence, monitoring and troubleshooting

The page jumps from pre-start clicks to three diagnostic lists. It omits:

- checking bilge/engine space, propeller area and control/stop operation before
  starting;
- a safe starting procedure, starter limits and confirmation of neutral;
- immediate post-start oil-pressure/charging/temperature indicators and alarms;
- immediate raw-water discharge/tell-tale check;
- leaks, fuel/exhaust odour, abnormal smoke, noise and vibration;
- safe casting-off/gear engagement according to the manual;
- underway instrument/alarm monitoring;
- controlled shutdown, post-run inspection, seacock/battery/fuel policy and log;
- safe isolation, cooling, tag/no-restart communication and escalation.

The troubleshooting cards are not decision procedures:

- **Won't start** lists battery, fuel, seacock, neutral and kill switch, but
  supplies no distinction among no-crank, slow-crank and crank/no-fire; no
  starter duty limit; no vapour/leak check; and no safe electrical/fuel work
  boundary. An open cooling seacock does not cause most engines to start and can
  create water-ingestion risk after repeated cranking on some wet-exhaust
  installations.
- **Overheating** lists seacock, impeller, coolant and exhaust blockage without
  first telling the learner how to respond to the alarm while maintaining
  navigational safety, reduce/stop according to the manual, avoid a hot coolant
  cap, or refrain from touching moving/hot components. It omits absent
  discharge, strainer/intake restriction, belt, hose/leak and no-restart
  boundaries.
- **Loss of power** lists filters, intake, propeller and load, but not safe
  anchoring/sailing/tow decisions, fouled-prop entanglement hazards, fuel/water
  contamination evidence, smoke/temperature/oil indications, gearbox/drive
  faults or escalation.

Low oil pressure, charging failure, unusual noise/vibration, smoke, fuel/exhaust
leaks, water ingress and loss of cooling discharge are absent even though the
quiz tests two of them. Manufacturer instructions demonstrate why generic
lists are insufficient: a current Yanmar manual says to stop for low oil
pressure, while its high-temperature response depends on the specific engine
and operating situation.[^yanmar-6lt] Volvo Penta likewise tells operators to
use their model manual and distinguishes alarm severity and whether it is safe
to continue.[^volvo-support]

The MAIB documented serious injury when clothing was caught by a rotating
propshaft coupling during a stern-gland check.[^maib-rotating] **Inference:**
the app needs an explicit stopped/isolated-machinery boundary before suggesting
hands-on diagnosis; the case does not imply that all visual monitoring must
wait until shutdown.

### Theory and quiz alignment

Questions `e1`–`e5` mostly repeat BWORCA, the four-minute blower claim, cold oil,
impeller damage and seacock-first overheating. Questions `e6`–`e12` are not
taught by the parent:

- healthy coolant colour;
- stern-gland drip;
- oil-pressure warning response;
- fuel-filter frequency;
- diesel bug;
- neutral warm-up and gearbox circulation;
- exhaust cooling-water discharge.

The last seven include valuable objectives only after theory and wording are
corrected. Current accuracy issues include:

- `e2` repeats the scoped gasoline blower rule as universal.
- `e3` makes “cold” universally correct instead of the installed manual.
- `e5` asks for the first overheat “check” rather than safe alarm response and
  only then diagnosis.
- `e6` says healthy coolant is pink or green, clear and debris-free. Dyes are
  not a reliable coolant specification or compatibility/condition test.
- `e7` says **a stern gland should drip slightly**. Some traditional packed
  glands may permit specified leakage when turning, while dripless/mechanical
  seals have different requirements. The exact system manual governs; checking
  near a live shaft can injure.
- `e8` correctly prioritizes stopping for low oil pressure as a damage-control
  rule, but should account for immediate navigational safety and the specific
  alarm/manual before investigation.
- `e9` conflicts directly with the page's annual fuel-filter frequency and
  confuses inspection with replacement/service.
- `e10` is directionally accurate about microbial diesel contamination where
  water is present, but supplies no prevention, evidence, response or safe
  disposal context.
- `e11` asserts that neutral warm-up circulates gearbox oil and stabilizes oil
  pressure for every installation. Current manufacturer guidance may instead
  discourage prolonged dockside idle and direct low-speed operation; the
  specific engine/gear manual governs.[^yanmar-6lt]
- `e12` correctly treats water discharge as evidence of raw-water flow where
  that exhaust/tell-tale design applies, but omits immediate safe stop/no-restart
  action when expected flow is absent.

This exposure is not confined to `/quiz/engine`. `Exam.tsx` bulk-loads every
quiz catalogue, and `examEngine.ts` assigns Engine questions to practice-exam
selection. Completing the topic quiz also seeds its stable question IDs into
authenticated spaced repetition; the review registry resolves those IDs from
the same live Engine bank. Consequently `e2`, `e3` and `e5`–`e12` can repeat in
practice exams and daily review, including from review rows already seeded
before the catalogue is corrected. A correction must therefore withdraw or
migrate unsafe identities deliberately across quiz, exam and review rather
than treating a changed quiz-route rendering as sufficient.

Issue [#199](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/199)
owns corrected objective mapping, answer rationales, remediation, downstream
consumer/seeded-record handling and handoff.
Shared quiz-shell issues [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
through [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157),
plus [#193](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193)
and [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194),
apply unchanged to accessibility, contextual navigation, positional persistence,
the score oracle, catalogue validation and anonymous attempt policy.

### Completion, reachability and persistence

- The Engine card is reachable from Home and registered consistently. There is
  no direct quiz link on the page before all ten self-attestation clicks.
- Back always goes to global Home. The page has no resume/reset/review control
  and no explanation of whether boxes mean learned, observed or serviced.
- State is not durable for either anonymous or authenticated learners. The
  header points resemble profile rewards but are local only.
- Completion does not use the topic registry or shared progress, does not
  survive navigation, and cannot be represented accurately on the dashboard.
- No loading, save, pending, retry, offline, conflict or identity-change state
  exists.
- A catalogue change cannot migrate by stable identity because nothing is
  persisted, while an empty catalogue produces a false-positive completion.
- Quiz completion is separate and uses canonical `quiz-engine` persistence, but
  completion/back navigation returns to global Home rather than this parent.

Issue #196 owns theory checklist state and completion. Shared issue #155 owns
quiz return context; #156 and #194 own authenticated answer identity and
anonymous quiz-attempt policy respectively.

### Accessibility, visuals, screen sizes and input

Positive foundations:

- Each Radix checkbox has a matching `label` and exposes checked state.
- Labels provide a large pointer/touch activation area.
- Text accompanies the warning icon, and checked state is not colour-only.
- The one-column checklist and `md:grid-cols-2` mnemonic grid have basic
  responsive intent.

Remaining defects:

- the icon-only Back button has no accessible name;
- point/count/toast/completion changes are not deliberately announced;
- focus remains on the last checkbox when new completion content appears below;
- line-through reduces readability of already small task text;
- no diagrams or other instructional visuals exist, so component recognition
  and spatial system relationships are not taught;
- the sticky header keeps title/subtitle, score and count in one horizontal row;
- each task and frequency badge share a `justify-between` row;
- completion copy and a large button share another fixed row;
- long/localized content, 320 px, large text and 200%/400% zoom can crowd,
  overlap or overflow those rows;
- colour contrast was not measured, and transitions do not explicitly honor
  reduced-motion preferences.

Issue [#200](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/200)
owns accessibility/responsive behavior; #198 owns accessible instructional
visuals.

## Focused follow-up issues

- [#196 — Make Engine checklist progress reversible, durable, and
  completion-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/196)
- [#197 — Correct and scope Engine pre-start, maintenance, and fault safety
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/197)
- [#198 — Turn Engine Checks into a practical, inspectable maintenance
  lesson](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/198)
- [#199 — Align Engine theory and quiz with installation-specific safe
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/199)
- [#200 — Make Engine checklist and completion accessible and
  responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/200)
- Shared quiz-shell follow-ups reused:
  [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154),
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155),
  [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156),
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157),
  [#193](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193),
  and [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194).

## Authoritative sources

All sources were accessed 2026-07-31. Manufacturer examples demonstrate why
model-specific manuals matter; they are not asserted to govern every engine.

[^rya-checks]: Royal Yachting Association, [“Engine checks & preventing fuel
  contamination”](https://www.rya.org.uk/water-safety/boat-safety-and-maintenance/engine-checks-preventing-fuel-contamination/),
  sections **“Before starting”** and **“After starting.”**
[^uscg-ventilation]: United States Coast Guard, [“Boatbuilder's Handbook:
  Ventilation”](https://www.uscgboating.org/images/514.PDF), 33 CFR 183.610 and
  183.620, including the required gasoline-vapour warning.
[^yanmar-6cxbm]: Yanmar, [“6CXBM-GT Operation
  Manual”](https://www.yanmar.com/media/global/com/product/marinecommercial/propulsionEngine-HighSpeed/operationmanual/6CXBM-GT_OPM_0A6CX-G00300.pdf),
  **“Running-in: Procedure after Starting,”** manual page 17.
[^yanmar-8lv]: Yanmar, [“8LV Series Operation
  Manual”](https://www.yanmar.com/media/global/com/product/marinepleasure/powerBoatPropulsion/operationmanual/8LV_OPM_0A8LV-G00101.pdf),
  **“Before You Operate: Engine Coolant — Checking and Adding Coolant,”** manual
  page 27.
[^yanmar-6lt]: Yanmar, [“6LT Series Operation
  Manual”](https://www.yanmar.com/marine/wp-content/uploads/2022/11/L31900574_OPM_M0_20251204.pdf),
  **“Engine Operation: Preliminary Checks,” “Special Warnings,”** and **“For
  Proper Use of the Engine,”** manual page 42.
[^volvo-support]: Volvo Penta, [“Support & manuals: Troubleshooting — Determine
  level of severity”](https://www.volvopenta.com/en-us/support/).
[^maib-rotating]: Marine Accident Investigation Branch, [“Leisure Craft Safety
  Digest, 2nd edition”](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/877003/2008-SDLeisureCraft-MAIBSafetyDigest.pdf),
  **Case 10: “Dangers of Rotating Machinery,”** PDF page 27.
