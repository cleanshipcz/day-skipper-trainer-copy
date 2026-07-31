# Engine Checks Quiz learner-facing audit

- Audit issue: [#98](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/98)
- Route/topic: `/quiz/engine` / `engine`
- Audited: 2026-07-31
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/engine.ts`
- Quiz services: `src/features/quiz/`
- Parent audit: `docs/audits/ENGINE_THEORY_AUDIT.md`

## Verdict

**The generic quiz workflow completes reliably, but this bank is not yet a
safe or fair Engine assessment.** Its 12 entries have unique stable IDs,
shuffled answers retain their correct mapping, percentage/pass calculation is
sound, and authenticated completion has explicit recovery paths. The content
does not meet the same standard: seven questions assess facts the parent never
teaches, while several intended answers turn installation-specific maintenance
into universal rules.

The four-minute blower answer reproduces a gasoline-compartment rule in a quiz
otherwise dominated by diesel topics. Oil checks, coolant condition, stern-gland
leakage, filter inspection, warm-up and alarm response all depend on the
installed engine, gearbox, cooling and stern-gear manuals. Coolant colour cannot
establish compatibility or health, not every stern seal should drip, and
checking near a turning shaft is hazardous. Issue
[#199](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/199)
already owns the complete theory/quiz correction.

The shared shell also exposes correctness through its live score before Submit.
Anonymous work disappears on reload; authenticated answers persist unstable
option indices; answer selection, progress, feedback and focus are not fully
accessible; and Back/completion return to global Home instead of Engine.

## Evidence and exercised paths

### Method and scope

The 12-question bank, lazy catalogue, randomization, scoring, session
persistence, attempt workflow, route/registry, parent page and parent audit were
inspected directly. Every intended answer and explanation was compared with
the taught page and current primary guidance from RYA, the US Coast Guard,
Yanmar, Volvo Penta and the MAIB. Focused quiz tests, typecheck, lint,
production build and the internal-artifact guard were run.

Source-confirmed behavior:

- `/quiz/engine` resolves through `/quiz/:topicId`; `engine` is a registered
  lazy catalogue with title **Engine Checks Quiz**.
- The bank contains 12 four-option questions with unique IDs `e1`–`e12` and
  in-range intended answers. Individual catalogue loading rejects an empty bank
  and duplicate IDs; bulk loading additionally rejects IDs duplicated across
  topics.
- Seeded shuffling remaps each intended answer to its shuffled option index.
  Choosing all catalogue-defined answers completes as 100%.
- Submit is disabled until a selection, then locks choices and reveals
  text/icon correctness plus an explanation. Previous is available before
  submitting the current question. Retry clears answers and reshuffles.
- Percentage is rounded and 70% passes. Client-side answers intentionally award
  zero profile points.
- Unknown, empty and rejected catalogues render an unavailable card. Rejected
  imports leave the cache and can be retried.

Browser control was unavailable. Pixel-level responsive behavior, touch,
screen-reader output, browser focus and a live authenticated Supabase round-trip
were not exercised. Those paths were assessed from source and focused helper
tests. No real engine, gearbox or stern gear was operated or inspected.

### Alignment with Engine theory

Only `e1`–`e5` are represented in the parent:

- BWORCA expansion;
- four-minute blower operation;
- cold oil check;
- damaged/missing impeller blades;
- seacock as the first overheating check.

These mostly test recall of the page's unsafe absolutes, not inspection
competence. The parent does not teach how to identify the actual installation,
use its manual, confirm safe isolation, interpret normal evidence, respond to
alarms, or decide not to start/restart.

Questions `e6`–`e12` are untaught:

- coolant colour and condition;
- stern-gland leakage;
- low-oil-pressure alarm response;
- fuel-filter inspection frequency;
- diesel microbial contamination;
- neutral warm-up and gearbox-oil circulation;
- raw-water exhaust discharge.

Some are valuable objectives after correction. They currently appear only
after ten physical-checklist self-attestation clicks, without explanation,
component diagrams, practical examples or remediation. Explanations assert
answers but provide no assumptions, source or link to a relevant theory
section. #199 now requires a stable corrected-theory↔assessment coverage matrix,
explicitly justified formative-only objectives, corrected rationale and
remediation.

### Mechanical and safety accuracy

All intended indices identify one syntactic answer, but correctness often
depends on an unstated engine/system:

- `e1` declares BWORCA **the** pre-start sequence. It can be a memory aid only
  after defining its representative installation and deferring to the vessel
  and engine manuals. It omits propeller-area clearance, leaks, instruments,
  alarms and immediate post-start observations included in current RYA engine
  checks.[^rya-checks]
- `e2` says every engine blower needs four minutes to clear fuel vapour. The
  cited US Coast Guard warning applies to a boat with a covered gasoline engine
  compartment and specifically pairs blower operation with checking the bilge
  for gasoline vapours.[^uscg-ventilation] **Inference:** using that number in
  an unspecified/diesel-oriented quiz is a scope error; the source does not say
  that all diesel installations should omit manufacturer-specified
  ventilation.
- `e3` makes “when cold” the universal oil-check answer. Actual instructions
  govern engine state, vessel attitude, dipstick method and wait time. For
  example, one Yanmar running-in procedure requires stopping after operation,
  waiting about five minutes, then checking oil.[^yanmar-6cxbm] That example
  demonstrates variability; it is not a replacement procedure for other
  engines.
- `e4` directionally identifies damaged/missing impeller blades as a
  replacement condition, but it does not state that access, isolation, service
  interval, cover sealing, fragment recovery and priming follow the engine/pump
  manual. A learner is not warned against touching the system while starting
  is possible.
- `e5` asks for the first thing to **check** after overheat, not the safe
  immediate alarm response. Navigational safety and the installed manual govern
  whether to reduce load or stop, followed by cooled/isolated diagnosis. The
  learner is then directed toward coolant without being warned never to open a
  hot pressurized cap. Yanmar explicitly warns that steam/hot coolant can cause
  serious burns.[^yanmar-8lv]
- `e6` treats pink/green, clear coolant as healthy. Dye is not a dependable
  specification for chemistry, compatibility, concentration, age or
  contamination. The cited manufacturer requires specified compatible coolant
  and warns not to mix types/brands; it does not validate coolant by colour
  alone.[^yanmar-8lv]
- `e7` says **a stern gland should drip slightly** and should be checked before
  starting, while its explanation refers to leakage when the shaft turns.
  Some traditional packed glands may have a specified running drip rate;
  dripless/mechanical seals have different instructions. No seal type is
  stated. The MAIB documented serious injury when clothing caught a rotating
  propshaft coupling during a stern-gland check.[^maib-rotating] **Inference:**
  this quiz must not encourage close inspection/adjustment near a turning shaft;
  the case does not prohibit all remote visual monitoring.
- `e8` correctly rejects increasing revs or waiting after a low-oil-pressure
  warning and prioritizes stopping to prevent damage. It is still incomplete:
  the immediate action must account for navigational danger and the model's
  alarm procedure, followed by safe isolation and a no-restart/escalation
  boundary. Yanmar's cited manual says to stop for insufficient pressure,
  whereas Volvo Penta directs operators to model-specific alarm severity and
  safe stopping guidance.[^yanmar-6lt][^volvo-support]
- `e9` says filters should be checked before every passage, directly
  contradicting the parent's **Annually** frequency. Neither distinguishes
  observing a water separator/restriction indicator from isolated filter
  service/replacement. Hours, calendar, fuel condition and manual determine
  the applicable inspection/service schedule.
- `e10` directionally describes diesel bug as microbial contamination promoted
  by water that can block filters. The explanation is too narrow for action:
  it omits evidence, tanks and fuel quality, prevention, sampling/treatment
  boundaries, safe disposal and the fact that a blocked filter is one possible
  consequence. RYA frames this as increased care with diesel containing
  biodiesel and recommends examining accessible filters/water separators.[^rya-checks]
- `e11` universally attributes a neutral warm-up to oil-pressure stabilization
  and gearbox-oil circulation. A current Yanmar manual instead says not to idle
  for long periods and to begin navigation at low speed after starting.[^yanmar-6lt]
  **Inference:** the quiz's causal explanation lacks support across engine/gear
  designs and should defer to the installed manuals.
- `e12` is directionally correct for installations where cooling water should
  appear at a wet exhaust or outboard tell-tale. RYA says to check for good flow
  immediately after starting.[^rya-checks] The explanation merely says no
  water means overheating risk; it should test prompt safe stop/no-restart
  action and recognize that discharge design varies.

The bank omits other safety-critical assessment: correct component
identification, hot/rotating/electrical isolation, expected warning indicators,
starter limits, leak/fire/carbon-monoxide response, abnormal noise/smoke/
vibration, pollution control, safe propeller checks and competent-person
boundaries.

### Explanations and assessment quality

- Explanations are concise and repeat the intended option, but none states its
  assumed installation or cites a source.
- Incorrect learners receive no explanation of why their distractor is unsafe,
  no parent subsection, and no model-manual prompt.
- `e2`, `e3`, `e5`–`e7`, `e9`, `e11` and `e12` convert conditional guidance
  into categorical answers. That makes a correct score evidence of memorizing
  app wording rather than safe mechanical reasoning.
- Most distractors are obviously absurd rather than plausible diagnoses. The
  bank tests recognition, not sequence, evidence, stop/no-start decisions or
  transfer to an actual vessel.
- There are no diagrams or scenarios to test identifying components, gauges,
  alarms, leaks, belt/impeller damage, coolant/exhaust evidence or isolation.
- No question assesses the learner's ability to consult the correct manual and
  reject a generic measurement or service interval.

### Scoring, retry, completion and failure states

- `countCorrectAnswers` compares positional selections with each shuffled
  question's remapped correct index. `percentageScore` safely returns zero for
  an empty denominator; 70% passes.
- The visible **Score** is derived as soon as an option is selected, before
  Submit, while all options remain enabled. Cycling choices until the score
  rises reveals the answer and permits a manufactured 100%. Shared
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns the score oracle.
- Submit locks the current selection. Previous exists only before current
  submission. Next persists the next index; final Next enters completion.
- Retry clears answers, increments the seed and starts a new authenticated
  attempt. If score submission succeeded but final progress failed, local
  workflow recovery retains completion and disables retry until final saving
  succeeds.
- Score submission, progress, engagement and spaced-review seeding have
  independent failure/retry behavior. A failed review seed does not erase quiz
  completion.
- Active Back and completion Home navigate to `/`, not `/engine`. The
  unavailable state's **Nautical Terms** action is unrelated to Engine. Shared
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns contextual navigation.

### Persistence and edge behavior

- Anonymous state exists only in component memory, so reload/navigation loses
  the attempt silently. [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns a privacy-safe, expiring anonymous policy or explicit ephemeral warning.
- Authenticated state uses canonical `quiz-engine` progress. Saved sessions
  contain only shuffled option indices and current question, not stable
  question/option identities or a shuffle/catalogue version.
- `parseSavedQuizSession` accepts negative, fractional and out-of-range finite
  answer values. A catalogue change can reinterpret an old selection or enable
  Submit while no visible option is selected. Shared
  [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns identity/version validation and migration.
- Initialization reacts to question count, not question identity/order.
  Completed records are intentionally not resumed as editable sessions.
- Catalogue loading validates non-empty banks and IDs, but not blank question/
  explanation text, option count/uniqueness or answer bounds. Shared
  [#193](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193)
  owns complete runtime validation and tests.

### Reachability, accessibility, responsive layout and input

- The quiz is registered and reachable from `/engine` only after all ten
  checklist clicks. That gate measures self-attestation, not learning; #196 and
  #199 own the parent completion/quiz relationship.
- Native answer/action buttons support pointer, touch and keyboard activation.
  Correct/incorrect state uses text/icons as well as colour.
- The icon-only Back button has no accessible name. Answers expose no radio,
  selected or pressed state. The progressbar lacks contextual labelling.
  Explanation/result insertion is not deliberately announced, and focus is not
  moved to a new question or completion. Shared #154 owns these defects.
- The centered max-width card and responsive padding are structurally likely to
  fit normal phone-to-desktop widths, but long text plus feedback icon share a
  horizontal row. The sticky header also keeps title, score and count together.
  Narrow widths, 200%/400% zoom, large text and localization require actual
  reflow tests.
- Answer hover scaling and explanation transitions need reduced-motion
  handling. #154's updated acceptance criteria include long/localized content,
  narrow/high-zoom reflow and motion preferences.

## Focused follow-up issues

No new issue was needed after searching existing Engine and shared-quiz work:

- [#199 — Align Engine theory and quiz with installation-specific safe
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/199)
  owns content coverage, mechanical/safety corrections, explanations,
  remediation, route handoff and tests. Its coverage matrix and representative
  scenarios explicitly include hot/rotating/electrical isolation, alarms and
  starter limits, leak/fire/CO response, abnormal noise/smoke/vibration,
  pollution, propeller safety and competent-person boundaries.
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

All sources were accessed 2026-07-31. Manufacturer examples demonstrate why
model-specific manuals matter; they do not govern every engine.

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
