# Anchor Minigame learner-facing audit

- Audit issue: [#93](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/93)
- Route/topic: `/anchor-minigame` / Anchorwork practice
- Audited: 2026-07-30
- Primary implementation: `src/pages/AnchorMinigame.tsx`
- Simulation model: `src/pages/anchor-minigame/state.ts`
- Scene geometry: `src/pages/anchor-minigame/geometry.ts`
- Parent/audit: `src/pages/AnchorTheory.tsx`,
  `docs/audits/ANCHORWORK_THEORY_AUDIT.md`

## Verdict

**The simulator is mechanically coherent and unusually well characterized, but
its success verdict must not yet be treated as evidence of safe anchoring.**
Pointer and keyboard paths can complete all four fixed setups at responsive
sizes, geometry keeps a grounded anchor stationary, rode movement is bounded,
and no progress is written accidentally. The model nevertheless awards
**Anchor secure** solely for a grounded anchor more than 0.5 m ahead of the bow
and a fixed scope ratio. It does not assess anchor choice, seabed, setting load,
holding, hazards, swinging clearance, watchkeeping, or recovery.

That simplification directly reinforces the unsafe universal scope guidance
identified in the Anchorwork Theory audit: even “soft mud” and “weak holding”
setups pass based on wind-labelled 4:1 or 5:1 ratios alone. “Stay within the
swinging circle” is displayed without a circle, boundary, obstacle, or
clearance calculation. Global key handling also makes Enter and arrow keys
operate the game from unrelated controls and behind the result overlay; the
overlay is not a dialog and status/scene changes are not announced. Success,
attempts, and scenario history disappear on navigation or reload.

## Evidence and exercised paths

### Runtime method and coverage

The page, pure transition model, geometry mapping, route, theory parent, and
their focused tests were inspected. The repository's production-browser
characterization built the app with placeholder Supabase configuration and
exercised clean Chromium at 375, 768, and 1280 CSS px. It used actual pointer
and keyboard events to pay out rode, move astern, check a successful placement,
reset, repeat, and compare browser storage/network state.

Observed results:

- All three viewports rendered without document or SVG overflow. Five visible
  controls remained inside the viewport and at least 44 CSS px wide.
- Pointer and keyboard paths reached **Anchor secure**, then **Try again here**
  restored 0.0 m and **Anchor not set**.
- The successful browser paths used 80 m of rode and 12 left movements, well
  beyond every setup's minimum. Focused tests also prove the exact mild target,
  short-scope rejection, under/behind rejection, 120 m cap, taut-rode clamp,
  camera tracking, anchor lift, and seabed-constrained drawing.
- Storage snapshots were unchanged and no progress mutation was requested
  across either completion path at all three sizes.
- The pure model and component tests pass at 375, 768, and 1280 px and explicitly
  characterize the current no-persistence contract.

No physical anchoring trial, qualified instructor validation, live authenticated
backend, screen reader, switch control, forced colours, 200%/400% zoom, or
multi-touch/drag gesture was exercised.

### Scenario generation and coverage

`pickScenario` randomly selects one of four static records with replacement.
“New setup” can therefore return the same setup repeatedly. The incrementing
module-level ID distinguishes rolls but does not make a run reproducible or
prevent repeats. There is no learner-visible scenario number, seed, history,
mastery tracking, or guarantee that all conditions are encountered.

The scenarios vary depth, bow height, a `mild`/`moderate`/`strong` condition,
and prose notes. Only condition and dimensions affect the simulation:

- soft mud has no effect on holding or anchor selection;
- “wind across the bows,” cross-wind, ferry wash, current, and chop do not
  affect boat or rode;
- weak holding has no effect on the required setting check;
- tide, water-level change, vessel/anchor/rode type, neighbouring vessels,
  obstructions, local restrictions, and forecast changes are absent.

The wind icon always says **Wind from ahead**, contradicting the harbour's
cross-bow wind and the roadstead's cross-wind. Scenario badges reduce all
conditions to “wind,” even when the note's current, wash, seabed, or chop is the
important complication.

### Geometry and simulation behavior

The pure state model has valuable invariants:

- rode is clamped to 0–120 m;
- the anchor initially travels vertically with the bow and becomes fixed at the
  bow attachment point when rode reaches total depth;
- after grounding, the boat cannot move beyond the straight-line horizontal
  reach of the paid-out rode;
- rode cannot be heaved shorter than the straight-line distance while the
  anchor is offset, and the anchor can be recovered only near the vertical;
- the camera follows movement while retaining a fixed 42 m world width.

The SVG uses a stable 760×360 viewBox and separate horizontal/vertical scales.
Its chain path adds a schematic sag based on leftover rode and constrains points
to the seabed. This is a useful visual model, not a physical catenary: sag is
screen-derived, seabed friction and chain weight are absent, and excess rode is
drawn as one straight seabed segment. The horizontal clamp is called a
“swinging circle,” but it is only the side-profile reach of a taut rode. It
neither calculates nor displays a plan-view swept area.

The scene labels the seabed and depth with **total depth from bow**, even though
the seabed's vertical segment begins at the water surface. Bow height is shown
in the scenario card but not dimensioned in the scene. The visual therefore
does not fully resolve the diagram defect recorded by audit #92.

There is no drag interaction despite the visual simulator presentation.
Pointer/touch learners repeatedly activate buttons in 0.8 m boat and 1 m rode
steps; a strong setup can require more than 75 pay-out activations. Pressing and
holding does not continuously move, and the scene itself cannot be explored or
manipulated.

### Placement, feedback, scoring, and completion

`checkPlacement` succeeds when all three predicates hold:

1. anchor is on the bottom;
2. anchor is more than 0.5 m ahead of the boat's drawn bow tip;
3. rode meets `condition × (water depth + bow height)`, with fixed ratios 4,
   5, and 7.

There is no upper-scope/available-room check, so 120 m is always acceptable if
the anchor is ahead. The learner need not use a suitable anchor, pay out under
control, set it, apply reverse load, verify holding, avoid another vessel or
hazard, allow a safe swept area, or maintain a watch. **Anchor secure** is
therefore materially stronger than what the simulation proves.

Failure feedback correctly combines missing seabed contact, under/behind
placement, and exact rode shortfall. It does not explain why the scenario needs
its ratio, distinguish rode from chain, or remediate the underlying theory.
Success advances to another random setup; failure may close or reset. Resetting
the position retains attempts, while a new setup clears them.

The header counts checks as “Attempted,” but has no score or mastery definition.
The trophy icon implies achievement; no success count, efficiency measure,
completion threshold, or end state exists. Success is neither persisted nor
reported to the Anchorwork parent, so it cannot unlock or evidence progress and
cannot be resumed after reload.

### Keyboard, focus, and accessibility

The labelled native control buttons are operable by keyboard and pointer, and
the SVG has a concise accessible label. Feedback includes text and icons rather
than colour alone. Significant barriers remain:

- Back is an unnamed icon-only button.
- A window-level listener intercepts every arrow key and Enter anywhere on the
  page. It operates the game while focus is on New setup, Back, or result
  actions; Enter can both check placement and activate the focused button.
- The same global handler remains active behind the result overlay, so a learner
  can mutate/check concealed state while handling the result.
- The overlay has no dialog role, accessible name, initial focus, focus trap,
  or focus restoration. Background controls remain reachable.
- Live readout, last status, attempts, anchor-bottom state, and result changes
  are not exposed through deliberate status/live semantics.
- The SVG label does not communicate the dynamic boat/anchor relationship,
  scope, required target, or whether the geometry is schematic. Embedded SVG
  text becomes small at 375 px.
- Scope readiness relies partly on colour, and changing colour is not conveyed
  as a named threshold state.

## Complete focused follow-up issue drafts

### Align Anchor Minigame success with qualified, safety-aware anchoring decisions

**Problem**

The game declares an anchor secure based only on bottom contact, position ahead,
and fixed wind-derived scope. Soft mud, weak holding, cross-wind, current, wash,
and chop have no modeled consequence, and excessive scope cannot fail for lack
of room. This conflicts with Anchorwork audit #92 and can teach unsafe
confidence.

**Acceptance criteria**

- Have the scenario rules and learner-facing verdicts reviewed by a suitably
  qualified anchoring instructor.
- Replace universal 4:1/5:1/7:1 success with scenario-aware guidance that
  accounts for rode, anchor/vessel, seabed, weather/current, tide, available
  room, and manufacturer/local guidance at an appropriate teaching level.
- Do not say “secure” unless the modeled checks support that claim; explicitly
  label unmodeled real-world checks.
- Require a plausible controlled setting/holding verification and reject
  placements whose paid-out rode exceeds the scenario's safe room.
- Keep theory, simulator, and Anchorwork Quiz terminology/calculations aligned
  through reviewed fixtures and automated tests.

### Model and teach holding checks, swinging clearance, and recovery

**Problem**

The advertised swinging circle is only a side-profile rode-reach clamp. No swept
area, obstruction, neighbour, setting load, dragging, watch, or recovery hazard
exists, so learners cannot practice the procedures the theory claims to teach.

**Acceptance criteria**

- Add a plan-view or equivalent interaction that displays the vessel's swept
  area, safety allowance, hazards, and differently swinging neighbours.
- Give scenarios clear room constraints and require the full swept area to fit.
- Model a comprehensible setting/holding check, possible dragging or weak
  holding, and remediation without pretending to be a full physics simulator.
- Include anchor watch/change-of-wind-or-tide and safe recovery learning paths.
- Explain simplifications and provide actionable feedback linked to the
  relevant Anchorwork theory topic.
- Test boundary contact, insufficient clearance, holding failure, condition
  change, recovery, and successful completion.

### Make Anchor Minigame keyboard scope and result handling accessible

**Problem**

The window-level handler hijacks arrows and Enter from every focused control and
continues behind a non-modal result overlay. Results and changing simulation
state are not deliberately announced or focused.

**Acceptance criteria**

- Scope game shortcuts to an explicitly focusable, named control surface and
  avoid overriding keys needed by buttons, links, scrolling, or assistive
  technology.
- Ensure Enter causes exactly one intended action for the current focus.
- Implement the result as an accessible dialog or non-modal status pattern with
  correct naming, initial focus, background behavior, Escape behavior, and
  focus restoration.
- Stop hidden gameplay while a modal result is active.
- Announce concise status, threshold, failure, and success changes without
  flooding the accessibility tree.
- Name Back and expose current/required scope and anchor state independently of
  colour; verify keyboard and screen-reader paths in tests and manual checks.

### Provide efficient pointer and touch manipulation with equivalent controls

**Problem**

The scene is visually presented as a simulator but cannot be manipulated.
Learners may need more than 75 individual pay-out clicks, and the fixed-step
buttons provide no hold/repeat or coarse adjustment. This is laborious on touch
and does not teach spatial placement directly.

**Acceptance criteria**

- Provide an efficient direct or continuous pointer/touch interaction for boat
  movement and rode adjustment, with clear constraints and feedback.
- Retain fully equivalent button and keyboard controls; drag must not become the
  only way to complete the activity.
- Prevent page scrolling/gesture conflicts only within the active manipulation
  surface and support cancellation or pointer loss safely.
- Offer coarse/fine or press-and-hold adjustment without accidental runaway
  input.
- Keep visual, numeric, and accessible state synchronized throughout movement.
- Test mouse, touch/pointer, keyboard, cancelled gestures, viewport resize, and
  minimum target sizes at 320/375, 768, and 1280 px.

### Make Anchor Minigame scenarios varied, non-repeating, and reproducible

**Problem**

Four static scenarios are selected randomly with replacement. A learner can see
the same setup repeatedly, cannot tell what has been covered, and cannot
reproduce a failed setup. Several prose conditions contradict the fixed
“Wind from ahead” visual and have no gameplay effect.

**Acceptance criteria**

- Avoid immediate repeats and provide a defined cycle/mastery policy across the
  available scenario families.
- Give each setup a stable reproducible identity/seed that can be included in
  failure reports and tests.
- Ensure every displayed condition has a consistent visual/model consequence,
  or clearly mark it as context that is not simulated.
- Align wind direction labels/icons with scenario prose and represent tide,
  current, seabed, rode, hazards, and vessel differences only when they affect
  the learning decision.
- Expose scenario progress/history and allow retry of the same setup.
- Add deterministic generation, boundary, distribution/cycle, and copy-model
  consistency tests.

### Define and persist Anchor Minigame completion and remediation progress

**Problem**

Attempts are counted, but there is no score, mastery threshold, terminal
completion, parent handoff, or durable record. Reload loses successes and
history, and the trophy-styled success cannot contribute to guided Anchorwork
progress.

**Acceptance criteria**

- Define what constitutes practice completion/mastery and which metrics are
  diagnostic rather than reward-bearing.
- Track scenario outcomes and attempts without encouraging unsafe speed or
  excessive-scope gaming.
- Persist authenticated completion through the project's durable progress
  model with visible loading/save/retry behavior and idempotent credit; document
  anonymous behavior.
- Restore an interrupted run by stable scenario identity, or explain and safely
  restart it.
- Return learners to the relevant theory topic after specific failures and
  provide an explicit Anchorwork/quiz handoff after mastery.
- Test reload, multi-device restore, offline/save failure, retry, duplicate
  submission, and parent progress integration.

### Make the dynamic anchor scene an accurate, responsive learning graphic

**Problem**

The SVG is responsive and bounded, but its schematic catenary and “swinging
circle” are not explained, total bow depth is labelled on a water-depth segment,
and its accessible label does not describe dynamic state. Embedded text becomes
small on narrow screens.

**Acceptance criteria**

- Label the side-profile geometry as schematic and distinguish water depth, bow
  height, total vertical depth, straight-line distance, rode out, and slack.
- Do not call side-profile reach a swinging circle; link it to a correct
  plan-view clearance representation.
- Provide a concise dynamic text equivalent for boat/anchor relationship,
  current and required scope, contact/holding state, and relevant hazards.
- Keep labels legible without clipping at 320/375, 768, and 1280 px and under
  200%/400% zoom; support forced colours and reduced motion.
- Ensure camera movement never hides information required for the current
  decision.
- Add geometry invariants and visual/browser checks for minimum/maximum depth,
  zero/maximum rode, extreme camera positions, slack/taut transitions, and each
  scenario family.
