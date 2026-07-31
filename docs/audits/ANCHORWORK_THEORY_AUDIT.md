# Anchorwork Theory learner-facing audit

- Audit issue: [#92](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/92)
- Route/topic: `/anchorwork` / `anchorwork`
- Audited: 2026-07-30; reconciled with chain tip 2026-07-31
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

## Focused follow-up issues

The linked issues were rechecked on 2026-07-31 against the current chain tip.
Each remains open with the `agent-queue` label and includes reproduction or
context, learner impact, acceptance criteria, and relevant implementation
paths. Together they cover every distinct finding below without putting fixes
into this audit branch.

- [#168 — Keep Anchorwork topic completion state consistent and
  durable](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/168)
  — covers the stale selected-topic object, click-only completion, duplicate
  credit protection, and authenticated/anonymous persistence and recovery.
- [#169 — Replace universal Anchorwork rules with qualified, safety-aware
  guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/169)
  — covers anchor selection, planning, setting, watchkeeping, recovery,
  crew/rode hazards, and applicable signals and local requirements.
- [#170 — Teach scope and swinging room with correct worked
  calculations](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/170)
  — covers the bow-roller-to-seabed denominator, tide allowance, contextual
  scope, worked examples, and the limits of simplified swing calculations.
- [#171 — Replace the misleading Anchorwork diagram with accessible scope and
  swing visuals](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/171)
  — covers the false 5:1 geometry, missing dimensions and swing view,
  responsive legibility, and equivalent text.
- [#172 — Expose Anchorwork selection, progress, and diagram
  accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/172)
  — covers control names, active/completed state, announcements, focus, visual
  alternatives, zoom, screen-reader, and forced-colour behavior.
- [#173 — Connect Anchorwork theory, minigame, and quiz as one guided learning
  path](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/173)
  — covers assessment alignment, topic-specific practice, durable readiness,
  return context, and remediation routing.
