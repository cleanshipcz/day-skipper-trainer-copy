# Anchorwork Theory learner-facing audit

- Audit issue: [#92](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/92)
- Route/topic: `/anchorwork` / `anchorwork`
- Audited: 2026-07-30
- Primary implementation: `src/pages/AnchorTheory.tsx`
- Topic catalogue: `src/data/anchorTopics.ts`
- Related routes: `src/pages/AnchorMinigame.tsx`, `src/pages/Quiz.tsx`,
  `src/constants/topicRegistry.ts`

## Verdict

**The page is a usable five-card outline, but not yet a dependable anchoring
lesson or durable completion experience.** All topics, the minigame, and the
quiz are reachable, and the layout remains compact at common viewport widths.
However, clicking **Mark as Complete** does not update the selected card's
completion UI, all progress and points disappear on reload, and completion is
awarded for clicks without checking understanding.

More importantly for a safety-sensitive subject, the short catalogue presents
scope, anchor choice, swinging room, setting, and recovery as universal rules
without enough environmental or vessel context. Its sole diagram says
**Scope 5:1** while drawing a rode only about 1.2 times its illustrated vertical
distance. The graphic has no text alternative, topic selection and completion
changes are not programmatically exposed, and the icon-only Back control is
unnamed.

## Evidence and exercised paths

### Runtime method and scope

The implementation, catalogue, route registry, linked minigame, and quiz route
were inspected directly. A production build was served locally with placeholder
Supabase configuration (no credentials or live backend) and exercised in clean
Chromium. Topic selection, repeated completion, all-topics completion, the
minigame/quiz handoffs, reload, keyboard operation, and responsive layout were
checked.

Observed results:

- `/anchorwork` opens with **Types of Anchors** selected and five topic buttons.
- Completing each topic adds 20 points once and unlocks the completion panel at
  5/5 and 100 points. Repeated activation does not add points.
- Immediately after completing the selected topic, its sidebar check appears,
  but its content card still shows **Mark as Complete** and not **Completed**.
  Selecting away and back repairs the display because `selectedTopic` is a
  stale object separate from the updated `topicList`.
- Reload resets the page to 0 points and 0/5. No progress service, authenticated
  record, or anonymous storage is read or written.
- At 375, 768, and 1280 CSS px there was no document-level horizontal overflow.
  Native topic/action buttons worked with pointer and keyboard input.
- Minigame buttons navigate to `/anchor-minigame`; the completion quiz action
  navigates to `/quiz/anchorwork`; Back navigates to global `/`.

No live authenticated persistence round-trip, real assistive-technology
session, adverse-weather field validation, or physical anchor trial was
performed.

### Learning flow, completion, and failure states

- The five topics are freely selectable and consist of one short overview plus
  three tips. There are no worked examples, checks for understanding, source
  references, glossary support, or links from a particular concept to its
  corresponding practice.
- Completion is self-attested by one click. It does not require reading time,
  an interaction, a calculation, or a correct response. The hard-coded score is
  local gamification rather than registered profile progress.
- The stale selected object creates contradictory state after completion: the
  sidebar says complete while the card still offers completion. The handler's
  lookup against `topicList` prevents duplicate points, but gives no feedback
  explaining why the visible button no longer has an effect.
- Navigation away, refresh, browser restart, and a second device lose all
  progress. Returning learners cannot distinguish never-started from completed
  material.
- There are no loading, empty, or error states. Static data makes network
  failure irrelevant, but malformed/empty catalogue data would leave a blank
  content column and make the all-complete condition true for an empty list.
- Back goes to global Home, while the minigame correctly returns to Anchorwork.
  The route registry identifies Anchorwork as a top-level topic, so this is
  coherent, though the page provides no explicit Home label or breadcrumb.

### Scope guidance, calculations, and diagram

The catalogue defines scope as rode length divided by water depth, then tells
the learner to calculate “Depth + Height of bow above water.” The denominator
should be the maximum vertical distance from the bow roller/chock to the seabed,
including tide and anticipated water-level changes. Mixing the shorthand
definition and the fuller tip invites learners to calculate from the wrong
point.

“Minimum 4:1 for calm conditions, 7:1 for rough weather” is too absolute.
Required scope depends on rode composition, anchor and vessel, depth, seabed,
room, wind/current/waves, manufacturer guidance, and local constraints.
Emergency or crowded conditions may require different techniques rather than
blindly applying one ratio. There is no worked calculation incorporating bow
height or rising tide.

The SVG compounds the problem:

- its bow-to-anchor rode is roughly 144 drawing units while the displayed
  waterline-to-anchor vertical distance is about 115–120 units, approximately
  1.2:1 rather than the labelled 5:1;
- the dashed horizontal “Scope 5:1” annotation measures neither rode length nor
  a ratio, and no dimensions support the claim;
- **Depth** starts at the water surface, while the text correctly hints that bow
  height belongs in the denominator;
- despite the card description, no swinging circle, vessel arc, hazard,
  neighbouring vessel, or change of wind/tide is drawn.

### Anchor selection and procedures

The anchor-type summary is too categorical for safe selection. “Danforth
(excellent in sand),” “Bruce/Claw (good holding),” and “Fisherman (traditional,
rocky bottoms)” omit design variation, reset behavior, weed/mud/rock
limitations, sizing tables, vessel windage, rode, and manufacturer guidance.
“Plow/CQR” also conflates a generic family with a particular design/trade name.

The setting procedure has the right broad sequence—approach into the dominant
force, lower rather than throw, pay out while moving astern, set, and check—but
omits the essential planning and control around it:

- assess charted restrictions, depth/tide, weather, seabed, hazards, traffic,
  swinging room, other vessels' anchors/rodes, and an escape plan first;
- brief crew, prepare/secure the rode and bitter end, communicate, keep body
  parts clear, and avoid loading a windlass as a permanent strong point;
- lower under control, avoid piling chain on the anchor, snub appropriately,
  increase setting load progressively, and verify holding by more than a single
  observation;
- continue a suitable anchor watch. An alarm supplements rather than replaces
  bearings, depth, position trend, weather, and physical checks.

“Display anchor ball/light as required” is directionally sound but should tie
the learner to the applicable collision regulations and local requirements
rather than imply one universal display.

The weighing summary similarly omits crew/helm communication, keeping the rode
near vertical without motoring over it, safe windlass/manual handling,
pinch/snap-back zones, what to do when fouled, confirming the anchor is
actually clear, and securing it for sea. “Break anchor free” is not an adequate
procedure for a fouled or heavily loaded anchor.

### Swinging room

“Swinging circle radius = vessel length + rode length” is a conservative
introductory approximation, not a complete calculation. The actual swept area
depends on the anchor position, bow roller-to-stern distance, catenary, depth,
rode, vessel geometry, wind/current changes, and positioning uncertainty.
Nearby vessels may have different scope and swing differently; merely watching
their visible positions is not enough. The lesson offers no worked plan-view
example and the advertised swinging-room diagram does not depict one.

### Accessibility and input

Topic and action controls are native buttons and keyboard-operable. The
completion panel uses text as well as decoration. Remaining barriers include:

- Back is an icon-only button with no accessible name.
- The active topic is conveyed visually but not with `aria-current`,
  `aria-pressed`, tabs, or an equivalent relationship.
- Completion icons and changing counts/scores are not exposed as status
  updates; focus remains on a button that may continue to look actionable
  because of the stale-state defect.
- The diagram has no accessible name, description, text equivalent, or
  semantic connection to the scope lesson. Its text is small at narrow widths.
- Score is identified only by a trophy icon, and the 0–100 meaning is not
  labelled.
- Emoji in minigame/completion controls may be redundantly announced unless
  hidden from assistive technology.

## Complete focused follow-up issue drafts

### Keep Anchorwork topic completion state consistent and durable

**Problem**

`selectedTopic` stores an object separate from `topicList`. Completing the
selected item updates only the list, so the sidebar and content card contradict
each other until reselection. All completion and score state is component-local
and disappears on reload; completion is also granted for an unchecked click.

**Acceptance criteria**

- Derive the selected topic from one canonical collection/ID so its completion
  badge and available action update atomically.
- Persist and restore completion through the project's durable progress model
  for authenticated learners, with a documented anonymous behavior.
- Make save/loading/failure behavior visible and retryable without awarding
  duplicate credit.
- Define a meaningful completion condition (for example a short knowledge
  check) and keep scoring consistent across reloads and devices.
- Cover first completion, repeated activation, restore, save failure, and an
  empty/malformed catalogue with automated tests.

### Replace universal Anchorwork rules with qualified, safety-aware guidance

**Problem**

Anchor selection, scope ratios, setting, anchor watch, weighing, and signals are
presented as short universal rules. Learners are not told how vessel, rode,
manufacturer guidance, seabed, weather, tide, local rules, and operational
hazards change the decision.

**Acceptance criteria**

- Have the revised safety-sensitive content reviewed by a suitably qualified
  sailing/anchoring subject-matter expert.
- Qualify anchor selection by design, size, vessel, seabed, rode, windage, and
  manufacturer guidance rather than categorical “good/excellent” labels.
- Teach planning, controlled deployment/setting, independent holding checks,
  continuing watch, crew communication, windlass/rode hazards, fouling, and
  secure recovery.
- Explain that lights/shapes and anchoring restrictions follow applicable
  collision regulations and local requirements.
- Clearly distinguish introductory guidance from conditions requiring a
  different technique or expert/local advice.
- Add content-level tests or review fixtures that protect the approved wording.

### Teach scope and swinging room with correct worked calculations

**Problem**

The lesson mixes water depth with total bow-roller-to-seabed depth, prescribes
fixed ratios without context, and gives only an approximate swinging-radius
formula. There is no worked example that includes bow height and tide.

**Acceptance criteria**

- Define scope using rode length and maximum vertical bow-roller/chock-to-seabed
  distance, including tide/water-level allowance.
- Provide at least one worked scope example and one plan-view swinging-room
  example with units, assumptions, and intermediate calculations.
- Explain how rode, depth, seabed, conditions, vessel/manufacturer guidance,
  hazards, positioning uncertainty, and differently scoped neighbours affect
  the result.
- Label simplified formulas as approximations and state their limits.
- Verify examples with automated calculation tests or immutable reviewed
  fixtures.

### Replace the misleading Anchorwork diagram with accessible scope and swing visuals

**Problem**

The SVG labelled 5:1 depicts roughly 1.2:1, uses an annotation that measures no
ratio, starts depth at the waterline, and does not show the promised swinging
room. It has no text alternative.

**Acceptance criteria**

- Draw scope geometry to scale or explicitly mark it not to scale, with
  dimensions that reconcile to the displayed ratio.
- Measure the vertical denominator from bow roller/chock to seabed and
  distinguish water depth, bow height, tide allowance, and rode length.
- Add a plan-view swinging-area visual including the vessel, anchor, swept
  radius, uncertainty/clearance, and representative hazards or neighbours.
- Provide equivalent explanatory text and useful accessible names/descriptions;
  do not rely on colour or tiny embedded SVG text.
- Verify visual legibility and absence of clipping at 320/375, 768, and 1280 px,
  plus zoom and high-contrast/forced-colour behavior.

### Expose Anchorwork selection, progress, and diagram accessibly

**Problem**

Back and score lack accessible names, active topic/completion state is mainly
visual, progress changes are not announced, and the instructional SVG has no
semantic alternative.

**Acceptance criteria**

- Give Back and the score/progress display explicit accessible names.
- Expose the active topic and completed topics with an appropriate selectable
  pattern and programmatic state while retaining native keyboard behavior.
- Announce meaningful completion/save changes without duplicating or
  interrupting ordinary content.
- Manage focus after completion and when changing topics so the new heading and
  state are discoverable.
- Give instructional visuals equivalent text; hide decorative icons/emoji from
  assistive technology where their labels already convey the action.
- Add automated accessibility coverage and manually verify keyboard,
  screen-reader, zoom, and forced-colour workflows.

### Connect Anchorwork theory, minigame, and quiz as one guided learning path

**Problem**

The same generic minigame card is shown for every topic, practice is not tied to
the concept being learned, and quiz access appears only after self-attesting all
five topics. There is no prerequisite/remediation explanation or return-path
context.

**Acceptance criteria**

- State what the minigame and quiz assess and map each assessed skill to taught
  theory or an explicit prerequisite.
- Offer practice at the relevant topic, preserving enough context to return to
  that topic after practice.
- Make quiz readiness depend on a defined, durable learning condition rather
  than five unchecked clicks, while keeping an understandable recovery path.
- On quiz/minigame completion or failure, route learners to the relevant
  Anchorwork topic for remediation.
- Add route/interaction tests for theory → practice → return and theory → quiz
  → remediation flows.
