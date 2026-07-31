# Rules of the Road Quiz learner-facing audit

- Audit issue: [#103](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/103)
- Route/topic: `/quiz/colregs` / `colregs`
- Audited: 2026-07-31
- Quiz shell: `src/pages/Quiz.tsx`, `src/features/quiz/`
- Question bank: `src/data/quizzes/colregs.ts`
- Registry/navigation: `src/data/quizzes/index.ts`, `src/pages/RulesOfTheRoadMenu.tsx`

## Verdict

**This is a reachable 20-question revision quiz, but it is not a valid or safe
assessment of the Rules of the Road in its current form.** Loading, option
shuffle, submit feedback, score calculation and the 70% pass threshold work.
The production build is healthy, and existing unit tests cover the registry,
shuffle, arithmetic and persistence helpers.

The bank samples only Rules 3, 6, 9, 12–16, 18, 23, 25, 30, 34 and 35. It
omits foundational lookout, risk-of-collision and avoiding-action assessment,
Rule 17's complete stand-on obligations, traffic separation, restricted
visibility collision avoidance and most responsibilities, lights, shapes and
signals. Eleven questions depend on material outside the visible Steering &
Sailing prerequisite, including three Rule 3 definitions taught by neither
visible prerequisite.

Several retained answers reward unsafe shortcuts. A single red or green
sidelight does not establish risk of collision, vessel propulsion/status or
that Rules 15 and 17 apply; nevertheless `cr3` commands give-way action and
`cr4` commands maintaining course and speed. `cr14` turns the non-COLREG
mnemonic “danger side” into an absolute answer. `cr1` presents Rule 18 as a
simple hierarchy without its Rule 9, 10 and 13 qualifications or responsibilities
between all vessel types. `cr9` teaches exactly five short blasts rather than
at least five short and rapid blasts. Most explanations restate the selected
rule fragment without addressing applicability, collision risk, required
action, exceptions or why distractors are wrong.

The six image questions use uncredited raster composites with the same
non-descriptive `alt="Quiz Scenario"`. Important labels and scenario facts are
baked into pixels. The sailing windward image does not identify Boat A or Boat
B even though the answer requires those labels. None of the encounter images
supplies bearing history or an equivalent fact establishing risk of collision.

The shared shell also allows the live Score badge to reveal the answer before
Submit, persists shuffled array indices rather than stable answer identities,
silently loses anonymous attempts, does not recover an attempt-start failure,
and returns to global Home rather than Rules of the Road. At 375 CSS px the
header/card exceeded the viewport: the score was off-screen and the question,
answers and Submit control were clipped to the right. Selection, progress,
feedback and focus transitions are not exposed robustly to assistive
technology. These shared defects already have focused remediation issues.

## Evidence and audit bounds

### Method

The parent route, registry, complete 20-item source bank, all six source images,
shared scoring/randomization/session/progress code and relevant tests were
inspected directly. Rule claims were checked against the current official US
Coast Guard International Rules amalgamation and corrected Navigation Rules
and Regulations Handbook, with the IMO COLREG overview used to confirm
convention scope.[^uscg][^handbook][^imo]

Typecheck, lint, the production build and 130 targeted quiz/data tests passed.
The built app was served with a placeholder local Supabase endpoint and opened
in headless Chromium at 375, 768 and 1280 CSS px. A fresh anonymous load was
used, so no live score/progress RPC or authenticated recovery claim is made.

Observed browser results:

- `/quiz/colregs` loaded a shuffled bank as **Colregs Quiz**, with
  **Question 1 of 20**, four native answer buttons, disabled Submit and
  **Score: 0/20** where the viewport allowed it.
- At 768 and 1280 px the initial text-only question fitted the viewport.
- At 375 px the main card extended past the right viewport edge. The question
  text, every option and Submit were visibly clipped, while the header Score
  badge was outside the screenshot.
- The shared header Back control rendered only an arrow and has no accessible
  name in source.
- Runtime rendering required placeholder backend configuration. No live
  persistence request was relied upon.

Authenticated save/retry round-trips, offline reconciliation, actual touch
hardware, screen-reader output, forced colours, high zoom and full completion
of all randomized image states were not exercised. Source-level behavior and
existing component/unit coverage are identified separately below.

## Reachability, scope and prerequisite alignment

- Rules of the Road exposes **Rules of the Road Quiz** at `/quiz/colregs`; the
  route and asynchronous catalogue resolve the correct 20-question bank.
- The parent copy says “20 questions covering all topics,” but only nine items
  map directly to the sibling Steering & Sailing lesson. Five assess Parts
  C/D, and six assess Rules 3, 6 and 9; the route does not require both theory
  leaves or describe itself as a diagnostic.
- There is no question-to-objective matrix. Stable count/shape tests preserve
  20 items and valid indices but cannot fail when critical objectives disappear
  or an unsafe answer is introduced.
- Material omissions include Rules 5, 7, 8, 10, 17's escalation duties, 19,
  towing/fishing/RAM operation-specific configurations, most Rules 20–37 and
  the conditions and exceptions surrounding sampled rules.
- All source correct answers are index zero. Runtime option shuffle prevents a
  fixed visible position, but this authoring pattern makes the unshuffled bank
  fragile and current tests check shape rather than content.

## Question and explanation accuracy

### Collision avoidance and responsibilities

- **`cr1` / Rule 18:** among the four listed statuses a power-driven vessel is
  ordinarily the give-way answer, but “hierarchy” and “keep clear of all”
  obscure that Rules 9, 10 and 13 govern first and that Rule 18 contains
  reciprocal responsibilities and constraints. The explanation adds NUC and
  CBD although they are not options and treats the ordering as absolute.
- **`cr2` / Rule 13:** the core answer is correct. It does not test the
  definition of overtaking, doubt treatment or the continuing duty until
  finally past and clear.
- **`cr3` / Rules 7, 15 and 16:** seeing red on the starboard bow can be
  consistent with a crossing power-driven vessel, but does not by itself prove
  propulsion/status or risk of collision. No bearing trend is provided. The
  answer embeds “risk exists” and commands giving way from insufficient facts.
- **`cr4` / Rules 7, 15 and 17:** green on the port bow has the same missing
  applicability/risk facts. “Maintain course and speed” is incomplete without
  Rule 17(a)(ii)'s permitted action, Rule 17(b)'s mandatory action when
  collision cannot be avoided by give-way action alone, and Rule 2.
- **`cr5` / Rule 12:** the same-tack windward rule is correct, but the image
  contains no A/B labels and does not clearly establish which named boat is
  windward. Other Rule 12 cases are unassessed.
- **`cr10` / Rule 6:** the answer quotes only the effective-action limb of safe
  speed and omits stopping within an appropriate distance and the required
  factors. It is a recognition prompt, not a safe-speed decision.
- **`cr11` / Rule 14:** starboard alterations and port-side passing are
  correct for two power-driven vessels meeting on reciprocal/nearly reciprocal
  courses involving risk. Those applicability facts and Rule 14(c) doubt are
  missing from the question.
- **`cr14`:** “danger side” and “Right is Might” are not COLREG requirements.
  A vessel on the starboard side is not automatically a Rule 15 give-way case;
  propulsion/status, crossing geometry and risk matter, and Rule 17 still
  imposes evolving duties on the other vessel.
- **`cr20` / Rule 9:** the selected statement is substantially correct, but
  “general rule regarding small vessels” merges vessels under 20 m with sailing
  vessels and omits fishing/crossing non-impediment duties and channel conduct.

### Definitions, lights, shapes and sound

- **`cr12`, `cr13`, `cr16` / Rule 3:** the selected definitions are broadly
  correct. `cr13` adds “breakdown” as a parenthetical example but does not teach
  the boundary between NUC and RAM. None is covered by the visible lessons.
- **`cr6` / Rule 23:** the ahead-aspect image is consistent with a power-driven
  vessel under 50 m showing one masthead light and sidelights. “Only requires”
  should not imply a second masthead light is prohibited, and size-specific
  alternatives/context are absent.
- **`cr7` / Rule 25:** the basic sailing configuration is correct, subject to
  small-vessel alternatives and the fact that optional red-over-green lights
  may also be shown. One raster aspect is not meaningful recognition coverage.
- **`cr15` / Rule 25(d)(ii):** the selected ready-at-hand white
  torch/lantern alternative is correct, but the sailing-light option is also
  permitted; wording “must” makes the first answer look exclusive unless
  “if not” in the explanation is read carefully.
- **`cr17` / Rule 30:** one ball in the fore part is correct for a vessel at
  anchor, subject to the under-7 m exception. Larger-vessel and aground
  requirements are not assessed.
- **`cr8` / Rule 34:** one short blast is correct only in the in-sight,
  power-driven-vessels-underway context. The prompt omits that context.
- **`cr9` / Rule 34(d):** the rule requires **at least five short and rapid
  blasts**. Both prompt and explanation reduce that to exactly “5 short.”
- **`cr18`–`cr19` / Rule 35:** the core power-driven making-way/stopped signals
  are correct, but “every 2 minutes” should be “at intervals of not more than
  two minutes.” The bank omits the other major restricted-visibility signals.

## Visual and assessment quality

- `cr2`–`cr7` reference 169–789 KB raster images. Every image receives the
  generic alt “Quiz Scenario”; embedded direction, vessel, side/light, degree
  and A/B facts have no structured text equivalent.
- The two crossing images depict one instantaneous view and do not establish
  steady bearing/appreciably changing bearing. They reinforce deciding solely
  from sidelight colour.
- The windward/leeward image contains two unlabeled near-identical sailboat
  icons and one wind arrow. It cannot support “Boat A” versus “Boat B.”
- The light diagrams identify memorized configurations but do not test aspect
  changes, optional/alternative configurations, range, vessel activity or
  ambiguity.
- Fourteen questions are pure text recall. Distractors are often jokes or
  obviously unrelated, explanations rarely diagnose the learner's choice, and
  there is no remediation link back to the exact theory/rule.

## Scoring, retry, completion and persistence

- Options and questions are deterministically shuffled per in-memory seed;
  remapping preserves the correct source answer. Retry clears answers and
  increments the seed.
- `countCorrectAnswers` reads tentative `answers` immediately. Because
  selecting an option persists it before Submit, the live Score badge acts as
  an answer oracle: cycling options reveals which one is correct.
- Percentage is rounded and `>=70` passes (14/20). Client answers authorize no
  profile points, which is an appropriate trust boundary; the server-issued
  attempt RPC owns score submission.
- Authenticated in-progress state saves shuffled numeric option indices.
  Hydration accepts any finite number and has no question/option identity or
  catalogue version, so malformed or changed banks can silently reinterpret
  answers.
- Anonymous progress is component-only and disappears on reload/navigation.
- Attempt-start RPC failure is silently ignored until completion. The visible
  completion retry repeats completion against the still-null workflow instead
  of retrying attempt creation.
- Score submission and final progress save are separate. A successful score
  followed by failed progress save keeps a local recovery workflow and offers
  retry; review-schedule failure is separately surfaced. A real backend was
  not used to validate ambiguous network outcomes or server idempotency.

## Accessibility, responsive behavior and failure states

Positive foundations include native answer/action buttons, visible text
feedback, a catalogue loading state, an unavailable state with a chunk retry,
and explicit completion/review-sync error alerts.

Material shared-shell gaps remain:

- Back is icon-only with no accessible name.
- The answer set exposes neither radio-group semantics nor selected state.
- Progress has no contextual label in this page, and inserted feedback/focus
  transitions are not deliberately announced or managed.
- All images use identical generic alternative text; essential raster text and
  geometry are inaccessible.
- At 375 px the header/card is wider than the viewport, clipping learning
  content and controls. The score disappears off-screen.
- Hover scaling and animated explanation insertion lack page-level
  reduced-motion handling; high zoom/forced-colour behavior is unverified.
- Catalogue errors are recoverable, but attempt-start failure is silent and
  completion save/review sync errors appear only after the full run.

## Follow-up issues

No duplicate issues were created. Existing focused work fully covers the
findings:

1. [#214 — Align the combined Rules quiz with explicit prerequisites and safe theory](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/214)
2. [#154 — Restore quiz focus and expose answer/progress state accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
3. [#155 — Return topic quizzes to their parent module instead of global Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
4. [#156 — Validate persisted quiz answers against stable question and option identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
5. [#157 — Do not reveal quiz correctness through the live score before submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
6. [#194 — Define privacy-safe anonymous quiz attempt persistence and recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/194)
7. [#209 — Surface and recover authenticated quiz attempt-start failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/209)

Content fixes in #214 should coordinate with the Steering & Sailing and Lights
& Signals remediation issues linked by audits #101 and #102 rather than
preserving contradictions between theory and assessment.

## Authoritative sources

All sources were accessed 2026-07-31.

[^uscg]: United States Coast Guard Navigation Center, [“Amalgamated Navigation
  Rules — International & U.S.
  Inland”](https://www.navcen.uscg.gov/navigation-rules-amalgamated), current
  International Rules text, especially Rules 2–19, 23, 25, 30, 34 and 35.
[^handbook]: United States Coast Guard, [“Navigation Rules and Regulations
  Handbook, corrected 8 August
  2024”](https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf).
[^imo]: International Maritime Organization, [“COLREG — Preventing collisions
  at sea”](https://www.imo.org/en/ourwork/safety/pages/preventing-collisions.aspx),
  convention scope, structure and amendments.
