# The Chart learner-facing audit

- Audit issue: [#104](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/104)
- Route/topic: `/navigation/charts` / `charts-theory`
- Audited: 2026-07-31
- Primary implementation: `src/pages/ChartsTheory.tsx`
- Embedded learning tools: `ChartSymbolQuiz.tsx`, `VirtualChartPlotter.tsx`,
  `ChartSurface.tsx`, `TidalVisualizer.tsx`
- Completion: `src/features/progress/useTheoryCompletionGate.ts`

## Verdict

**The route is reachable and attractively structured, but it is not a safe or
reliable chartwork lesson in its present form.** Its three keyboard-operable
tabs introduce coordinates, datums and symbols, and its widgets invite
practice. However, core projection and datum explanations contain material
errors, the plotter's longitude geometry makes its distances, bearings and
position exercises internally inconsistent at 50°N, and the “symbol quiz” uses
emoji/text placeholders rather than chart symbols.

The tidal model demonstrates the useful arithmetic `charted depth + height of
tide`, but it does not teach clearance, under-keel-clearance allowances,
secondary-port/tidal-curve use or the safety limits of predictions. Its random
drill can ask for a negative “depth of water,” has no terminal result, and its
diagram always shows a fixed 3.75 m sounding rather than the active question.

Completion measures opening three tabs, not reading or successful practice.
Visited sections are not restored after reload. The shared completion gate
ignores `saveProgress`'s Boolean result, so caught persistence/queue failures
still navigate away; successfully queued offline work is not distinguished
from a server save. The plotter is pointer-only and its SVG has no accessible
name or text alternative. Back lacks an accessible name. The zoom controls are
named only “+” and “−”, which is technically exposed text but ambiguous without
“Zoom in/out” wording or current-scale context.

## Evidence and audit bounds

### Method

The route, parent menu, topic registry, completion hook and every embedded
component/challenge were inspected directly. Content was compared with the
current IHO S-4 chart specification (edition 4.10.0, March 2026), its linked
current INT 1 symbol catalogue, and the MCA's current chartwork examination
syllabus.[^s4][^standards][^mca]

Typecheck, lint, production build, the focused component tests and the internal
artifact guard passed. Chromium was launched at 375, 768 and 1280 CSS px, but
the local app shell did not mount in that direct headless process; therefore no
claim about rendered geometry is based on those blank captures. Responsive and
input findings below come from the concrete DOM/CSS/event implementation and
must be rechecked in the browser when the harness is repaired.

Live persistence, actual touch hardware, a screen reader, high zoom, forced
colours and offline reconciliation were not exercised.

## Reachability and learning path

- The **The Chart** card in `/navigation` links to the registered
  `/navigation/charts` route. Back returns to `/navigation`.
- The page has three Radix tabs: Coordinates & Plotting, Depths & Tides, and
  Symbols & Keys. Selecting a tab immediately counts its entire section as
  visited.
- There is no worked paper-chart example from chart title/edition and datum
  notes through position, course, distance, depth/clearance and safety checks.
  No chart correction, scale/large-scale choice, source-quality/CATZOC,
  variation note, compass rose, sounding units or caution-note procedure is
  taught.
- The page cites “Chart 5011” without an edition, link or source note. The IHO
  standards page identifies the current international catalogue as INT 1,
  edition 8 (2020); learners are not taught to consult the chart's own title,
  notes and legend.

## Coordinates, projection and distance

- The “light bulb in the centre” explanation is not a construction of the
  Mercator projection; it describes a perspective projection intuition that
  will mislead learners. IHO S-4 calls Mercator the normal projection for
  charts smaller than 1:50,000, allows suitable alternatives on larger scales,
  and notes its gross high-latitude distortion.
- “Latitudes … are equidistant everywhere” is false on a Mercator chart:
  parallels spread farther apart toward the poles. Meridians appear straight,
  parallel and equally spaced on the chart; the page instead says they “get
  closer together as you go North,” which is true on the globe, not on the
  displayed Mercator graticule.
- The practical rule to measure a short local distance on the nearby latitude
  scale is useful, but “1 minute latitude = 1 nautical mile” is presented as
  exact and universal without the nearby-latitude qualification. Direction is
  also overstated: Mercator preserves local angles and represents a rhumb line
  as straight, not every shortest route or every possible “bearing.”
- Coordinates are never taught as degrees/minutes/tenths with a worked
  read-and-plot procedure, ordering, hemispheres, precision, interpolation or
  plausibility check before the plot exercises demand them.

## Virtual Chart Plotter and eight challenges

The widget's coordinate model is the most serious functional defect:

- `ChartSurface` renders one horizontal 100 px square as one **longitude
  minute** and one vertical square as one latitude minute at approximately
  50°N. `VirtualChartPlotter` then treats both as 1 NM. At 50°N, one longitude
  minute is about `cos(50°) = 0.643` NM, so the chart cannot simultaneously
  have those labels, square cells and distance scale.
- Every distance and bearing is calculated from uncorrected SVG `dx/dy`.
  Challenge 1's labelled displacement is 3′ longitude east and 1′ latitude
  south: approximately 2.18 NM and 118°T on a locally conformal chart, not the
  expected 3.16 NM and approximately 108°T implied by the code. Challenge 2's
  1.5′ longitude east and 1.5′ latitude south is approximately 147°T, not
  135°T; its reciprocal is approximately 327°T, not 315°T. Challenge 4
  inherits the same defect.
- The plot challenges' target pixels match the component's labels, but the
  “1 Large Square = 1 Nautical Mile (1′)” caption incorrectly applies the
  latitude relationship to longitude. `ChartSurface` draws a faint pattern
  grid every one-minute square, with stronger guides and coordinate labels only
  every five squares. The weak, unlabelled minor graduations make tenths and
  half-minute plotting difficult to verify, especially at small sizes.
- Exercise mode starts with Pan even though Challenge 1 requires Distance.
  Wrong-tool actions produce no feedback. Failed attempts reveal the expected
  numeric answer, enabling answer-copying; attempts and mastery are not scored.
  `startDrill()` tests the stale pre-reset challenge index for auto-zoom.
- Pointer coordinates use separate `scaleX` and `scaleY` while the SVG uses
  `preserveAspectRatio="xMinYMin slice"`; at aspect ratios unlike 5:3 the
  mapping can diverge from the visible sliced SVG. `onPointerLeave` calls
  `releasePointerCapture` unconditionally, including paths where capture may
  not exist.
- Plot, pan, distance and bearing exist only as pointer handlers on a plain
  `div`. There is no keyboard alternative, form-based coordinate/bearing
  entry, accessible chart name/description, semantic landmark list, live
  measurement announcement or nonvisual equivalent. `touch-none` suppresses
  normal touch scrolling over a large chart.

## Datums, depth and tidal visualizer

- IHO S-4 defines Chart Datum as the reference plane for depths and drying
  heights. In oceanic tidal areas it recommends LAT or a close equivalent, but
  permits another datum by local conditions/policy; non-tidal areas may use
  MSL. The page states CD *is* LAT.
- LAT is a predicted astronomical level, not a guarantee. S-4 frames CD as the
  least depth under “normal” meteorological conditions. “Practically
  guaranteed 5m” and “Worst Case Scenario” omit surge, pressure, wind,
  prediction uncertainty, survey/settlement uncertainty and required
  under-keel-clearance margins.
- The single “Height Datum (MHWS)” card conflates different planes. S-4 says
  shore heights/lights normally use a high-water datum such as MHWS, MHHW or
  HAT, while HAT or an accepted equivalent is recommended for vertical
  clearances; the chart title must state the adopted clearance datum. “Light
  heights … measured UP from MHWS (so you know when you can see them)” is also
  incomplete: geographic range depends on observer height and Earth curvature,
  while luminous range depends on intensity and visibility.
- The depth and drying-height formulae are useful, but there are no complete
  worked examples with units, drying/exposed outcomes, tidal curve/table
  interpolation, secondary-port correction, minimum depth, draught, squat,
  heel, wave response, safety margin or under-keel-clearance decision.
- The visualizer's manual diagram always uses a fixed 3.75 m charted depth and
  fixed 1.5 m drying rock. Starting a random drill changes only the text and
  tide slider, so the visual is not evidence for the active problem.
- Random drying questions allow `tide < dryingHeight`; the checker then labels
  the negative result “depth of water” and expects the negative number instead
  of explaining that the feature is uncovered and by how much. Blank/invalid
  input silently does nothing; arbitrary negative answers are accepted where
  mathematically expected. Incorrect feedback gives the answer immediately.
  Skip is unlimited, correct answers do not advance automatically, there is no
  question count/terminal score/retry history, and changing the slider silently
  exits the drill.
- The SVG has no role/name/description or structured equivalent, slider output
  is not explicitly associated as live output, and drill feedback is not a
  live region.

## Symbols and symbol quiz

- The colour summary is a rough mnemonic, not a dependable legend. IHO S-4
  specifies land tint as usually buff/yellow or grey; intertidal green is an
  overprint; shallow-water blue limits vary by scale and user requirement
  (5 m/6 m is guidance for the largest scales), not universally “usually
  <5m.” White is not a positive guarantee of “deep water.”
- “Diamond: A buoy (Beacon)” conflates floating buoys and fixed beacons and
  invents a generic diamond rule. “Star” and `+` descriptions similarly omit
  exact symbol variants, danger context, colour and accompanying attributes.
- The five quiz prompts are explicitly placeholders. They show 💎, ⚓, the
  word “Pipeline,” `#`, and `WK`, not authoritative INT 1 chart symbols.
  Question 1's gemstone is keyed as “Stone or Rock”; therefore the quiz tests
  emoji/word association and can actively corrupt symbol recognition.
- The quiz supplies no explanation or catalogue reference. Answers lock after
  one activation and expose correctness mainly by button colour/icons; state
  is not a radio/pressed selection or live announcement. There is no
  per-question remediation, mastery threshold, durable result or relationship
  to module completion.

## Completion, persistence and failure states

- Coordinates is visited on mount. Selecting Depths and Symbols, including via
  two ArrowRight presses, unlocks completion without using any embedded tool.
- The gate records only the first `in_progress` transition; later tab evidence
  is local and returning evidence is not hydrated. Reload starts the gate over.
- `markCompleted()` awaits the shared save call but ignores its returned
  Boolean. `useProgress` catches persistence failures: non-retryable and
  offline-queue failures return `false`; successful retryable queueing returns
  `true`. The page navigates in all cases and does not distinguish server-saved,
  queued and failed outcomes.
- There is no page-level saving/queued/failure/retry state and no test for
  rapid repeated completion, duplicate points, owner change or reconciliation.

## Follow-up ownership

1. [#225 — Correct projection, datum and safety-critical content in The Chart
   theory](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/225).
2. [#226 — Rebuild Virtual Chart Plotter geometry and verify all eight
   exercises](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/226).
3. [#227 — Replace placeholder chart-symbol content with authoritative
   accessible symbols and assessment](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/227).
4. [#228 — Make Tidal Visualizer a coherent validated depth and clearance
   drill](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/228).
5. [#229 — Make The Chart completion evidence-based, durable and
   save-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/229).
6. [#230 — Make The Chart page navigation and controls accessible and
   responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/230).

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test -- --run tests/ChartsTheory.test.tsx` — passed.
- `npm run build` — passed.
- `npm run guard:no-internal-artifacts` — passed.
- Chromium invocations at 375/768/1280 produced blank app-shell captures; no
  responsive pass is claimed.

[^s4]: [IHO S-4, edition 4.10.0 (March 2026)](https://iho.int/uploads/user/pubs/standards/s-4/S-4%20Ed%204.10.0_FINAL.pdf), especially B-203, B-302, B-380, B-405, B-411 and B-412.
[^standards]: [IHO Standards and Specifications](https://iho.int/standards-and-specifications), listing current S-4 and INT 1.
[^mca]: [MCA OOW 500 GT Near Coastal chartwork and practical-navigation syllabus, revised November 2024](https://assets.publishing.service.gov.uk/media/69973732bfdab2546272c016/OOW_-_500GT_NC_-_Chart-work_and_Practical_Navigation_-_Revised_Nov_24.pdf).
