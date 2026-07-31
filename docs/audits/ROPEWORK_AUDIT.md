# Ropework & Knots learner-facing audit

- Audit issue: [#90](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/90)
- Route/topic: `/ropework` / `ropework`
- Audited: 2026-07-30
- Implementation: `src/pages/RopeworkTheory.tsx`
- Catalogue: `src/data/ropeworkKnots.ts`

## Verdict

**Needs substantial remediation before it is a safe, inclusive learning
module.** The seven-card layout is responsive, every card reveals steps, 7/7
unlocks the intended quiz route, and duplicate clicks do not add points.
However, a click itself awards “Learned” before any study or check, all
instructional visuals depend on third-party links, the activity is completely
inaccessible without a pointer, no progress is persisted, and safety-relevant
knot guidance is incomplete or ambiguous.

## Evidence and exercised paths

### Chromium runtime

A production build with placeholder local Supabase configuration (no
credentials/live backend) was exercised in clean headless Chromium via CDP.

- `/ropework` rendered seven cards at 375, 768, and 1280 CSS px with 0 px
  document horizontal overflow. Main content measured 360, 753, and 1280 px
  wide; the stacked phone page was 1,460 px tall.
- Before discovery, Chromium found only one tabbable control: the unnamed Back
  icon. None of the seven cards entered the tab order.
- Pointer-clicking each card rendered its Steps panel. Seven clicks produced
  score 105, **7/7 learned**, and **All knots learned! Ready for the quiz?**
- **Take Quiz** navigated to `/quiz/ropework`.
- Root reachability is wired through the topic registry: `ropework` is a root
  topic with route `/ropework`, and `Index.tsx` supplies the dashboard card
  labelled **Ropework & Knots** (“Master essential knots with visual guides”).
  Direct route and onward navigation were runtime-exercised; the initial root
  card click itself was source-verified rather than replayed in Chromium.
- Re-click prevention is source-confirmed by the `discovered` guard. No
  authenticated save, reload recovery, external tutorial navigation, blocked
  popup, or third-party availability was exercised.

### Learning and completion

The catalogue includes Bowline, Clove Hitch, Reef Knot, Figure Eight, Round
Turn & Two Half Hitches, Sheet Bend, and Rolling Hitch. Cards show name,
difficulty, and use; clicking immediately grants 15 points and learned state,
then reveals text steps. There is no practice action, final-form check, or
evidence that steps were read. Completion is therefore a seven-click counter,
not a learning outcome.

All state is component memory. The registered `ropework` topic ID,
authentication, and progress APIs are unused, so refresh/back navigation loses
score and learned knots and authenticated completion never reaches reports.

### Visuals, responsive behavior, and external failure

There are no embedded diagrams or animations for spatial rope paths. Each knot
has only an Animated Knots URL opened with `window.open(..., "_blank")`.
All seven destinations were fetched on 2026-07-30: each returned an HTML page
whose title matched Bowline, Clove Hitch – Rope End, Square Knot, Figure 8,
Round Turn & Two Half Hitches, Sheet Bend, or Rolling Hitch respectively.
They currently include step animations, descriptive image labels, text
instructions, and keyboard animation controls (arrow stepping and numeric
speed selection). They also carry detailed use/safety material; notably the
Bowline page warns about unloaded shaking and release under load, the Clove
Hitch page says it can slip and bind and should not be used alone, and the
Square/Reef Knot page supplies context absent locally.

This is a point-in-time availability/content-match check, not a guarantee of
future uptime, accessibility conformance, licensing for reuse, regional
availability, or compatibility with assistive technology. Blocked, offline,
moved, script-disabled, or inaccessible external content has no local fallback
or status. At phone width the local card/detail stack remains readable and
overflow-free.

### Accessibility

The seven clickable `Card` components render as pointer-only `div` elements
without role, accessible name, focus, keyboard activation, or selected/learned
semantics. Back is icon-only and unnamed. Score, details, learned state, and
completion insertion are not announced. Consequently keyboard and
screen-reader learners cannot begin or complete the module.

## Content-quality findings

The selection is useful and the Figure Eight, Round Turn, and Sheet Bend
purposes are broadly appropriate. Safety-critical qualification is missing:

- Reef Knot is recommended for “joining two ropes” without warning that it is
  a binding knot and unsafe as a load-bearing bend.
- Clove Hitch is called adjustable without its slipping/capsize limitations
  under changing or directional loads.
- Bowline is called essential for mooring without cyclic/no-load security
  qualification.
- Rolling Hitch instructions describe a crossing third turn and then a half
  hitch around its own standing part; load direction, placement, dressing, and
  final form are too ambiguous to teach the standard hitch reliably.
- Steps generally omit tail length, dressing, setting, inspection, and common
  failure forms. Text alone does not resolve which strand passes over/under.

## Focused follow-up issues

- [#159 — Correct unsafe and ambiguous Ropework knot guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/159)
- [#160 — Make Ropework knot discovery keyboard- and screen-reader-accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/160)
- [#161 — Persist Ropework learning completion and recover save failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/161)
- [#162 — Add licensed self-contained knot visuals and resilient tutorial links](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/162)
- [#163 — Replace Ropework click-to-learn points with meaningful practice checks](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/163)
