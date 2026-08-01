# Comprehensive Safety Quiz learner-facing audit

- Audit issue: [#138](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/138)
- Route/topic: `/quiz/safety` / `safety`
- Audited: 2026-08-01
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`, `src/data/quizzes/safety.ts`
- Quiz services: `src/features/quiz/`
- Intended parent: `src/pages/SafetyMenu.tsx`

## Verdict

**The catalogue is technically loadable and exactly balanced across the six
Safety leaves, but the intended learner journey cannot reach it and the bank is
not safe enough to publish as a comprehensive assessment.** The topic registry
declares the intended handoff from **Safety Procedures** to `/quiz/safety`, and
the generic route can render all 24 questions when entered directly. The actual
Safety menu renders only its six theory cards and no comprehensive-quiz action.
Its tests assert those six cards but do not assert the registry-declared quiz
handoff, allowing the orphaning defect to persist.

The four-per-leaf count is arithmetically balanced and IDs, answer indices,
shuffling, scoring, retry, authenticated recovery and catalogue failure behavior
use the established shared quiz machinery. Coverage is nevertheless shallow:
mostly one-step recall, no visuals or applied sequencing, and no remediation
back to a particular Safety leaf. More seriously, three safety answers present
conditional guidance as universal fact. Liferaft servicing is not universally
three-yearly; the applicable manufacturer, raft type, packaging, age, service
history and operating regime determine the interval. The claimed fixed flare
pack for “within 7 miles” has no stated vessel/jurisdiction/operating basis. The
“Reflow Syndrome” explanation gives a speculative blood-chemistry mechanism as
fact instead of teaching the supported horizontal or near-horizontal recovery
precaution and cardiac-arrest risk.

The shared shell defects already tracked in #154–#157, #193, #194 and #209 also
apply: a pre-submit score oracle, unstable positional persistence, ephemeral
anonymous attempts, incomplete accessible state/focus, non-contextual
navigation, partial catalogue validation, and silent attempt-start failure.

## Evidence and audit bounds

### Reachability and intended entry point

- `src/app/routes.tsx` registers `/quiz/:topicId`; `src/data/quizzes/index.ts`
  registers `safety` as **Comprehensive Safety Quiz** and lazy-loads this bank.
- The `safety` topic in `src/constants/topicRegistry.ts` has route `/safety`,
  six leaf IDs, and `quizRoute: "/quiz/safety"`. This is the clearest executable
  statement of the intended parent and handoff.
- `SafetyMenu` supplies `ModuleMenuPage` only the six leaf cards. None has
  `/quiz/safety`; no separate CTA is rendered. A repository-wide route search
  found no other learner-facing link to that URL.
- `SafetyMenu.test.tsx` asserts the six theory cards and headings only. It would
  remain green if the comprehensive quiz stayed unreachable.
- A learner who knows or receives the direct URL can load the quiz, so this is
  a discovery/reachability failure, not a missing route or catalogue failure.

### Bank structure and six-leaf coverage

The bank contains 24 four-option questions, four in each explicit namespace:

| Leaf | IDs | Assessed content |
|---|---|---|
| Man Overboard | `safety-mob1`–`4` | sail return, MOB waypoint, cold-water recovery, propeller isolation |
| Fire | `safety-fire1`–`4` | FIRE mnemonic, electrical extinguisher, engine-space attack, colour band |
| Life raft | `safety-raft1`–`4` | grab bag, canopy, service interval, immediate raft actions |
| Flares | `safety-flare1`–`4` | long-range signal, carriage pack, holding, burn duration |
| Personal safety | `safety-personal1`–`4` | lifejacket policy, crotch strap, handhold, jackstay |
| Gas | `safety-gas1`–`4` | LPG density, locker drainage, leak response, isolation |

All IDs are unique, every intended index is in range, every entry has an
explanation, and catalogue tests lock the count at 24. Seeded option shuffling
retains each intended answer mapping. Percentage rounding is sound and 70% or
more passes; client-scored quiz answers intentionally award zero profile points.

Equal counts should not be mistaken for comprehensive competence coverage. The
bank has no ordered emergency-response task, equipment/defect image, MAYDAY/DSC
scenario, casualty monitoring/first-aid boundary, abandon-vessel decision,
flare firing-instruction check, gas detector/CO distinction, or question that
tests when vessel/manufacturer instructions override generic advice. It also
does not map questions to leaf objectives, so later edits can preserve `4 × 6`
while silently losing an important objective.

### Safety and answer accuracy

Most intended answers are directionally useful, including marking the MOB
position, neutral before a casualty reaches the propeller area, restricting air
to an engine-space fire, bringing a prepared grab bag, deploying a drogue/sea
anchor, using crotch straps and jackstays, draining LPG lockers overboard, and
avoiding ignition sources after a suspected gas leak. They still need review
against the six parent audits and vessel/manufacturer instructions before being
treated as a scored comprehensive standard.

Three entries require definite correction:

1. **`safety-raft3` has no universally correct option.** It says a liferaft
   “must” be serviced every three years and relegates annual service to some
   older rafts. RYA public guidance says to follow the manufacturer's
   instructions and use an approved agent. RYA training-vessel guidance is
   more specific and demonstrates the variation: qualifying canister rafts may
   be serviced at commissioning, year 3, year 5 or 6 and annually thereafter,
   while valise/ORC rafts are annual and service history changes the rule.
2. **`safety-flare2` asserts an unexplained universal minimum.** A six-flare
   combination may be a familiar recreational pack, but the question supplies
   no country, vessel length/use, voyage category or source. UK carriage
   requirements vary with vessel and distance, while commercial/training codes
   use different tables. “Within 7 miles of shore” does not by itself establish
   this exact scored answer.
3. **`safety-mob3` overclaims mechanism and terminology.** Current MCA/IMO
   recovery guidance supports horizontal or near-horizontal recovery where
   practicable and says vertical recovery risks cardiac arrest in hypothermic
   casualties. The item instead defines “Reflow Syndrome” through cold,
   “acidic” blood rushing from the legs to the heart. That mechanism is not
   established by the cited operational guidance and distracts from the
   actionable precaution. Ask about the recovery position and risk directly.

Additional review points should be resolved in the same bank correction rather
than spun into separate micro-issues: qualify broad “at all times on deck”
lifejacket wording as skipper/vessel/conditions policy; do not imply every
electrical or engine-space fire has one universally appropriate extinguisher;
make first MOB actions and return manoeuvre explicitly match the taught vessel
and conditions; and attach manufacturer-instruction boundaries to flare use,
extinguisher use, lifejackets, raft deployment and LPG systems.

### Explanations and assessment quality

- Every question supplies immediate explanation text, and Submit locks the
  selection before the explanation appears.
- Explanations usually repeat or expand the intended answer. They do not cite a
  source, state assumptions, explain each plausible distractor, or link to the
  relevant Safety leaf for remediation.
- Several distractors are obviously reckless (“light a match,” point a flare at
  a vessel, keep the propeller turning alongside). Those can test recognition
  without establishing a safe procedure.
- All 24 items are text-only single-answer recall. The balanced count therefore
  measures breadth of labels, not balanced depth or transfer to realistic
  emergencies.
- The bank is also reused by the practice exam and authenticated spaced review,
  so disputed wording is not confined to the orphaned topic URL.

### Scoring, retry, completion and persistence

- `countCorrectAnswers` compares selections with remapped shuffled indices;
  `percentageScore` safely handles an empty denominator; 70% passes.
- The header score changes on selection before Submit. Learners can cycle
  options until the score rises, revealing correctness. #157 owns this shared
  defect.
- Final Next enters completion; Retry clears answers, reshuffles, and starts a
  new authenticated attempt. Score-save success followed by progress-save
  failure stores recovery data and disables Retry until completion saving is
  retried.
- Authenticated partial progress uses `quiz-safety`. It persists shuffled
  numeric indices rather than stable question/option identities and accepts
  invalid finite answer values; #156 owns validation/versioning.
- Anonymous attempts are component-only and disappear on reload without an
  explicit warning; #194 owns the policy.
- Attempt-start RPC failure has no immediate visible status and is discovered
  only when completion cannot save; #209 owns this failure path. Catalogue load
  rejection does provide a retry and says progress is unchanged.
- Back and completion Home go to `/`, and the unavailable state offers
  **Nautical Terms**, not Safety. #155 owns contextual navigation.

### Responsive and accessibility assessment

Source structure uses a bounded container, responsive padding, wrapping option
text and stacked failure actions below `sm`, so no Safety-specific fixed-width
overflow was found. No browser, touch hardware, zoom, forced-colour or screen
reader run was performed; pixel-level responsiveness is therefore unverified.

The shared accessibility findings are directly visible in the markup: the
icon-only Back button has no accessible name; answer buttons expose no radio,
checked or pressed state; the progressbar has no contextual label; explanation
and result insertion do not manage announcement/focus; and advancing replaces
the focused button without deliberately moving focus to the next question.
#154 owns these shared fixes. No Safety-specific media accessibility defect
exists because this bank currently has no images or audio.

## Focused follow-up issue proposals

### 1. Make the Comprehensive Safety Quiz reachable from Safety Procedures

**Learner impact:** Learners can complete all six Safety leaves yet never
discover the registered comprehensive assessment; the only working entry is a
guessed/direct URL.

**Acceptance criteria:**

- Add a clearly named comprehensive-quiz action to `/safety` that navigates to
  the registry-declared `/quiz/safety` route without displacing the six leaves.
- Place it consistently with other module-wide quiz handoffs and describe that
  it covers all six Safety topics.
- Preserve responsive keyboard/touch operation and a visible focus indicator.
- Add a navigation-level test that fails if the Safety parent declares a
  `quizRoute` but the menu does not expose it; assert the accessible action name
  and destination.
- Define whether the action is always available or gated, and communicate any
  gate without equating card visits with mastery.

**Likely paths:** `src/pages/SafetyMenu.tsx`,
`src/pages/SafetyMenu.test.tsx`, `src/components/module-menu/`,
`src/constants/topicRegistry.ts`.

### 2. Correct and source the Comprehensive Safety Quiz bank

**Learner impact:** A high score currently rewards memorizing unsupported
universal servicing/carriage rules and a speculative cold-water-rescue
mechanism, which can transfer into unsafe real-world decisions and recur in
exam/review sessions.

**Acceptance criteria:**

- Replace `safety-raft3` with a question whose answer follows the raft's
  manufacturer-approved servicing schedule and explicitly represents relevant
  raft/package/service-history differences.
- Rewrite `safety-flare2` so its vessel type, jurisdiction and operating area
  establish a sourced carriage recommendation/requirement, or assess selecting
  equipment from the vessel's applicable guidance instead of memorizing an
  unexplained six-flare pack.
- Rewrite `safety-mob3` to assess horizontal or near-horizontal recovery where
  practicable and the cardiac-arrest risk of vertical recovery, without
  asserting an unsupported blood-chemistry mechanism.
- Review every remaining intended answer and explanation against authoritative
  current guidance plus the corrected six Safety leaves; state vessel,
  conditions and manufacturer assumptions wherever they affect correctness.
- Create and test an explicit `4 × 6` objective matrix, including applied
  emergency sequencing and stop/escalate/manufacturer-instruction boundaries,
  not just namespace counts.
- Add bank tests for the corrected critical answers/explanations and preserve
  unique stable IDs or provide a review-session migration/retirement plan.

**Likely paths:** `src/data/quizzes/safety.ts`,
`src/data/quizzes/quizData.test.ts`, new Safety bank integration tests,
`src/pages/Exam.tsx`, `src/features/spaced-repetition/`, and the six Safety
theory/data paths as alignment requires.

Existing shared issues #154–#157, #193, #194 and #209 should be linked rather
than duplicated.

## Verification

Focused Vitest run: **8 files, 162 tests passed** covering quiz data/catalogue,
randomization, scoring, session progress, progress keys, topic registry and
Safety menu. The run emitted only the existing Vite dynamic-import warning and
React server-render `useLayoutEffect` warnings. Browser interaction and a live
authenticated Supabase round-trip were not performed.

## Sources

- [RYA: Liferaft safety equipment and servicing](https://www.rya.org.uk/water-safety/safety-equipment/liferaft/)
- [RYA: Mandatory equipment / liferaft servicing examples](https://www.rya.org.uk/regulations/mandatory-equipment/general-exemption-life-saving-appliances/)
- [RYA: Training checklist for cruising vessels](https://www.rya.org.uk/media/u24m2pqv/3d6_training_checklist_cruising.pdf)
- [MCA: MGN 544 Amendment 1, recovery from the water](https://www.gov.uk/government/publications/mgn-544-amendment-1-mf-means-of-recovery-of-persons-from-the-water-by-ships-and-boats-plans-procedures-and-acceptance-of-recovery-equipment/mgn-544-amendment-1-annex-1)
- [GOV.UK: Pleasure-boat safety equipment depends on vessel and operating area](https://www.gov.uk/owning-a-boat/safety-at-sea)
