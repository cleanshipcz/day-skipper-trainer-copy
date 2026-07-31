# Anchor Minigame learner-facing audit

- Audit issue: [#93](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/93)
- Route/topic: `/anchor-minigame` / Anchorwork practice
- Audited: 2026-07-30; reconciled with chain tip 2026-07-31
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
clearance calculation. Global Enter and arrow-key shortcuts remain active when
focus is outside an interactive control, including behind the result overlay.
Focused controls are correctly excluded: Enter activates the focused button
without also checking placement. The overlay is not a dialog and status/scene
changes are not announced. Success, attempts, and scenario history disappear
on navigation or reload.

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
- A window-level listener handles arrow keys and Enter whenever focus is not in
  a button, link, form field, button role, or editable region. Focused controls
  are guarded and a regression test proves Enter activates a focused button
  without also checking placement.
- The global handler remains active behind the result overlay when focus is on
  the document or another unguarded target, so a learner can mutate/check
  concealed state while handling the result.
- The overlay has no dialog role, accessible name, initial focus, focus trap,
  or focus restoration. Background controls remain reachable.
- Live readout, last status, attempts, anchor-bottom state, and result changes
  are not exposed through deliberate status/live semantics.
- The SVG label does not communicate the dynamic boat/anchor relationship,
  scope, required target, or whether the geometry is schematic. Embedded SVG
  text becomes small at 375 px.
- Scope readiness relies partly on colour, and changing colour is not conveyed
  as a named threshold state.

## Focused follow-up issues

All seven follow-ups below were rechecked on 2026-07-31: each remains open and
has the `agent-queue` label. The safety-model findings are intentionally owned
by #175 and #176 rather than the theory-only follow-ups from audit #92.

- [#175 — Align Anchor Minigame success with qualified, safety-aware anchoring
  decisions](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/175)
  — covers scenario-aware scope, setting/holding evidence, available room,
  qualified wording, and theory/quiz consistency.
- [#176 — Model and teach holding checks, swinging clearance, and
  recovery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/176)
  — covers swept area, hazards and neighbours, dragging, watchkeeping,
  condition changes, recovery, and linked remediation.
- [#180 — Make Anchor Minigame keyboard scope and result handling
  accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/180)
  — covers global shortcuts behind the result overlay, modal/background
  behavior, focus, announcements, names, and non-colour state.
- [#177 — Provide efficient pointer and touch manipulation with equivalent
  controls](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/177)
  — covers direct/continuous adjustment, coarse/fine movement, gesture safety,
  keyboard equivalence, synchronization, and responsive target sizes.
- [#179 — Make Anchor Minigame scenarios varied, non-repeating, and
  reproducible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/179)
  — covers stable identities, cycles/history, copy-model consistency,
  meaningful condition variation, retries, and deterministic tests.
- [#181 — Define and persist Anchor Minigame completion and remediation
  progress](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/181)
  — covers mastery, safe metrics, durable/offline progress, run restoration,
  idempotent credit, parent handoff, and targeted remediation.
- [#178 — Make the dynamic anchor scene an accurate, responsive learning
  graphic](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/178)
  — covers schematic labelling, correct dimensions, plan-view terminology,
  dynamic alternatives, zoom/forced colours, camera boundaries, and geometry
  invariants.
