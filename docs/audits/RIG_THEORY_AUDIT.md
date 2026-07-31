# Rig Checks & Preparation learner-facing audit

- Audit issue: [#99](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/99)
- Route/topic: `/rig` / `rig`
- Audited: 2026-07-31
- Primary implementation: `src/pages/RigTheory.tsx`
- Checklist catalogue: `src/data/rigChecks.ts`
- Related quiz: `src/data/quizzes/rig.ts`, `src/pages/Quiz.tsx`
- Related registry/route: `src/constants/topicRegistry.ts`, `src/app/routes.tsx`

## Verdict

**This is a short, clickable inspection prompt, not yet a safe or complete rig
preparation lesson.** The registered route is reachable, the twelve labelled
checkboxes cover several useful deck-level observations, and completing them
reveals the registered Rig quiz. However, a learner can irreversibly click
through every item without inspecting a yacht, identify a defect but still
receive “Ready for the quiz,” and lose every check and point on navigation or
reload. Nothing reaches shared progress, and an empty catalogue immediately
claims completion.

The safety and technical guidance is too universal for the range of stayed
yacht rigs. “Threads not showing,” equal port/starboard tension, cap shrouds
tighter than lowers, a straight mast with slight fore-and-aft bend, annual
aloft inspection, and a survey every five years are presented without the
installed rig design, spar/rigging maker instructions, survey history or
operating conditions. Several prompts invite hands-on checking without
explaining unloaded versus loaded components, sharp broken wire, stored-energy
and fall hazards, or when the boat must not sail. “Mast” incorrectly contains
halyards, while “Running Rigging” contains the boom and hardware.

There is no rig diagram, defect photograph, normal/abnormal comparison, guided
walk-round, passage-preparation sequence or defect disposition. The linked
quiz repeats several unsupported rules and tests five concepts the page never
teaches. Targeted work is needed on safe, configuration-aware content; a
practical visual lesson; honest durable completion; theory/quiz alignment; and
accessibility/responsive behavior.

## Evidence and exercised paths

### Method and scope

The route, topic registry, home navigation data, page state transitions,
checklist catalogue, shared progress architecture, linked quiz bank, quiz shell
and preceding audit patterns were inspected directly. A production build using
local placeholder Supabase configuration (no credentials or live backend) was
served locally and exercised in headless Chromium through the Chrome DevTools
Protocol with a clean browser profile. The content was compared with current
World Sailing offshore requirements, Seldén's rigging and tuning instructions,
RYA overhead-line advice, and an MAIB dismasting case. Focused catalogue tests,
typecheck, lint, production build and the internal-artifact guard were run.

Observed and source-confirmed behavior:

- `/rig` is a lazy route and a registered root topic. Its registry entry points
  to `/quiz/rig`, and the page's completion action targets that same route.
- The page starts at 0/12 and 0 local points. Each first activation awards
  eight points, so twelve activations produce 12/12 and 96 points.
- Activating a checked Radix checkbox requests `false`, but the handler ignores
  the requested value and only changes currently unchecked entries. An
  accidental or dishonest check cannot be undone.
- A check records only a Boolean. There is no state for inspected-and-sound,
  not applicable, defect found, deferred, stopped/no-sail, notes or evidence.
- At 12/12 the page says **All checks complete! Ready for the quiz?** even if
  every observation found damage or unsafe rigging.
- `checks` and `score` are component state only. Navigation, remount or reload
  restores catalogue defaults. `useProgress`, authenticated storage, anonymous
  storage and registered topic completion are not used.
- If `rigChecks` is empty, `checkedCount === checks.length` is true and the
  completion card renders immediately.
- No page-specific component test exists. The data has no runtime guard for
  duplicate/blank IDs, fields, categories or malformed entries.
- Checkboxes are associated with their full labels and work by pointer or
  keyboard. The Back icon has no accessible name; score/count, toast and
  completion insertion have no deliberate status/focus behavior.

Observed browser results at 375, 768 and 1280 CSS px:

- The dashboard's **Rig Checks & Preparation** card navigated to `/rig` at all
  three widths.
- Initial state was 0 checked. A pointer activation changed the first item to
  1/12 and 8 points; activating it again left it checked and left the score at
  8. Reload restored 0/12.
- A clean keyboard path focused and Space-activated each of the twelve Radix
  checkbox controls. It reached 12/12, 96 points and **All checks complete!**
  at every width.
- The completion action activated by pointer when visible and by focused Enter
  after scrolling where needed; each path navigated to `/quiz/rig`, which
  rendered **Question 1 of 12**.
- Document `scrollWidth` equalled viewport client width in each run (375/375,
  753/753 and 1265/1265; desktop client widths exclude the 15 px scrollbar).
  No document-level horizontal overflow was observed.
- Before completion there were thirteen tab stops: one unnamed Back button and
  twelve checkboxes. On completion, focus remained on the final checkbox while
  the new heading appeared below the viewport at 375 px (`top: 1431` in a
  900 px viewport) and at the lower edge at desktop widths (`top: 894`). No
  focus or announcement directed the learner to it.
- No uncaught browser runtime exception was recorded.

The run did not emulate a screen reader, touch hardware, high zoom, forced
colours, reduced motion, long localization or a live authenticated backend.
Those behaviors remain unverified; responsive risks outside the exact widths
remain source-assessed. No yacht was inspected and no person was sent aloft.

### Scope, terminology and learning model

The module does not state the kind of rig it represents. Its shrouds, forestay,
backstay, spreaders and bottlescrews imply a conventionally stayed monohull,
yet rigs vary by masthead/fractional geometry, swept or inline spreaders,
backstay arrangement, wire/rod/fibre standing rigging, deck/keel stepping,
headsail attachment and manufacturer. An unstayed rig or many multihull rigs
cannot be judged by these generic tuning rules.

The catalogue also teaches its categories inaccurately:

- halyards are running rigging, not a component category called **Mast**;
- a boom is a spar, not running rigging;
- blocks and cleats are hardware through/on which running rigging works;
- “Shrouds & Stays” conflates lateral and fore-and-aft support before teaching
  their different locations and purposes;
- “turnbuckle” and “bottlescrew” are useful regional synonyms, but the learner
  is not shown one or taught body, terminal, locking and thread engagement.

Checkbox copy supplies fragments of a survey but not a method. It does not
teach objectives, inspection order, where each component is, safe access, what
normal looks like, how to recognize consequential defects, what can be checked
under load, what requires the rig unloaded/unstepped, or how to record and
escalate a finding. Manufacturer instructions illustrate why a universal
recipe is inappropriate: Seldén publishes different tuning sequences and
measurements for different rig types and directs owners to inspect structural
and moving parts according to its maintenance guidance.[^selden]

Current completion is click attendance, not knowledge, inspection quality or
seaworthiness. The proposed practical-lesson issue below owns the learning
model and visuals; the progress issue owns reversible, durable and honest
state.

### Inspection, preparation and safety correctness

Several catalogue observations are directionally valuable: broken strands,
corrosion, cracked or moving attachments, missing locking devices, chafe,
free-running lines, secure shackles, sail damage, reefing arrangements,
gooseneck condition and secure deck hardware all merit attention. The page
still lacks critical qualification:

- **Broken wire and terminals.** “Broken strands, rust” does not warn learners
  not to run bare hands along wire, distinguish staining from corrosion, or
  inspect swages/terminals for cracking, distortion and movement. The quiz's
  “meat hooks” language correctly signals a serious defect but normalizes a
  nickname without a cut warning or no-sail/escalation response.
- **Bottlescrews/turnbuckles.** “Threads not showing” is not a valid universal
  criterion; exposed thread can be normal. Adequate and balanced engagement,
  terminal alignment, distortion/galling/cracks and the maker-approved locking
  method matter. Split/cotter pins can cut sails and people and must be
  correctly fitted and protected; tightening changes tune and should not be
  improvised.
- **Chainplates and structure.** “Bolts tight” invites unqualified tightening
  and ignores specified torque, backing/support structure, deck movement,
  water ingress and hidden load paths. MAIB documented a training yacht
  dismasting after a fatigue failure in a below-deck tie-bar weld; recent
  external inspections and replaced standing rigging did not make the hidden
  structure sound.[^maib-rig] **Inference:** a deck-level visual checklist
  cannot certify the whole rig, and unexplained movement or structural concern
  needs professional assessment before sailing.
- **Mast, step and partners.** “Secure, no cracks, drain clear” omits corrosion
  around dissimilar metals, fasteners/rivets, compression/support, partners and
  wedges where fitted, electrical cabling, water ingress and deck/keel-step
  differences. Whether a drain exists and how it should be cleared are
  installation-specific.
- **Spreaders and aloft fittings.** Angle and tip condition depend on the spar
  and rig design. The page prescribes going aloft annually without a safe-work
  boundary, suitable equipment, independent support, competent crew, weather/
  wash controls, rescue plan or an alternative professional/unstepped
  inspection. A frequency slogan must not act as instruction to climb.
- **Halyards, sheets and control lines.** “Runs freely” and “ends
  figure-eighted” do not cover correct reeving/lead, stopper knots appropriate
  to the installation, clutches/winches, end-for-ending/replacement criteria,
  shackles/soft attachments, mouse lines, tangles, trip hazards or keeping
  people clear of loaded-line and winch hazards.
- **Blocks, cleats, boom and sails.** The prompts omit sheaves, pins, split
  rings, swivels, attachment points, boom end fittings, preventer provision,
  topping lift/rigid vang support, traveller/mainsheet, outhaul, batten/slides,
  UV cover, furling line/drum, luff attachment and safe boom control. “OK”
  provides no observable criterion.
- **Tuning.** A mast being straight athwartships, having fore-and-aft prebend
  or rake, and the relative tension of cap/intermediate/lower shrouds depend on
  the rig design, sail plan, spar maker and measured tuning process. “Equal
  tension” and “cap shrouds should be tighter” are not sufficient inspection
  criteria. Forestay sag affects sail shape and pointing, while rake is not
  simply forestay tension; backstay, shrouds, mast step and hull geometry
  interact. Learners should observe and defer to the vessel's tuning data, not
  tune from these four bullets.
- **Intervals.** “Before every sail” visual checks are useful, but “full
  inspection before season,” “annually, go aloft,” and “professional survey
  every 5 years” are unsupported universal intervals. Usage, age, material,
  environment, incidents, racing/offshore rules, insurer/coding obligations
  and manufacturer recommendations change the plan. World Sailing requires a
  boat to be properly rigged and maintained as fully seaworthy but does not
  turn this page's five-year slogan into a general recreational standard.[^ws]
- **Defect response.** The warning says not to ignore wear and to seek help
  “when in doubt,” but never defines stop/no-sail conditions, unload/secure
  precautions, marking/recording a defect, competent-rigger escalation, or
  post-grounding/knockdown/overload inspection. Carrying spare shackles, blocks
  and line neither repairs most standing-rig or structural failures nor makes
  sailing with a defect acceptable.
- **Electrical clearance.** Mast raising, lowering, moving ashore and some
  aloft work can be fatal near overhead lines. RYA says to check for overhead
  lines before rigging or moving a boat with a mast and not to assume wires on
  wooden poles are telephone lines.[^rya-lines] The module omits this hazard.

### Passage preparation and incident readiness

The title promises “Preparation,” but apart from removing sail covers and
checking sail/control-line fragments, there is no before-sailing sequence. A
useful lesson should guide the learner to:

- identify the actual rig and consult the vessel/rig maker's instructions and
  defect/maintenance history;
- walk from deck attachments upward, then inspect running rigging, spars,
  sails, furling/reefing and control systems;
- confirm pins and locking devices are fitted and protected, lines are
  correctly led and free to run, halyards are secured, and sails/reefing
  arrangements match the expected conditions;
- control the boom, remove and stow covers, loose gear and tools, and keep
  decks/escape routes clear;
- brief crew on winches, clutches, loaded lines, boom/sail sweep, reefing and
  known hazards;
- perform low-load functional checks where safe, then observe the rig under
  sail without putting hands near loaded/moving components;
- stop, secure and escalate abnormal movement, noise, distortion, broken wire,
  cracking, missing retention or other consequential defects;
- record inspections/remediation and reassess after heavy weather, grounding,
  collision, overload, mast work or a newly discovered defect;
- plan dismasting response appropriate to the vessel: protect people, maintain
  navigation, communicate distress/urgency as needed, manage lines/wires near
  the hull and propeller, and avoid improvising hazardous cutting.

The MAIB case shows that even a moderate-wind training passage can end in
catastrophic dismasting from a hidden fatigue failure.[^maib-rig] The lesson
should use such evidence to teach limitations and response, not imply twelve
deck-level ticks establish readiness.

### Visuals and theory/quiz alignment

There are no instructional visuals. Lucide icons communicate “check,” warning,
trophy and navigation, but do not show a stayed rig or a defect. Learners never
see labelled stays/shrouds, cap/lower shrouds, chainplate/load path, mast
step/partners, spreader/terminal, bottlescrew locking, swage cracks, broken
wire, chafe, halyard lead, gooseneck or reefing/furling arrangements. Text such
as “correct angle,” “tips protected,” “secure fittings” and “correct lead”
cannot be applied reliably without examples.

Quiz questions `rg2`–`rg5`, `rg8`–`rg9` and `rg12` repeat or extend checklist
claims. Five concepts are not taught by the parent:

- `rg1` defines standing rigging;
- `rg6` defines the forestay;
- `rg7` defines running rigging;
- `rg10` defines shrouds;
- `rg11` adds the topping lift, making five untaught concepts in total.

Several answers need correction or qualification:

- `rg2` repeats the unsupported seasonal/annual schedule as a universal rule.
- `rg3` says threads must not show “excessively,” but neither page nor answer
  teaches the rig-specific engagement/locking criterion.
- `rg4` treats a visually “incorrect angle” as recognizable without rig design
  or a reference.
- `rg5` is broadly true but too shallow to assess tuning safely.
- `rg6` says the forestay prevents the mast falling backwards. It provides
  forward support against aft displacement/load, but the simplified wording
  ignores rig geometry and implies a single-component mental model.
- `rg8` adds that a halyard shackle pin is “moused,” which the theory does not
  teach and is not the only attachment/retention arrangement.
- `rg9` usefully highlights boom-release injury/control consequences, but the
  parent only says “gooseneck secure” and teaches no safe inspection.
- `rg12` gives immediate replacement as the only response to visible broken
  wire. The essential learner action is do not sail/load or touch the defect,
  secure the situation and obtain competent assessment/replacement; the exact
  remediation scope may extend beyond one shroud.

The separate Rig Quiz audit should own full question-bank remediation. The
focused alignment proposal below limits this issue's follow-up to ensuring the
theory teaches what its handoff assesses and does not preserve unsafe rules.

### Completion, persistence and edge states

- Back always returns to global Home. The quiz is hidden until every Boolean is
  true; there is no direct learn/review route to the assessment.
- Boxes do not state whether they mean “read,” “located,” “inspected” or
  “serviceable.” There is no reset, undo, notes, defect outcome or not-applicable
  path.
- State and 96 local points vanish on navigation/reload and are not connected
  to profile rewards or dashboard completion.
- No loading, save, pending, retry, offline, conflict, catalogue-migration or
  identity-change state exists.
- Duplicate IDs would couple labels and updates; duplicate/blank areas or
  fields render silently. An empty catalogue false-positively completes.
- The completion action does not verify inspection outcomes or knowledge; it
  merely checks array length equality.

Shared quiz-shell issues already filed for other audits continue to apply to
quiz accessibility, contextual navigation, positional persistence, answer
oracle behavior, catalogue validation and anonymous attempts. They should not
be duplicated by this theory audit.

### Accessibility, screen sizes and input

Positive foundations:

- each Radix checkbox has a matching label and exposed checked state;
- the full text block is a large pointer target;
- text accompanies the safety icon, and checked state is not colour-only;
- checklist cards stack in one column and the tips grid collapses below `md`.

Remaining defects:

- the icon-only Back button has no accessible name;
- point/count/toast/completion changes are not deliberately announced;
- focus remains on the last checkbox when new completion content appears below;
- completed item titles use line-through, reducing readability;
- the sticky header forces back/title, score and count into one horizontal
  `justify-between` row with no wrap;
- the completion copy and large quiz button use another unwrapped horizontal
  row;
- long/localized text, 320 px, large text and 200%/400% zoom can crowd,
  overlap or overflow these rows;
- no visuals means no accessible diagram alternative, but future visuals will
  need meaningful labels/descriptions and non-visual equivalents;
- colour contrast was not measured and transitions do not explicitly honor
  reduced-motion preferences.

## Focused follow-up issue proposals

The five drafts below were filed as focused `agent-queue` issues. Their links,
body evidence, and acceptance criteria are retained here for audit traceability.

### 1. Make Rig checklist outcomes reversible, durable, and honest

**Proposed issue:** [#203](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/203)

**Proposed title:** `Make Rig checklist outcomes reversible, durable, and honest`

**Body:**

> ## Context
>
> `/rig` treats twelve irreversible checkbox clicks as completed physical rig
> checks, awards 96 local points, and says the learner is ready for the quiz
> even when a real inspection could have found a critical defect. State is
> component-local and disappears on navigation/reload. An empty catalogue
> immediately passes completion.
>
> ## Learner impact
>
> The interaction conflates reading, inspection and serviceability, can
> encourage sailing with a known defect, and presents points/progress that are
> not durable or reflected in shared topic progress.
>
> ## Acceptance criteria
>
> - Define the activity explicitly (learning review versus real-vessel
>   inspection) and model at least not-reviewed, satisfactory, defect found and
>   not-applicable/unknown outcomes where a physical checklist is retained.
> - Let learners correct/reset outcomes without duplicate rewards.
> - A defect/unknown outcome never produces an unqualified “all checks complete”
>   or “ready” statement; show a clear stop/escalation path.
> - Persist/resume the registered `rig` topic through the supported anonymous
>   and authenticated progress architecture, including pending/offline/failure
>   feedback and stable catalogue identities.
> - Define reward semantics and prevent reload/navigation/reset farming.
> - Empty, duplicate-ID and malformed catalogues fail safely and are covered by
>   tests.
> - Add component tests for all transitions, reload/resume, defects, reset,
>   completion and save failure.
>
> ## Relevant paths
>
> - `src/pages/RigTheory.tsx`
> - `src/data/rigChecks.ts`
> - shared progress/storage features

### 2. Correct and scope Rig inspection, tuning, and aloft safety guidance

**Proposed issue:** [#204](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/204)

**Proposed title:** `Correct and scope Rig inspection, tuning, and aloft safety guidance`

**Body:**

> ## Context
>
> `/rig` presents “threads not showing,” equal port/starboard tension, cap
> shrouds tighter than lowers, a straight/slightly bent mast, annual aloft work
> and a professional survey every five years as generic rules. It lacks sharp
> wire, loaded rigging, fall, structural load-path and overhead-line warnings,
> observable no-sail criteria, and manufacturer-led inspection limits.
>
> ## Learner impact
>
> Learners can apply the wrong criterion to a different rig, tighten or touch
> loaded/damaged components, attempt unsafe aloft inspection, or infer that a
> superficial deck-level check certifies the rig.
>
> ## Acceptance criteria
>
> - State representative rig scope and distinguish observations applicable
>   across rigs from rig-/material-/maker-specific checks.
> - Correct category and component terminology, thread engagement/locking,
>   terminal/chainplate/structural checks and tuning claims using authoritative
>   sources.
> - Replace universal calendar intervals with maker, usage, incident, coding/
>   insurer and competent-person criteria.
> - Add explicit no-sail/unload/secure/escalate criteria for broken wire,
>   cracks, distortion, missing retention, abnormal movement and uncertain
>   structure.
> - Add sharp-wire, stored-energy/loaded-line, fall/aloft, boom, winch and
>   overhead-electrical safety boundaries. Do not teach going aloft as a
>   one-line annual task.
> - Explain the limits of visual inspection, including hidden structures and
>   post-incident inspection.
> - Cite and date authoritative sources; configuration-specific maker material
>   is labelled as an example, not a universal specification.
> - Add content regression tests for critical warnings and corrected claims.
>
> ## Relevant paths
>
> - `src/pages/RigTheory.tsx`
> - `src/data/rigChecks.ts`

### 3. Turn Rig Checks into a practical, visual preparation lesson

**Proposed issue:** [#205](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/205)

**Proposed title:** `Turn Rig Checks into a practical, visual preparation lesson`

**Body:**

> ## Context
>
> The current route is twelve “look for” fragments plus four tuning bullets.
> It has no rig diagram, defect examples, guided inspection, passage-preparation
> sequence, crew briefing, functional observation or defect-disposition
> exercise.
>
> ## Learner impact
>
> A novice cannot reliably locate the named parts, distinguish normal from
> abnormal, understand load paths, or turn the list into a safe before-sailing
> process.
>
> ## Acceptance criteria
>
> - Add objectives and a labelled, configuration-qualified diagram covering
>   standing rigging, spars, terminals/attachments and running-rigging paths.
> - Provide high-quality normal/abnormal examples for broken wire, terminal/
>   swage and chainplate concerns, missing/unsafe retention, chafe, sail damage
>   and hardware defects.
> - Teach a coherent deck-level walk-round and passage-preparation sequence,
>   including covers/loose gear, line leads, halyards, boom control, reefing/
>   furling, sails, crew briefing and low-load checks.
> - For each observation, explain where/how to inspect safely, what acceptable
>   evidence looks like, limitations, and the action for a defect.
> - Include post-heavy-weather/grounding/overload triggers, records and a
>   bounded dismasting-readiness scenario without suggesting improvised
>   hazardous repairs.
> - Add an applied interaction that requires locating/evaluating evidence
>   rather than merely checking every row.
> - Visuals remain legible at supported viewports/zoom, use lawful repository
>   assets, and have meaningful text alternatives.
> - Add tests for lesson navigation, interaction feedback and completion.
>
> ## Relevant paths
>
> - `src/pages/RigTheory.tsx`
> - `src/data/rigChecks.ts`
> - new repository-native visual/interaction assets as needed

### 4. Align Rig theory handoff with safe, taught quiz objectives

**Proposed issue:** [#206](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/206)

**Proposed title:** `Align Rig theory handoff with safe, taught quiz objectives`

**Body:**

> ## Context
>
> The linked quiz tests definitions of standing/running rigging, forestay,
> shrouds and topping lift that `/rig` does not teach. It also repeats
> unsupported inspection intervals and underspecified turnbuckle, spreader,
> tuning and broken-wire rules. The theory page gates the quiz by checklist
> clicks rather than prerequisite learning.
>
> ## Learner impact
>
> Learners are assessed on hidden curriculum and can be rewarded for memorizing
> unsafe or overgeneralized rules.
>
> ## Acceptance criteria
>
> - Define a theory-to-assessment objective map and teach every retained quiz
>   objective before handoff.
> - Coordinate with the dedicated Rig Quiz audit/remediation; do not duplicate
>   shared quiz-shell work.
> - Remove or qualify unsupported calendar, tuning, component and repair claims
>   in both theory and assessment.
> - Make safety-first defect disposition assessable: avoid contact/loading,
>   stop/no-sail as appropriate, secure and obtain competent assessment.
> - Explanations teach why alternatives are wrong and identify rig-specific
>   limits rather than merely restating the answer.
> - Quiz availability is not represented as proof that a real yacht passed an
>   inspection.
> - Add automated objective-coverage and critical-content tests.
>
> ## Relevant paths
>
> - `src/pages/RigTheory.tsx`
> - `src/data/rigChecks.ts`
> - `src/data/quizzes/rig.ts`
> - `src/pages/Quiz.tsx`

### 5. Make Rig checklist and completion accessible and responsive

**Proposed issue:** [#207](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/207)

**Proposed title:** `Make Rig checklist and completion accessible and responsive`

**Body:**

> ## Context
>
> `/rig` has labelled keyboard-operable checkboxes, but Back is unnamed,
> dynamic score/count/toast/completion changes lack deliberate announcements,
> and focus does not move or receive guidance when completion appears. Sticky
> header and completion rows do not wrap for narrow screens, zoom or long text.
>
> ## Learner impact
>
> Screen-reader and keyboard users can miss state/completion changes, while
> mobile, large-text and translated-content users risk crowded or inaccessible
> controls.
>
> ## Acceptance criteria
>
> - Give icon-only controls accessible names and preserve visible,
>   predictable keyboard focus.
> - Expose checklist instructions/outcomes and progress with suitable names,
>   status semantics and non-disruptive announcements.
> - On completion, announce the result and provide a clear focus/navigation
>   path without stealing focus unexpectedly.
> - Do not use line-through or colour alone in a way that reduces comprehension;
>   verify contrast and forced-colour behavior.
> - Header, cards and completion action reflow without overlap or horizontal
>   page overflow at 320 CSS px, 200%/400% zoom and long localized strings;
>   touch targets meet the project baseline.
> - New instructional visuals/interactions have keyboard/touch parity,
>   text alternatives and reduced-motion behavior.
> - Add automated accessibility/component tests and document browser checks for
>   keyboard, screen reader, zoom and responsive layouts.
>
> ## Relevant paths
>
> - `src/pages/RigTheory.tsx`
> - `src/data/rigChecks.ts`
> - any new Rig visual/interaction components

## Authoritative sources

All sources were accessed 2026-07-31. Manufacturer and offshore-racing
material demonstrate configuration/operating-context requirements; neither is
asserted to govern every recreational yacht.

[^selden]: Seldén Mast AB, [“Rigging instructions & sailmakers
  guide”](https://support.seldenmast.com/en/technical_info/rigging_instructions.html)
  and [“Hints and advice on rigging and tuning of your Seldén
  mast”](https://support.seldenmast.com/files/595-540-E.pdf), including
  rig-specific tuning sequences and maintenance guidance.
[^maib-rig]: Marine Accident Investigation Branch, [“MAIB Safety Digest
  2/2018”](https://assets.publishing.service.gov.uk/media/5e81e5d2e90e0706ead5f5b1/2018-SD2-MAIBSafetyDigest.pdf),
  Case 22, **“The Cyclic Effect,”** PDF pages 50–51.
[^ws]: World Sailing, [“Offshore Special Regulations
  2026–2027”](https://media.sailing.org/sailing/wp-content/uploads/2025/12/05110802/WS_Offshore_Special-Regulations_2026-2027_v1_wcover.pdf),
  rule 3.01, **Strength of Build and Rig**.
[^rya-lines]: Royal Yachting Association, [“Overhead
  wires”](https://www.rya.org.uk/water-safety/boat-safety-and-maintenance/overhead-wires/).
