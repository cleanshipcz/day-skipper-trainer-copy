# Steering & Sailing Rules learner-facing audit

- Audit issue: [#101](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/101)
- Route/topic: `/rules/colregs` / `colregs-theory`
- Audited: 2026-07-31
- Primary implementation: `src/pages/ColregTheory.tsx`
- Parent navigation: `src/pages/RulesOfTheRoadMenu.tsx`
- Related quiz: `src/data/quizzes/colregs.ts`, `src/pages/Quiz.tsx`
- Completion: `src/features/progress/useTheoryCompletionGate.ts`

## Verdict

**This page is a useful nine-card aide-mémoire, but it is not a safe or
complete lesson on Part B (Rules 4–19).** It is registered and reachable from
Rules of the Road, several short statements closely paraphrase the Rules, four
diagrams reinforce common encounters, and scrolling unlocks durable topic
completion. However, Rules 4, 11 and 19 are wholly absent; Rules 5–10 and 12–18
are reduced enough to omit important conditions, duties and follow-through.

The most serious defect is the Rule 18 “Hierarchy.” COLREG does not establish
the displayed universal linear order of “stand-on priority.” Rule 18 contains
specific keep-out-of-way and avoid-impeding responsibilities, expressly
subject to Rules 9, 10 and 13. Constrained-by-draught, seaplane and WIG duties
do not fit the list as drawn. The page also says a stand-on vessel must act only
when collision is “inevitable,” materially later and differently than Rule
17(b)'s duty when collision cannot be avoided by the give-way vessel's action
alone.

There is no observation-to-action method: no systematic lookout/risk appraisal,
relative-bearing exercise, encounter classification, safe-distance monitoring,
restricted-visibility decision flow, or check that avoiding action remains
effective until past and clear. Four raster diagrams have generic alt text and
no bearings, headings, wind, relative motion, risk trigger or accessible
equivalent. The linked 20-question quiz spans Parts A, B, C and D; only nine
questions are directly taught here, and the parent menu's Lights & Signals
module does not make the three Rule 3 definition questions visible
prerequisites.

Finally, reaching 80% page scroll marks the sole section visited. Completion
can therefore be unlocked without reading or understanding anything, save
failure is ignored, and the page navigates away after `markCompleted` whether
or not persistence succeeded.

## Evidence and audit bounds

### Method

The page, all four theory images, parent navigation, route/registry, completion
gate, shared progress behavior, 20-question linked bank and relevant tests were
inspected directly. The text was compared rule-by-rule with the current IMO
COLREG overview and the US Coast Guard's official International Navigation
Rules text/handbook.[^imo][^uscg][^handbook]

The image assets were inspected at their native 1024×1024 resolution.
Typecheck, lint, production build, focused completion/catalogue tests and the
internal-artifact guard were run. A browser session was not run within this
bounded audit, so pixel-level responsive layout, actual keyboard focus,
screen-reader announcements, touch behavior, zoom/reflow and live persistence
are not claimed as runtime-verified. Static DOM/classes were assessed at the
requested phone-to-desktop range; the proposals require browser coverage.

### Reachability and implemented flow

- `/rules/colregs` is a lazy registered child of `rules-of-the-road`. The parent
  card describes Part B and routes correctly; Back returns to that parent.
- The sticky header labels the page **Part B - Rules 4-19**, but the body starts
  at Rule 5 and ends at Rule 18.
- A scroll listener computes `(viewport bottom / document height) * 100`. At
  80%, it marks the only required section, `read-content`, visited.
- `canComplete` then enables **Complete Module**. Activation awaits
  `markCompleted()` and unconditionally navigates to `/rules-of-the-road`.
- `markCompleted` awaits `saveProgress` but neither it nor the page checks the
  returned success Boolean. Save rejection is not caught locally. There is no
  loading, saving, failure, retry, offline, returning-completed or identity
  change state on this page.
- The page has no learner interaction beyond scrolling, Back and Complete. It
  does not link directly to the relevant quiz or Lights module.

## Rule-by-rule accuracy and completeness

### Missing scope and foundational responsibility

- **Rule 2** is outside Part B but indispensable framing: nothing exonerates a
  vessel, owner, master or crew from neglect of the Rules or ordinary seaman
  practice, and special circumstances/immediate danger may require departure.
  “Stand-on” and “priority” must not be taught without that responsibility.
- **Rule 4** (Rules 4–10 apply in any visibility) is missing.
- **Rule 11** (Rules 11–18 apply only when vessels are in sight of one another)
  is missing. Without it, learners can apply crossing/head-on/stand-on rules in
  fog where Rule 19 governs instead.
- **Rule 19** is missing despite the Part B title. The page never teaches
  restricted-visibility safe speed, engines ready, radar-only avoidance limits,
  fog-signal response, minimum speed/taking all way off or extreme caution.

### Rules 5–10: any visibility

- **Rule 5:** The paraphrase omits that lookout must be maintained “at all
  times,” appropriate to prevailing circumstances/conditions, for full
  appraisal of both situation and collision risk. It gives no practical scan,
  hearing, radar/AIS limitation, blind-sector, fatigue/distraction or
  communication method.
- **Rule 6:** The stopping-distance principle is correct but omits every stated
  factor: visibility, traffic, manoeuvrability, background light, wind/sea/
  current/hazards, draught and radar-specific limitations. Safe speed is not a
  fixed number and must be continually reassessed.
- **Rule 7:** “Constant bearing, decreasing range” is useful but narrower than
  the Rule. Assumptions must not be based on scanty information, especially
  scanty radar information; systematic observation/plotting is expected where
  appropriate; risk can exist despite bearing change for a large vessel, tow
  or close-range encounter.
- **Rule 8:** Positive, ample-time and readily apparent action is accurate, but
  the page omits avoiding successive small alterations; safe passing distance;
  checking effectiveness until finally past and clear; slowing/stopping/
  reversing where necessary; and the continuing interaction between
  “not impede” and collision-risk duties.
- **Rule 9:** The sentence contains the typo “sailing vessels implies must.”
  More importantly, a vessel under 20 m or sailing vessel must not impede a
  vessel that can safely navigate only in the channel/fairway; it is not a
  generic “small vessels give way” rule. Fishing, crossing, anchoring,
  bend/obstruction sound signals and overtaking agreement are absent.
- **Rule 10:** “Cross at right angles” must be **as nearly as practicable** and
  applies to crossing traffic lanes on a heading. Normal join/leave behavior,
  separation lines/zones, inshore traffic zones, not-impeding traffic flow,
  fishing/anchoring and exemption context are compressed into slogans.

### Rules 12–18: vessels in sight

- **Rule 12:** The two common cases are correct, but the third case is absent:
  a port-tack vessel unable to determine whether the windward vessel has wind
  on port or starboard must keep out of the way. Wind side for a square-rigger
  is not explained.
- **Rule 13:** The core duty correctly applies to any vessels, but “overtaking”
  is not defined as approaching more than 22.5° abaft the beam. Doubt must be
  resolved by assuming overtaking, and later bearing alteration does not
  relieve the overtaking vessel until finally past and clear.
- **Rule 14:** The statement omits “nearly reciprocal,” the aspect/masthead/
  sidelights test and the duty to assume head-on when in doubt.
- **Rule 15:** The starboard-side give-way rule is correct for two
  power-driven vessels in sight with risk of collision, but the give-way vessel
  should, if circumstances admit, avoid crossing ahead. The mnemonic risks
  being applied without first establishing vessel type, visibility and risk.
- **Rule 16:** Early and substantial action is correct but must be tied to
  keeping well clear and monitored under Rule 8.
- **Rule 17:** “Keep course and speed” is only paragraph (a)(i). The stand-on
  vessel may act as soon as apparent the give-way vessel is not taking
  appropriate action. When collision cannot be avoided by the give-way vessel's
  action alone, she **shall** take action best aiding avoidance. That is not
  “if collision is inevitable.” The crossing-vessel proviso against altering
  to port for a vessel on her own port side is absent.
- **Rule 18:** The linear “Order of priority (Stand-on over vessels below)” is
  unsafe. Subject to Rules 9, 10 and 13, power-driven, sailing and fishing
  vessels have enumerated duties toward NUC/RAM and other categories. CBD
  receives an avoid-impeding duty from vessels other than NUC/RAM where
  circumstances admit, not a universal stand-on rank. A seaplane generally
  keeps well clear; WIG craft have mode-specific duties. Fishing does not gain
  blanket priority while not “engaged in fishing” as Rule 3 defines it.

The mnemonic “New Reels Catch Fish So Quick” also has seven displayed
categories but only six mnemonic words, provides no WIG mapping, and turns
conditional responsibilities into a memorized right-of-way ladder. The USCG
FAQ explicitly cautions against a general “right of way” framing.[^faq]

## Scenarios and visuals

The four square raster images are clean enough at native size but pedagogically
under-specified:

- `sailing.png` is labelled only **Sailing Rules** in alt text. It does not
  expose wind direction, tack, windward/leeward relationship, headings, give-way
  action or a text-equivalent scenario.
- `quiz_overtaking.png` is reused from the quiz and labelled only
  **Overtaking**. The page does not teach the 22.5° boundary, aspect change,
  doubt test or “past and clear.”
- `headon.png` is labelled only **Head On**. It does not state power-driven,
  in-sight, reciprocal/nearly reciprocal or risk-of-collision assumptions.
- `crossing.png` uses red/green vessel fills and arrows rather than standard
  navigation-light evidence. The route/action is not narrated; colour-vision
  and non-visual learners receive only **Crossing**.

No image is interactive. There is no scenario variation, relative-motion
plot, compass-bearing observation, feedback, replay or transfer from diagram
to night lights/radar/restricted visibility. Decorative water textures add
visual noise without replacing bearings or geometry.

## Completion, persistence and edge states

- Scroll depth is a poor proxy for reading: a short viewport, End key, browser
  restoration or layout change can unlock completion without engaging any rule.
- The single required section supplies no stable rule/objective identity.
  Revising or reordering content cannot identify what a returning learner saw.
- In-progress persistence fires once when the 80% threshold is crossed.
  Returning visited state is not loaded into the hook, so reload starts the
  local gate locked even if remote progress exists.
- Completion awards ten points through shared progress, but the page navigates
  away without proving the save succeeded. Repeated completion/reward
  idempotency is delegated to backend behavior and not communicated.
- Save failure, offline queuing, delayed save, double activation, unmount,
  owner change and malformed/empty content have no page-specific tests or UI.

## Theory-to-quiz alignment

The linked Rules of the Road quiz is a combined 20-question assessment. Direct
coverage from this page is limited to:

- `cr1` Rule 18 responsibilities, but it repeats the misleading hierarchy;
- `cr2` overtaking;
- `cr3`/`cr4` crossing/stand-on using lights not taught on this page;
- `cr5` same-side sailing;
- `cr10` safe speed;
- `cr11` head-on;
- `cr14` the non-statutory “danger side” simplification;
- `cr20` narrow channels.

The other eleven assess Rules 3, 23, 25, 30, 34 and 35: vessel definitions,
power/sailing/oar lights, manoeuvring signals, anchor shape and fog signals.
Lights & Signals is a sibling module and appropriately owns much of Parts C/D,
but `cr12`, `cr13` and `cr16` test Rule 3 definitions not taught here, and the
quiz can be opened directly without completing either sibling. The menu says
“20+” although the bank contains exactly 20.

Question quality also needs coordinated review:

- every source `correctAnswer` is index 0 (runtime shuffling hides the visible
  pattern but not weak authoring discipline);
- many distractors are absurd rather than plausible encounter errors;
- `cr1` explanation overstates “routinely gives way” and inherits the hierarchy;
- `cr3` asserts risk from one red-light image without teaching systematic risk
  appraisal;
- `cr4` says maintain course/speed without Rule 17 escalation;
- `cr14` turns a mnemonic into a “danger side” rule;
- scenarios omit visibility, vessel status, relative bearing/range and whether
  risk of collision exists.

Existing shared quiz issues #154–#157, #193, #194 and the pending
attempt-start proposal in `RIG_QUIZ_AUDIT.md` apply to shell accessibility,
navigation, persistence identity, score oracle, catalogue validation, anonymous
policy and start recovery. They should be reused, not duplicated here.

## Accessibility, responsive behavior and input

Positive foundations:

- semantic headings/lists/cards give a readable source order;
- Back and Complete are native buttons;
- text accompanies icons and diagrams are not required to activate controls;
- grids collapse below `md`, and images use `max-w-full`.

Defects and unverified risks:

- the icon-only Back button has no accessible name;
- image alt text names topics but conveys none of the instructional content;
- red/green/yellow/blue/grey carry hierarchy and vessel meaning without a
  non-colour visual encoding;
- the disabled completion control does not explain the 80% threshold beyond
  changing button text, and the unlock/save result is not announced;
- sticky header, long rule text, badges and two-column image cards require
  actual 320 px/high-zoom/localization testing;
- completion focus/navigation after saving is not managed;
- no skip links or rule-level landmarks/contents support navigating a long
  static page;
- colour contrast and reduced-motion behavior were not measured.

## Focused follow-up issue proposals

### 1. Correct and complete Steering & Sailing Rules 4–19

**Proposed issue:** _pending_

**Proposed title:** `Correct and complete Steering & Sailing Rules 4–19`

**Body:**

> ## Context
>
> `/rules/colregs` claims Part B Rules 4–19 but omits Rules 4, 11 and 19,
> materially truncates other duties, delays Rule 17 mandatory action until
> collision is called “inevitable,” and presents Rule 18 as a universal linear
> priority hierarchy.
>
> ## Learner impact
>
> Learners can apply in-sight rules in fog, claim stand-on priority where only
> conditional duties exist, act too late, or fail to monitor avoiding action.
>
> ## Acceptance criteria
>
> - Teach the Part B structure: Rules 4–10 any visibility, 11–18 in sight, and
>   Rule 19 restricted visibility; include Rule 2 responsibility framing.
> - Correct every Rule 5–18 summary with its material conditions, doubt tests,
>   not-impede duties, action/monitoring and safe-distance requirements.
> - Replace the Rule 18 hierarchy with an accurate responsibility decision
>   model subject to Rules 9, 10 and 13, including CBD, seaplane and WIG nuance.
> - Correct Rule 17's may/shall stages and crossing proviso.
> - Cite/version authoritative COLREG sources and clearly distinguish mnemonics
>   from rule text.
> - Add rule-level content tests for critical visibility, Rule 17 and Rule 18
>   safety statements.
>
> ## Relevant paths
>
> - `src/pages/ColregTheory.tsx`
> - new structured rule data/tests as appropriate

### 2. Add applied, accessible COLREG encounter exercises and diagrams

**Proposed issue:** _pending_

**Proposed title:** `Add applied, accessible COLREG encounter exercises and diagrams`

**Body:**

> ## Context
>
> Four generic raster images omit headings, bearings, range, wind, visibility,
> risk and narrated action. The page has no exercise for lookout, collision-risk
> appraisal, encounter classification, avoiding action or follow-through.
>
> ## Learner impact
>
> Learners can memorize slogans without being able to establish which rule
> applies or choose/monitor safe action in a real encounter.
>
> ## Acceptance criteria
>
> - Replace/augment images with accurate labelled scenarios defining vessel
>   type/status, visibility, relative bearing/range/course, risk assumptions
>   and applicable rule.
> - Teach an observation-to-action workflow through varied sailing, overtaking,
>   head-on, crossing, narrow-channel/TSS and restricted-visibility cases.
> - Require classification, give-way/stand-on responsibilities, early
>   substantial action and monitoring until past and clear; include doubt and
>   no-risk/insufficient-information cases.
> - Use geometry/navigation lights consistently and avoid colour-only meaning.
> - Supply equivalent text/data descriptions, keyboard/touch parity, meaningful
>   feedback and reduced-motion support.
> - Test scenario truth, state transitions, input methods and responsive
>   rendering.
>
> ## Relevant paths
>
> - `src/pages/ColregTheory.tsx`
> - `public/images/colregs/`
> - new scenario components/data/tests

### 3. Make COLREG theory completion evidence-based and save-aware

**Proposed issue:** _pending_

**Proposed title:** `Make COLREG theory completion evidence-based and save-aware`

**Body:**

> ## Context
>
> Scrolling until the viewport bottom reaches 80% marks the only section
> visited. Completion ignores `saveProgress`'s success result and navigates away
> after failure; returning visited state is not loaded.
>
> ## Learner impact
>
> Progress can claim mastery without engagement, disappear or duplicate
> rewards, and give no recovery path when offline or saving fails.
>
> ## Acceptance criteria
>
> - Define stable rule/objective sections and require meaningful review/applied
>   checks rather than raw scroll depth.
> - Load/resume/migrate visited state for anonymous and authenticated learners
>   under the supported persistence policy.
> - Expose saving/saved/queued/failed states; navigate only after confirmed or
>   honestly queued completion and provide retry without duplicate points.
> - Handle reload, browser restoration, rapid activation, owner change,
>   catalogue revision and offline reconciliation deterministically.
> - Add component/integration tests for gate evidence, resume, save false/
>   rejection, retry, idempotency and navigation.
>
> ## Relevant paths
>
> - `src/pages/ColregTheory.tsx`
> - `src/features/progress/useTheoryCompletionGate.ts`
> - shared progress/persistence tests

### 4. Align the combined Rules quiz with explicit prerequisites and safe theory

**Proposed issue:** _pending_

**Proposed title:** `Align the combined Rules quiz with explicit prerequisites and safe theory`

**Body:**

> ## Context
>
> Only nine of 20 quiz questions map directly to `/rules/colregs`; eleven rely
> on Parts A/C/D, including three Rule 3 definitions not taught by either
> visible prerequisite. Several scenario answers inherit unsafe theory
> simplifications.
>
> ## Learner impact
>
> The assessment contains hidden curriculum and rewards slogans instead of
> evidence-based collision avoidance.
>
> ## Acceptance criteria
>
> - Publish a question-to-objective/prerequisite matrix across Steering &
>   Sailing and Lights & Signals; teach every retained objective first.
> - Correct Rule 18, crossing-risk, Rule 17 and “danger side” explanations in
>   coordination with the theory fix.
> - Add plausible distractors and applied scenarios with sufficient facts to
>   establish visibility, vessel status, encounter and collision risk.
> - Require both learning prerequisites or clearly present the quiz as
>   diagnostic with targeted remediation links.
> - Correct menu count/copy and return learners to the relevant parent/section.
> - Add objective-coverage and critical-answer tests; reuse shared quiz-shell
>   issues rather than duplicating them.
>
> ## Relevant paths
>
> - `src/pages/ColregTheory.tsx`
> - Lights & Signals theory routes/data
> - `src/data/quizzes/colregs.ts`
> - `src/pages/Quiz.tsx`
> - `src/pages/RulesOfTheRoadMenu.tsx`

### 5. Make Steering & Sailing Rules accessible and responsive

**Proposed issue:** _pending_

**Proposed title:** `Make Steering & Sailing Rules accessible and responsive`

**Body:**

> ## Context
>
> Back is unnamed, instructional images have generic alt text, vessel/hierarchy
> meaning relies on colour, and completion/unlock/save changes are not
> deliberately announced. Narrow/high-zoom behavior is unverified.
>
> ## Learner impact
>
> Non-visual, colour-vision, keyboard, mobile and large-text learners do not
> receive equivalent rule/scenario information or reliable progress feedback.
>
> ## Acceptance criteria
>
> - Name icon-only controls and expose page/rule navigation with semantic
>   landmarks or contents appropriate to the long lesson.
> - Give every instructional visual an equivalent structured text description;
>   never rely on colour alone.
> - Announce gate, save and completion states without disruptive focus changes;
>   preserve visible focus and a predictable return path.
> - Verify 320 px, 200%/400% zoom, long localization, touch/keyboard, screen
>   reader, forced colours, contrast and reduced motion.
> - Ensure cards, headings, badges, images and controls reflow without clipping
>   or document-level horizontal overflow.
> - Add automated accessibility/component tests plus documented browser checks.
>
> ## Relevant paths
>
> - `src/pages/ColregTheory.tsx`
> - `public/images/colregs/`
> - shared progress/navigation components

## Authoritative sources

All sources were accessed 2026-07-31.

[^imo]: International Maritime Organization, [“Convention on the International
  Regulations for Preventing Collisions at Sea, 1972
  (COLREGs)”](https://www.imo.org/en/about/conventions/pages/colreg.aspx),
  technical overview and Part B structure.
[^uscg]: United States Coast Guard Navigation Center, [“Amalgamated Navigation
  Rules — International & U.S.
  Inland”](https://www.navcen.uscg.gov/navigation-rules-amalgamated), current
  International Rules text, Rules 2–19.
[^handbook]: United States Coast Guard, [“Navigation Rules and Regulations
  Handbook, corrected 8 August
  2024”](https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf).
[^faq]: United States Coast Guard Navigation Center, [“Navigation Rules
  Frequently Asked
  Questions”](https://www.navcen.uscg.gov/navigation-rules-faqs), question 5,
  **“Who has the right of way on the water?”**
