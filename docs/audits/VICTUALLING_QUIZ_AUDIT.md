# Victualling Quiz learner-facing audit

- Audit issue: [#96](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/96)
- Route/topic: `/quiz/victualling` / `victualling`
- Audited: 2026-07-31
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/victualling.ts`
- Quiz services: `src/features/quiz/`
- Parent audit: `docs/audits/VICTUALLING_THEORY_AUDIT.md`

## Verdict

**The shared quiz workflow can complete, but this bank is not a safe or fair
assessment of the Victualling module.** Its 12 entries have unique stable IDs,
answer shuffling retains the intended answer, the 70% pass calculation is
sound, and the shell provides retry and explicit authenticated save recovery.
However, seven questions assess material the parent does not teach. The five
questions that do align mostly repeat unsafe universal allowances from the
parent rather than testing passage-specific planning.

Two answers need priority correction. Removing original tin labels and replacing
them with only a waterproof-pen description loses safety-critical traceability,
including ingredients and allergens, date marks, preparation instructions, and
batch/recall information. Oilskin trousers are asserted to protect against
scalds without authoritative, material-specific support and risk being treated
as permission to handle hot liquids in unsafe conditions. Issue
[#191](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/191)
coordinates those claims and the wider theory/quiz mismatch.

The shared shell also exposes correctness through its live score before
submission. Anonymous attempts disappear on reload; authenticated sessions
persist unstable option indices; and the established answer-state, progress,
announcement, and focus defects apply unchanged. Back, completion, and
unavailable-state actions do not return the learner to Victualling.

## Evidence and exercised paths

### Method and scope

The question bank, lazy catalogue, shared quiz shell, scoring, randomization,
session persistence, route registration, topic registry, parent page, and
parent audit were inspected directly. The bank was compared question by
question with what `/victualling` actually teaches. Focused catalogue,
randomization, scoring, session-progress, typecheck, lint, and production-build
checks were run.

Source-confirmed results:

- `/quiz/victualling` resolves through the generic quiz route, and
  `victualling` is a registered lazy catalogue with the title **Victualling
  Quiz**.
- The bank contains 12 questions with unique IDs `v1`–`v12`; each has four
  options and an in-range intended answer. Catalogue validation rejects empty
  banks and duplicate IDs within a topic, while bulk validation rejects IDs
  duplicated across topics.
- Seeded shuffling remaps each correct answer to the shuffled option index.
  Selecting the catalogue-defined answer for all 12 therefore completes as
  100%; 70% or more passes.
- Submit starts disabled, locks the choices after activation, and reveals
  text/icon feedback plus an explanation. Previous is available only before
  submitting the current question. Retry clears the answers and reshuffles.
- Unknown, empty, and rejected catalogues render the shared unavailable state;
  rejected imports are evicted from cache and can be retried.

Browser control was unavailable, so no claim is made for pixel-level layout,
real assistive-technology output, touch-device behavior, or a live authenticated
Supabase round-trip. Responsive behavior at 320–1280 CSS px, focus, semantics,
and failure paths were assessed from the rendered structure and shared-shell
tests rather than a browser session.

The evidence was reconciled on 2026-07-31 after rebasing onto chain tip
`f661f95`. None of the Victualling bank, shared quiz shell/services, parent
theory/data, topic registry, or route definitions changed between the audit's
qualifying commit and that tip, so the verdict below still describes the
current chain. All linked follow-ups (#154–#157, #187–#189, #191, #193, and
#194) were also rechecked as open with the `agent-queue` label.

### Alignment with the parent module

Only `v1`–`v5` are directly represented in the parent:

- 2 L drinking water per person/day;
- provisioning for 50% more days;
- waterproof containers;
- minimizing packaging;
- fresh produce lasting 2–3 days.

These are recall questions about the page's fixed cards and checklist copy.
They do not assess calculation of crew demand, passage duration, reserve,
capacity, meal quantities, dietary needs, storage location, spoilage controls,
fuel consumption, or contingencies. The parent audit explains why each fixed
quantity or superlative is insufficient for real passage planning.

The remaining seven questions are prerequisites the parent never teaches:

- identifying and stowing tins after removing labels (`v6`);
- meal planning and reducing galley time (`v7`);
- first-day rough-weather food (`v8`);
- allergies and dietary requirements (`v9`);
- LPG accumulation, explosion risk, and bottle shutoff (`v10`);
- the purpose and limits of a gimballed stove (`v11`);
- oilskins as scald protection (`v12`).

Several are worthwhile objectives after correction, but learners currently
unlock this quiz by clicking 18 possession boxes, not by receiving instruction
on these subjects. Explanations state conclusions but provide no source,
assumptions, remediation link, or route back to relevant theory. The mismatch
and completion policy are owned by #191.

### Answer accuracy and safety

Every intended answer is syntactically unambiguous, but much of the wording is
too absolute to be treated as authoritative guidance:

- `v1` turns **2 L** into a universal minimum for drinking. Potable-water
  planning must account for crew, duration, climate and exertion, cooking and
  other consumption, resupply reliability, unusable volume, contamination or
  leakage, and a protected reserve. The offered values cannot establish a safe
  total.
- `v2` says to **always** provision for 50% more days because weather delays are
  common. Contingency should follow the passage, forecast uncertainty,
  alternates, vessel and crew, capacity, and resupply plan; a fixed percentage
  can be inadequate or excessive.
- `v3` calls waterproof containers the **most important** storage concern.
  Moisture protection matters, but secure low stowage, accessibility,
  temperature, ventilation, segregation, food hygiene, stock rotation, and
  emergency reserves cannot be ranked away by this answer.
- `v4` correctly favors reducing unnecessary packaging over reducing food,
  water, or calories, but the explanation stops at storage inconvenience. It
  should preserve required food information and teach retention and lawful
  disposal rather than imply that removing packaging is inherently safe.
- `v5` claims most fresh vegetables last 2–3 days without refrigeration in
  warm conditions. Shelf life varies materially by produce, ripeness,
  condition, temperature, humidity, ventilation, handling, and storage; the
  single duration is not a dependable planning rule.
- `v6` recommends removing original tin labels, writing on tins, and stowing
  them securely. A product name alone is not an adequate substitute for the
  ingredients/allergen declaration, date mark, preparation/storage
  instructions, manufacturer and batch/lot identifiers needed for safe use and
  recall traceability. Any alternative record must remain complete, legible,
  and reliably associated with the exact tin. Otherwise the original label
  should remain protected. This is coordinated in #191.
- `v7`–`v9` are directionally sound: plan suitable meals, reduce cooking in
  rough conditions, and establish dietary needs before departure. Their
  explanations still omit energy/nutrition, allergies versus preferences,
  cross-contact, substitutions, seasickness, crew consultation, and conditions
  for choosing no-cook food.
- `v10` correctly identifies LPG's tendency to collect low and the resulting
  fire/explosion danger, but “main risk” is reductive. Safe teaching also needs
  compatible maintained equipment, ventilated locker stowage, cylinder
  security, leak detection, ventilation, flame supervision, shutoff routines,
  and emergency response. RYA guidance supports bottle shutoff when not in use
  and specifically says to secure and shut off the bottle in rough weather.
- `v11` correctly describes why yacht stoves are gimballed, but says this
  **prevents** pots sliding and spilling. Gimballing reduces heel-related tilt;
  it does not remove vessel-motion or scald risk. Suitable gimbal locks, pot
  restraints and lids, safe handles/handholds, keeping people clear, and
  avoiding hot-liquid cooking in unsafe conditions remain necessary.
- `v12` asserts that oilskin trousers protect against hot-liquid scalds. No
  authoritative evidence reviewed supports ordinary oilskins as scald PPE.
  Waterproof clothing is not a substitute for eliminating unsafe hot-liquid
  handling or engineering controls, and unsuitable clothing may hold hot
  liquid against skin. The answer should be removed or validated for a specific
  rated garment and narrowly framed; safer controls come first. This is
  coordinated in #191.

The source-backed conclusion is deliberately narrower than a claim that an
authority has considered this exact yacht practice:

- Food Standards Agency/Defra guidance, **“Labelling pre-packed food:
  Information to display on labels or packaging,”** lists the food name,
  ingredients including allergens, date, responsible business and other
  mandatory information. Its **“Show the ‘best before’ or ‘use by’ date”**
  section also identifies cases where a lot number is required.[^fsa-label]
  **Inference:** replacing a label with only a waterproof-pen food name can
  discard information needed to choose, prepare, date-check, or identify that
  exact tin. The source does not say “never remove labels on a yacht”; the safe
  requirement inferred here is to retain a complete, reliable association or
  not remove them.
- HSE's PUWER guidance, **Regulation 13, “From contact with hot process
  materials”** (PDF page 49), lists limiting temperature and providing doors,
  lids, covers, or deflection systems for splash/spill risk.[^hse-puwer]
  **Inference:** these prevention/engineering controls are stronger support
  than the quiz's unsupported claim about ordinary oilskins. HSE does not
  discuss yacht oilskins in that section, so this audit does not claim that HSE
  has declared every oilskin unsuitable; it finds no basis here for presenting
  them as scald protection.
- RYA's **“Using gas safely”** section says the safest option is bottle shutoff
  when gas is not in use and says to shut off and secure the bottle in rough
  weather.[^rya-gas]
  This supports the shutoff part of `v10`, not the quiz's wider omissions or an
  assertion that bottle shutoff alone makes the installation safe.

No reviewed source establishes a universal offshore water/reserve allowance or
certifies oilskin trousers as scald PPE.

### Scoring, retry, completion, and failure states

- `countCorrectAnswers` compares selections with the remapped answer index.
  Percentage is rounded; 70% passes. Client-scored quizzes deliberately award
  zero profile points.
- Correctness is calculated immediately after a selection. The visible **Score**
  changes before Submit while every option remains available. A learner can
  cycle options until the score rises and discover every answer, making the
  final score poor evidence of learning. Shared issue
  [#157](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  owns this.
- Submit freezes the selected answer. Next persists the following index; final
  Next enters completion. Retry clears state, increments the shuffle seed, and
  requests a fresh authenticated attempt.
- Attempt score submission, final progress, engagement, and review seeding have
  separate recovery behavior. If score submission succeeds but final progress
  saving fails, a local workflow record retains completion and disables retry
  until saving is finished.
- Back and completed Home navigate to `/`, not `/victualling`. The unavailable
  state's topic action is hard-coded to **Nautical Terms**, sending a
  Victualling learner to an unrelated module. Shared issue
  [#155](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
  owns contextual return and recovery navigation.

### Persistence and edge behavior

- Anonymous attempts exist only in component memory; reload loses them.
  Authenticated progress uses the canonical `quiz-victualling` key. Focused
  issue [#194](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  owns an explicit anonymous policy: either privacy-safe, expiring local resume
  with catalogue-version/migration handling, or clearly communicated ephemeral
  behavior. The current silent loss is not treated as an intentional design.
- Saved sessions contain positional shuffled-option indices and a question
  index, but no question IDs, option identities, or shuffle seed.
  `parseSavedQuizSession` accepts negative, fractional, and out-of-range finite
  answer indices. Reload or a future catalogue edit can therefore reinterpret
  an answer. Shared issue
  [#156](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  owns stable identity and validation.
- Session initialization reacts to question count rather than the identities or
  order of the loaded questions. Completed records are intentionally not
  resumed as editable sessions.
- The catalogue validates IDs but not question text, option count, answer
  bounds, blank or duplicate options, or explanation quality. Focused shared
  issue [#193](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193)
  owns complete runtime schema validation and tests for `src/data/quizzes`.

### Accessibility, screen sizes, and input

Native answer and action buttons support keyboard activation, and submitted
correctness uses text/icons as well as colour. The centered, max-width card and
responsive padding are structurally likely to fit common phone through desktop
widths, but this was not pixel-tested. The shared shell still lacks:

- an accessible name on the icon-only Back button;
- radio, `aria-pressed`, or other programmatic selected state on choices;
- an accessible label and numeric context for the progressbar;
- deliberate status/live announcement for changed explanations and results;
- focus movement to each new question, its feedback, or completion;
- reduced-motion handling for answer hover scaling and animated feedback.

The option row can also become cramped at narrow widths or high zoom because
long text and its feedback icon share a non-wrapping horizontal row. Shared
issue [#154](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
owns the established focus and state defects; responsive/reduced-motion
coverage, including high zoom and long/localized answers, has been added to that
issue's context, acceptance criteria, and test scope.

## Focused follow-up issues

- [#191 — Align Victualling theory coverage and completion with its
  quiz](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/191) —
  reused for the seven untaught objectives, unsafe tin-label advice,
  unsupported oilskin/scald claim, safer galley controls, remediation, and
  theory/quiz completion policy.
- [#187 — Replace Victualling's universal allowances with a passage-specific
  provisioning plan](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/187)
  — reused for `v1`, `v2`, `v3`, and `v5` quantity/superlative corrections.
- [#188 — Teach food, potable-water, dietary, and stowage safety in
  Victualling](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/188)
  — reused for food storage, packaging, meals, dietary needs, hygiene, and
  traceability context.
- [#189 — Separate provisioning from safety inventory and add safe galley/LPG
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/189)
  — reused for LPG, gimballed-stove, rough-weather cooking, and scald controls.
- [#154 — Restore quiz focus and expose answer/progress state
  accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
  — reused for Back naming, selected state, progress semantics,
  announcements, focus, and shared motion/responsive follow-through.
- [#155 — Return topic quizzes to their parent module instead of global
  Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155) —
  reused for Victualling Back/completion navigation and the unrelated Nautical
  Terms unavailable-state action.
- [#156 — Validate persisted quiz answers against stable question and option
  identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
  — reused for positional persistence and malformed indices.
- [#157 — Do not reveal quiz correctness through the live score before
  submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
  — reused for the pre-submit score oracle.
- [#193 — Validate every quiz question and explanation at catalogue load
  time](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/193) —
  owns question text, option count/uniqueness, answer bounds, explanation
  validation, and shared catalogue tests.
- [#194 — Define privacy-safe anonymous quiz attempt persistence and
  recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
  — owns the current reload loss and the privacy, expiry, cleanup,
  catalogue-version, migration, and sign-in policy for any local resume.

## Authoritative sources

All sources were accessed 2026-07-31.

[^fsa-label]: Department for Environment, Food & Rural Affairs and Food
  Standards Agency, [“Food labelling: giving food information to
  consumers”](https://www.gov.uk/guidance/food-labelling-giving-food-information-to-consumers),
  sections **“Labelling pre-packed food: Information to display on labels or
  packaging,” “Label allergens,” “List the ingredients,”** and **“Show the
  ‘best before’ or ‘use by’ date.”**
[^hse-puwer]: Health and Safety Executive, [“PUWER 1998: Provision and Use of
  Work Equipment Regulations 1998: Open learning
  guidance”](https://www.hse.gov.uk/pubns/priced/puwer.pdf), Regulation 13,
  **“From contact with hot process materials”**, PDF page 49.
[^rya-gas]: Royal Yachting Association, [“Guide to gas safety on
  Boats”](https://www.rya.org.uk/water-safety/gas-safety/gas-safety-on-boats/),
  section **“Using gas safely.”**
