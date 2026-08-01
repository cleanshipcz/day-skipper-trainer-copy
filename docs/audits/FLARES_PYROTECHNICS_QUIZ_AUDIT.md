# Flares & Pyrotechnics Quiz audit

- Audit issue: [#135](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/135)
- Route/topic: `/quiz/safety-flares-quiz` / `safety-flares-quiz`
- Audited: 2026-08-01
- Bank: `src/data/quizzes/safetyFlares.ts`
- Shell/catalogue: `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`,
  `src/features/quiz/`
- Authoritative theory remediation: [#348](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/348)
- Separate scenario drill: [#349](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/349)

## Verdict

**The shared workflow is functional, but this bank is not a safe or defensible
flare assessment.** All ten records load, have unique IDs and four options, and
seeded shuffling retains the intended-answer mapping. Percentage scoring and
authenticated **completion-save** recovery are mechanically coherent; attempt
start and in-progress saves still have the recovery defects owned by #209 and
#313. Content is the blocker:
the quiz teaches obsolete Coastguard disposal, a universal 15-degree rocket
angle, a universal three-year life, and a false night-only red-hand-flare role.
Two rescue scenarios are under-specified, no item visually identifies a flare,
and core handling, misfire, clearance, carriage and alerting decisions are
absent.

At 70%, seven correct answers produce “You've mastered this topic!”. A learner
can therefore miss three questions—including safety-critical ones—and receive
an unqualified mastery claim. Until #348 supplies reviewed authoritative
outcomes and #350 remaps this bank to them, completion should not be treated as
evidence that a learner can identify, select, handle or dispose of marine
pyrotechnics safely.

## Evidence and reachability

- `safety-flares-quiz` is a registered lazy catalogue entry with the expected
  title and subtitle. `/quiz/:topicId` resolves it through the generic shell.
- The parent `/safety/flares` route links to this quiz from its Drill tab. The
  link is valid, but it is not visible from the other three tabs.
- The bank has ten stable IDs `flare1`–`flare10`; all intended indices are in
  range and options are syntactically unique within each item.
- Catalogue validation rejects an unknown topic, empty bank and duplicate IDs.
  It does not validate blank stems/explanations, option count/uniqueness,
  intended-answer bounds, content version or safety metadata; shared #193 owns
  stronger runtime validation.
- Questions and options are shuffled with a seeded RNG. The correct index is
  remapped after option shuffle.
- No question has an `image`, despite the catalogue subtitle and parent lesson
  claiming identification.

## Item-by-item accuracy

### `flare1` — long-range attraction

Red parachute rocket is the intended long-range attraction answer and is the
best of the four choices. The explanation's approximately 300 m and up-to-40 km
figures are unsourced nominal performance presented without visibility,
product/approval or manufacturer boundaries. The item tests a name, not when
to conserve/fire it or how to follow the actual casing instructions.

### `flare2` — white hand flare

Collision warning rather than distress is the sound intended distinction. The
question is useful but too shallow to assess recognition or safe use. It does
not test the applicable collision-risk context, alternative action, firing
hazards, or why a red distress signal would be inappropriate.

### `flare3` — helicopter by day

Orange smoke is directionally appropriate for daytime position/wind marking.
Calling handheld smoke **the preferred** signal is too categorical without
platform, distance, wind, product instructions and SAR direction. From a raft,
a buoyant unit may be safer; near an aircraft, rocket clearance is critical.
The stem needs enough context for one safe answer.

### `flare4` — buoyant smoke duration

Three minutes is a common nominal SOLAS performance value, but “typically” and
the comparison with handheld smoke still need traceable product/standard
scope. Memorising duration does not test deployment timing, safe placement,
wind, visibility or conservation.

### `flare5` — rocket angle

**Unsafe as written.** “15° downwind” is asserted as the universal strong-wind
instruction. Actual casing/manufacturer instructions and safe clearance govern
operation. The options force learners to select a memorised angle without
checking the unit, rig, crew, canopy or aircraft. This item should be removed or
rebuilt around reading and following the onboard instructions.

### `flare6` — shelf life

**False universal rule.** The marked manufacturer expiry/service regime, unit
condition and applicable requirements govern replacement. “Three years from
manufacture” is not a safe calculation for every product; current MCA material
itself describes manufacturer expiry over three or four years. The item should
assess finding/acting on the marked expiry and damage, not arithmetic recall.

### `flare7` — liferaft in daylight

Buoyant orange smoke is plausible when a nearby rescuer needs daytime position
marking and holding a unit is unsafe. Merely being in a raft “during daylight”
does not say whether anyone can see the signal, their range, wind, SAR
instruction or available resources. A signal should not be wasted without a
likely observer. The current stem is underdetermined.

### `flare8` — nearby lifeboat at night

Red hand flare is a reasonable close-range position-marking choice once a
lifeboat is searching nearby. The nominal 60-second claim needs scope. The item
should also reinforce firing only when useful, downwind/product-specific
handling, and keeping the rescuer and vessel clear.

### `flare9` — disposal

**Dangerously obsolete.** HM Coastguard stopped accepting private unwanted
flares after 31 December 2022. A chandlery is not automatically an accepting
disposal service. Current GOV.UK guidance requires the owner to arrange and
confirm a suitable third-party service, potentially an accepting supplier,
marina, liferaft service, local authority or specialist business. The existing
answer and explanation train learners to attempt an obsolete hand-in route.

The prohibitions on dumping, casual firing and keeping expired units as backup
are directionally useful. Household/garden waste, recycling centres and
abandonment are also missing.

### `flare10` — “ONLY” nighttime

**Incorrect categorical answer.** A red hand flare is primarily effective for
close-range location at night but is a recognised distress signal and is not
categorically suitable only at night. The question confuses optimum visibility
with permitted/recognised role. It should test contextual effectiveness, not a
false binary.

## Coverage and assessment quality

The bank mostly recalls product names and nominal numbers. It does not assess:

- physical form, casing, purpose label, approval mark, expiry or firing end;
- reading the unit's instructions before an emergency;
- manufacturer-specific orientation and ignition differences;
- damaged/wet units, storage inspection or misfire response;
- clearing crew, faces, rigging/sails, fuel, liferaft canopy and aircraft;
- initial alert versus long-range attraction versus close-range marking;
- DSC/VHF, EPIRB/PLB and SAR coordination or conserving finite signals;
- vessel length/use/area/jurisdiction carriage boundaries;
- EVDS recognition/performance limitations and non-substitution;
- current disposal provider confirmation, transport and owner responsibility.

There is no visual assessment. Full product names in text cannot demonstrate
recognition of an actual unit, its markings or correct end. Colour alone would
also be insufficient; accessible visuals and structured marking descriptions
must come from the reviewed asset/content work in #348.

Explanations repeat the intended choice and sometimes one nominal fact. They do
not explain why plausible distractors are unsafe, state assumptions, cite a
source/review version, or link to remediation. This makes a wrong answer a
momentary reveal rather than useful corrective teaching.

## Scoring, mastery and retry

- `countCorrectAnswers` compares answers with remapped shuffled indices.
  `percentageScore` rounds the percentage; 7/10 passes at the shared 70%
  threshold. Client-scored answers intentionally award zero profile points.
- The live Score badge changes immediately on selection, before Submit, while
  options remain editable. A learner can cycle options until the score rises
  and discover every answer. Shared #157 owns this correctness oracle.
- Submit locks the current selection only in the current rendered view and
  reveals correct/incorrect styling, toast and explanation. Next clears
  `showExplanation`; Previous is then available on the next question and can
  return to the submitted item with its answers editable. This transient lock,
  combined with the live score oracle, permits post-submission answer editing;
  shared #157 owns both behaviors. Next persists the next position; final Next
  displays results. Retry clears answers, changes the shuffle seed and starts a
  new authenticated attempt.
- A passing result says “You've mastered this topic!” without critical-item
  gating. With four substantively defective items, the current pass result is
  not valid mastery evidence even when the arithmetic is correct.
- There is no result review by question, missed-objective summary or direct
  route back to the relevant flare theory subsection.

#350 owns bank-specific outcome mapping, explanations, coverage and critical
mastery policy. Any generic result-language/threshold change must coordinate
with shared shell owners rather than fork the shell for this topic.

## Completion, persistence and edge states

- Authenticated in-progress answers persist under canonical
  `quiz-safety-flares-quiz`; legacy resolution/migration is supported.
- Saved answers are shuffled option indices, not stable question/option
  identities. Catalogue changes can reinterpret them. Shared #156 owns
  versioned stable persistence and migration; #350 must supply the corrected
  bank/content version and invalidation policy.
- A server attempt is started by RPC and recovered briefly from owner-scoped
  local storage. This is not complete attempt recovery: attempt-start failure
  has no direct status/retry surface and can leave completion waiting for a
  workflow that never appeared. #209 owns it.
- Score submission, final progress, engagement and review seeding have separate
  recovery behavior. Final save failure is shown with retry; a submitted score
  workflow prevents starting another retry until completion saving finishes.
- In-progress `persistSession` awaits the shared call, but save false/rejection
  is not surfaced next to an answer and there is no explicit retry/recovery for
  that failed checkpoint. Shared #313 owns truthful in-progress save states and
  recovery.
- Anonymous attempts exist only in memory and disappear on reload/navigation;
  #194 owns the privacy-safe anonymous policy or explicit warning.
- Rejected imports show Quiz unavailable and Retry loading; empty/unknown banks
  show unavailable. The fallback buttons route to Home and Nautical Terms,
  unrelated to Flares. #155 owns contextual navigation.

## Accessibility, viewports and input

Positive source-level behavior includes native answer/action buttons, visible
focus classes inherited by shared buttons, text plus icons/colour after Submit,
an `aria-live` loading state, and alert roles on final-save/review-sync errors.

Shared shortcomings remain:

- the icon-only Back button has no accessible name;
- answer choices expose neither a named radio group nor selected/pressed state;
- the progress bar lacks topic/question labelling;
- score, explanation, question transition and completion lack deliberate live
  announcement/focus management;
- hover scaling/animated feedback lacks a verified reduced-motion contract;
- sticky title/count/score and long answer rows are not verified at 320/375 px,
  200%/400% zoom, forced colours, large text or localization.

Shared #154 owns semantics, focus, announcement, motion and responsive
accessibility. The bank adds no images, so image alternative quality cannot be
assessed; future #348-derived visuals require specific accessible names rather
than the shell's generic `alt="Quiz Scenario"`.

## Ownership and duplicate search

Repository-scoped searches for the exact quiz title, topic ID, flare quiz and
pyrotechnic assessment found audit #135 and the adjacent #348/#349 work, but no
focused quiz-bank remediation issue. One nonduplicate issue was created:

- [#350 — Align the flares quiz with reviewed safety outcomes and critical
  mastery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/350)

Ownership boundaries:

- #348: authoritative theory/data, sources, visual assets, disposal/carriage/
  handling/EVDS correctness and qualified review;
- #349: the separate on-page flare scenario/identification drill;
- #350: this dedicated quiz's coverage matrix, question mapping, explanations,
  visual-assessment consumption and safety-critical mastery;
- #154, #155, #156, #157, #193, #194, #209 and #313: shared quiz shell,
  validation, navigation, accessibility and persistence.

## Sources and limitations

Content conclusions reuse the primary-source review recorded by the adjacent
theory audit: MCA MIN 542 (M+F) Amendment 3; MCA/DfT **Disposing of unwanted
marine flares** (updated 1 January 2023); MCA MIN 687; and corroborating current
RYA disposal guidance. #348 owns the final authoritative content set and must
add product/manufacturer evidence and qualified review.

This audit inspected source, catalogue, scoring, randomization, session/progress
helpers, route, parent link, tests and GitHub ownership. It did not operate a
pyrotechnic, compare manufacturer instructions, receive qualified maritime
review, run a live authenticated/offline Supabase browser session, or exercise
screen readers, forced colours, high zoom, touch, physical devices or production
deployment. Those are explicit acceptance limitations, not evidence that the
current content or interaction is safe.
