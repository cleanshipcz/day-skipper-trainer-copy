# IALA Buoyage learner-facing audit

- Audit issue: [#113](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/113)
- Route/topic: `/pilotage/buoyage` / `pilotage-buoyage`
- Audited: 2026-07-31
- Page: `src/pages/BuoyageTheory.tsx`
- Drill: `src/components/pilotage/BuoyIdentifier.tsx`
- Content data: `src/data/ialabuoys.ts`

## Verdict

**The route is reachable and its cardinal-mark core is recognisable, but it is
not yet a safe, complete visual buoyage lesson or a dependable identification
assessment.** Region A colours, the four cardinal band/topmark patterns and
their Q/VQ rhythms, isolated danger, safe water and special-mark basics broadly
match IALA R1001. The page, however, renders no buoy images at all: learners see
prose descriptions, Unicode approximations and names. Shape, paint, topmark and
light therefore cannot be learned or assessed from an authentic depiction.

Several safety-relevant statements need correction or qualification. The page
reduces the conventional direction of buoyage to “entering from seaward”, names
preferred-channel marks by their base lateral side rather than the preferred
channel, says to keep a port mark “to your left”, and describes an emergency
wreck marking buoy as a generic “New Danger Mark”. IALA instead defines new
danger as a hazard state which may be marked with lateral, cardinal or isolated
danger marks, or an emergency wreck marking buoy. Safe passing cannot be
inferred from a mark alone; the relevant chart and publications remain
essential.

The 12-question drill repeatedly rebuilds and reshuffles its options on every
render, asks the learner to identify a mark from a textual answer-revealing
description, and has no reproducible session, remediation history or mastery
gate. Completion is independent of theory or drill performance and displays
local success before `saveProgress` resolves. Two focused follow-ups own the
content/visual lesson and the assessment/accessibility/progress behavior.

## Evidence and audit bounds

### Method

The Pilotage parent menu, route table, topic registry, durable-ID catalogue,
page, complete buoy dataset, drill state machine, progress hook and relevant
tests were inspected. Every dataset entry was compared with IALA Recommendation
R1001 edition 2.0[^r1001] and R0110 edition 5.0.[^r0110] Interactions were traced through first
render, correct and incorrect selection, next, final result, restart, tab
switching and completion/save failure.

The repository does not install Playwright, so the requested live browser pass
at 375, 768 and 1280 CSS pixels was not available. Responsive, touch, keyboard
and accessibility findings are source- and component-test-based. No authenticated
backend round-trip, offline replay, screen reader, touch hardware, high zoom,
forced-colour mode or real flashing-light animation was exercised. The full
test suite, typecheck, lint, production build, internal-artifact guard and
`git diff --check` were run for this audit.

## Reachability and structure

- `/pilotage` exposes **IALA Buoyage** first and routes directly to
  `/pilotage/buoyage`; the route and both back controls return to `/pilotage`.
- `pilotage-buoyage` agrees across the menu, topic registry, durable progress
  IDs and save call. There is no orphan-ID defect on this leaf.
- Four tabs separate lateral, cardinal, other marks and drill. Radix supplies
  tab/list semantics and keyboard tab switching, but the page supplies no
  overview, learning objectives, glossary or sequence. A learner can enter the
  drill before viewing any theory.
- The completion control follows all tabs at page bottom and is available on
  arrival. It is not evidence that each tab was visited or that recognition was
  demonstrated.

## Theory, terminology and safety

### Sound content

- Region A port-hand marks are red and can-shaped; starboard-hand marks are
  green and conical. The displayed topmarks and light colours agree.
- North/east/south/west cardinal paint and double-cone arrangements are
  correct. Their white Q/VQ sequences and the clock mnemonic are correct,
  including the south mark's distinguishing long flash.
- Isolated danger paint, two black spheres and group-flashing two white light;
  safe-water vertical red/white stripes, red sphere and white rhythms; and
  special-mark yellow paint, yellow X and yellow light broadly agree with
  R1001.

### Corrections and missing operational context

- “Entering a channel from seaward” is a useful common case, not IALA's full
  definition. The conventional direction of buoyage is set by the competent
  authority, normally approaching from seaward, around land masses clockwise,
  and in other waterways in a direction determined in detail by the authority.
- “Keep to your left/right” risks teaching vessel-relative steering instead of
  mark side. In the conventional direction, a port-hand mark is left to port
  and a starboard-hand mark to starboard; direction must be established from
  charted arrows, numbering and local publications rather than guessed.
- The entries called “Port Preferred Channel Mark” and “Starboard Preferred
  Channel Mark” invert the conventional learner-facing name. Red with one broad
  green band indicates **preferred channel to starboard**; green with one broad
  red band indicates **preferred channel to port**. Their meanings are broadly
  consistent, but “main channel” is not the defined term and the alternate
  channel remains usable subject to charted conditions.
- “Any rhythm” is incomplete for ordinary lateral lights: R1001 excludes the
  composite group-flashing `(2+1)` character reserved for bifurcation marks.
  Preferred-channel notation is also rendered redundantly as both `Fl(2+1)R`
  and a separate colour word.
- The special mark's yellow light is likewise not simply “any rhythm”. R1001
  excludes rhythms used for white Cardinal, Isolated Danger and Safe Water
  lights and for MAtoN, so the current dataset can direct a learner to an
  impermissible identifying character.
- Cardinal marks indicate safer water in the named quadrant relative to a point
  of interest; they do not guarantee it is universally the “deepest” or that
  danger lies only on the opposite side. IALA explicitly requires chart
  consultation.
- Safe water means navigable water around the mark, but “safe to pass on either
  side” needs charted depth, vessel draught and local-hazard qualification.
  Isolated-danger safe passing distance likewise cannot be specified from the
  mark alone.
- The blue/yellow object is specifically an **Emergency Wreck Marking Buoy**.
  “New danger” is the newly discovered obstruction/hazard and may be marked by
  appropriate lateral, cardinal or isolated-danger marks, by that buoy, and by
  other aids. The dataset's “New Danger Mark”, fixed yellow cross description
  and `Mo(L) Fl B Y` wording conflate hazard and one marking method; R1001 gives
  alternating blue/yellow flashes with one second of blue and one second of
  yellow separated by half-second eclipses. R1001 calls for duplicate marks
  only when the new danger has especially high navigational risk, and ends the
  “new danger” status when the danger is removed or its details have been
  sufficiently promulgated. The dataset's unconditional “may be duplicated
  until ... well established and charted” is therefore not the defined rule.
- The lesson does not decode Q, VQ, Fl, LFl, Oc, Iso or Morse A; distinguish
  buoy body shape from optional topmark; explain that shape/topmarks may be
  absent in allowed circumstances; cover numbering/lettering, chart symbols,
  unlit/day recognition, or report a missing/off-station aid.

[#260](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/260)
owns authoritative terminology, visual teaching, complete characteristics and
operational boundaries.

## Visual teaching and responsive presentation

- Despite “visual descriptor” field names and visual-recognition claims, no
  diagram, image, colour swatch, body silhouette, topmark drawing or animated
  light is rendered. Unicode triangles/diamonds/circles are inconsistent
  approximations and the west `⧫` resembles a diamond rather than two cones
  point-to-point.
- Colour, shape, topmark and light are only strings. The drill repeats those
  same strings, so it tests recall of supplied words rather than recognition of
  an aid afloat, on a chart, by day, or at night.
- Cards adapt from one to two columns and the tab list from two to four columns.
  Text grids collapse on narrow screens, but fixed four-choice content, badge/
  title `justify-between` rows and long light strings can crowd at high zoom.
  This was not checked in a browser.
- Colour is named in text, which helps non-colour perception, but there is no
  structured visual equivalent because there is no actual visual. Any future
  teaching artwork must preserve shape/pattern distinctions, contrast and a
  concise text equivalent without leaking drill answers.

## Identifier drill, feedback and edge states

- A session selects 12 buoys by shuffling all 12 once, so the default happens
  to cover each entry exactly once. Counts above 12 repeat the same shuffled
  order; zero yields an immediate completion calculation of `0 / 0` (`NaN%`),
  and negative values leave the component blank. These prop paths are not
  validated.
- `options` calls `buildOptions` during every render. Selecting an answer
  triggers a render and reshuffles all four buttons after the click; correct and
  incorrect answers can visibly move before feedback appears. Any unrelated
  parent render can also reorder unanswered choices, disrupting pointer,
  keyboard and screen-reader users.
- Scenarios use unseeded `Math.random`; sessions cannot be reproduced for
  support, teaching or deterministic content coverage. Tests find the correct
  option by an answer-revealing test ID rather than proving stable ordering or
  content.
- The prompt includes the exact colour, body/topmark and light as prose. Options
  are only names. There are no image, chart-symbol, topmark-only, light-rhythm,
  safe-passing or mixed-cue questions, so successful scores do not demonstrate
  practical recognition.
- Feedback reveals name and one `meaning` sentence. It does not compare the
  chosen and correct distinguishing features, explain abbreviations, cite the
  authoritative rule, show a safe chart-check response, retain missed marks or
  offer targeted review. A wrong answer cannot be changed.
- The result uses thresholds of 80% and 60%, but neither threshold is declared
  beforehand and neither affects completion. Restart erases the result and
  generates a new non-reproducible order; tab changes preserve the mounted
  state only as an implementation detail.
- Buttons are native and keyboard operable, but the choices have no radio-group
  or pressed/selected semantics before submission. Disabled answer buttons,
  inserted feedback, progress, score and completion are not announced through
  live/status regions, and focus is not moved to feedback or the next prompt.
  Correctness relies partly on green/red fills and icons.
- Options are at least full-width and auto-height, which is touch-friendly in
  source. Actual small-screen wrapping, focus visibility, zoom and screen-reader
  behavior were not exercised.

[#261](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/261)
owns stable/reproducible challenges, authentic accessible media, explanatory
feedback, mastery and tested interaction states.

## Completion and persistence

- **Mark as Complete** is enabled immediately and remains independent of tabs,
  drill attempts and score. `handleDrillComplete` intentionally discards the
  result.
- The handler calls `saveProgress` without awaiting its boolean result and
  immediately sets local `theoryCompleted`. Anonymous, offline-queued and hard
  save failure states therefore all look like confirmed completion during the
  session.
- Reload does not call `loadProgress`, so saved completion is not reflected by
  the page. Drill question, answers and result are not persisted.
- The canonical ID is correctly registered. #261 owns evidence,
  reload/save status, failure recovery and drill-state decisions for this leaf;
  shared persistence infrastructure should not be duplicated.

## Follow-up ownership

1. [#260 — Rebuild IALA Buoyage as an authoritative visual Region A
   lesson](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/260)
2. [#261 — Make buoy identification stable, accessible, explanatory, and
   evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/261)

## Authoritative sources

All sources were accessed 2026-07-31.

[^r1001]: International Association of Marine Aids to Navigation and Lighthouse
  Authorities, [Recommendation R1001: The IALA Maritime Buoyage System,
  edition 2.0](https://www.iala.int/product/r1001/?download=true), sections
  2.1–2.7 and 3.
[^r0110]: International Association of Marine Aids to Navigation and Lighthouse
  Authorities, [Recommendation R0110: Rhythmic Characters of Lights on Marine
  Aids to Navigation, edition 5.0](https://www.iala.int/product/r0110/?download=true),
  annex A.
