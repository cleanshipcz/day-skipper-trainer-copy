# Clearing Bearings learner-facing audit

- Audit issue: [#115](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/115)
- Route/topic: `/pilotage/clearing-bearings` / `pilotage-clearing-bearings`
- Audited: 2026-07-31
- Theory page: `src/pages/ClearingBearingsTheory.tsx`
- Exercise: `src/components/pilotage/ClearingBearingTool.tsx`

## Verdict

**The route is reachable and introduces the purpose of a limiting bearing, but
its worked chart exercise is internally contradictory and cannot assess the
skill it claims to teach.** Both answers are printed in the scenario text and
hint. More seriously, neither answer describes the displayed landmark, hazard
and vessel geometry. The validator then applies a symmetric ±5° tolerance:
scenario 1 praises 040° although the page explicitly says 040° is on the danger
side of NLT 045°, and scenario 2 praises 325° although it says that is the
danger side of NMT 320°.

The learner does not plot or measure anything; the chart is a non-interactive
illustration followed by a number field. Its generic land, shallow-water and
coordinate artwork is not used by validation. There is no exercise score or
mastery gate, and **Mark as Complete** is enabled immediately and is not wired
to exercise completion. Completion is displayed locally even for an anonymous
user or failed save.

The theory's core idea—monitor one identified fixed object against a planned
safe-water limit—is useful, as are its reminders to use a safety margin,
compare bearings in the same reference and avoid magnetic interference. It
needs chart-based examples that establish the actual safe side, handle angular
wrap and distinguish a true chart bearing from a compass observation. Three
focused follow-ups are proposed; shared progress-save behavior remains owned by
the existing cross-topic issue.

## Evidence and audit bounds

### Method

The menu, route and topic registries, entire theory page, scenario data,
validator, rendered line geometry, shared chart surface and progress boundary
were inspected. Bearings and circle tangents were independently recomputed
using 0° north/clockwise convention. Input boundary and terminal paths were
traced from source.

Content scope was compared with the current MCA yacht oral and navigation and
radar syllabuses: candidates must identify clearing marks from the chart to
plan a safe approach, convert true/compass bearings using variation and
deviation, check position regularly and take action off track.[^mca-oral]
The MCA navigation syllabus expressly assesses clearing bearings and transits
within chartwork.[^mca-nav]

No real chart, chart edition, local publication, landmark, variation or compass
deviation is supplied, so no real-world clearing bearing can be certified. The
repository has no installed general Playwright suite and no live browser,
screen reader, touch hardware, high-zoom or authenticated backend round-trip
was exercised. Responsive and accessibility findings are therefore based on
rendered component structure and source, not claimed device validation.

## Reachability, completion and persistence

- `/pilotage` links the card to `/pilotage/clearing-bearings`; the route and
  canonical durable ID agree, and both back controls return to `/pilotage`.
- The five theory tabs are reachable through Radix keyboard tab semantics.
  There is no prerequisite, visited-section state or learning-path gate.
- The page renders `ClearingBearingTool` without `onAllScenariosComplete`.
  Consequently its final **Complete Exercises** button invokes no behavior and
  the page never knows whether either scenario was attempted or solved.
- **Mark as Complete** is enabled on first render. It calls `saveProgress(...)`
  without awaiting or inspecting its Boolean result, then permanently shows
  **Completed** in local state. Anonymous users therefore see completion even
  though `saveProgress` returns false; terminal save failure behaves the same.
- Existing completion is not loaded. Reload removes the local badge even when
  authenticated progress exists. Score 100 and ten points are self-attested,
  independent of reading or practice.
- Cross-topic durable completion, hydration and save-failure behavior is
  already owned by [#238](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)
  and should not receive a clearing-bearing duplicate.

## Theory, conventions and operational safety

### Useful foundations

- The page correctly frames a clearing bearing as a boundary/limit rather than
  a position fix, and calls for an identifiable charted fixed object.
- Selecting a conspicuous object, constructing a limit with a safety margin,
  labelling it, monitoring regularly and responding on the unsafe side are
  appropriate chartwork concepts.
- It correctly warns that charted true and observed compass bearings must be
  compared in a common reference and that magnetic interference matters.

### Gaps and misleading absolutes

- NLT/NMT is taught as a bare numeric comparison. Bearings are circular: near
  000° an unqualified `>=`/`<=` rule can invert at north. A safe side must be
  established graphically from the chart and stated for the intended sector,
  not inferred from arithmetic alone.
- The examples declare 050° safe for NLT 045° and 315° safe for NMT 320° but
  show no chart, observer position, hazard, direction of travel or safety
  margin proving those sides. “If the bearing increases” is likewise
  insufficient across 359°/000° and without the plotted geometry.
- “Apply variation and any deviation” blurs instruments. Deviation belongs to
  the compass used and local magnetic environment; a vessel steering-compass
  deviation card is not automatically the correction for an independent
  hand-bearing compass. The lesson should name True, Magnetic and Compass at
  each step and use one explicit conversion example.
- “Chart accuracy and tidal height can shift actual danger zones” is imprecise.
  Tide changes available depth over a charted shoal, while the planned limit
  must account for chart datum, draught, height of tide, survey/chart quality,
  position uncertainty and an appropriate safety margin; the charted feature
  itself is not said to move.
- “Alter course immediately” omits traffic, depth, channel limits and collision
  risk. The contingency and safe corrective direction should be planned, then
  executed consistently with the full navigational situation and cross-checks.
- The page does not teach selecting a reliable fixed object, positive
  identification, checking chart notes/publications/notices, compass error,
  monitoring trend, or that one limit constrains only one side and is not a
  position fix or guarantee that all other hazards are clear.

**Proposed focused issue A — Correct Clearing Bearings theory and teach a
chart-derived safe limit** (`src/pages/ClearingBearingsTheory.tsx`)

- Reproduction/context: follow either NLT/NMT example; no plotted geometry
  establishes its safe side, and the arithmetic rule is undefined across
  359°/000°. Compare the generic correction wording with a named hand-bearing
  and steering compass.
- Learner impact: a learner can apply the inequality or the wrong compass
  correction mechanically and choose the danger side.
- Acceptance: add worked chart diagrams with object, observer sector, hazard,
  margin and explicitly shaded safe side; handle north wrap; show a traceable
  True↔Magnetic↔Compass conversion for the actual observation instrument;
  qualify tide/chart uncertainty and corrective action; teach identification,
  publications, monitoring trend and cross-checks; cite current authoritative
  sources; test the safety-critical labels and examples.
- GitHub link: [#267 — Correct Clearing Bearings theory and teach a
  chart-derived safe limit](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/267).

## Exercise geometry, validation and feedback

- The answer is disclosed twice before interaction: “NLT 045°T”/“NMT 320°T”
  appear in both description and hint. The exercise tests copying a number.
- Despite “Plot” instructions, the SVG is `pointer-events-none`; there is no
  plotting, measuring, vessel movement or compass interaction. Only a numeric
  answer is accepted.
- Scenario 1 landmark→hazard-centre bearing is 123.69°T; tangents to the
  30-unit hazard circle are 114.11°–133.27°T. The configured solution is 045°.
  The depicted vessel→landmark bearing is 000°T, not 045°T.
- Scenario 2 landmark→hazard-centre bearing is 215.54°T; tangents are
  207.18°–223.89°T. The configured solution is 320°. The depicted
  vessel→landmark bearing is 075.38°T, not 320°T.
- The revealed “solution” line is drawn *from* the landmark on the configured
  bearing. An observed bearing of the landmark is measured from the vessel;
  the corresponding line from landmark toward vessel is reciprocal. Neither
  configured solution nor reciprocal reconciles all displayed geometry.
- `abs`/wrap distance accepts either side of the answer. Thus 040° is accepted
  for NLT 045° and 325° for NMT 320°, directly contradicting the page's danger
  examples. Decimal and exponent input are also accepted despite `step=1`;
  that is benign but untested.
- The shared chart fabricates coordinate labels and land/shallow areas without
  scenario meaning. `SCALE_PX_PER_NM` does not inform any calculation. Hazard
  radius, vessel position, land and depth never participate in validation.
- Incorrect feedback repeats the convention but does not explain which side,
  geometry or correction is required. Correct feedback praises tolerance even
  on the convention's declared unsafe side. Solved state is mount-local and no
  result, attempts, score, retry summary or completion evidence is retained.
- Ten tool tests cover rendering, exact expected answers, generic
  correct/incorrect feedback, scenario advancement and an isolated completion
  callback; eleven page tests cover section presence and self-attested saving.
  `ChartSurface` is mocked, the page test never asserts that it passes the
  callback, and there is no assertion that a solution is tangent to its hazard,
  its safe side matches the convention, the plotted line is
  reciprocal-consistent, or failure/input boundaries behave as intended.

**Proposed focused issue B — Rebuild the Clearing Bearing exercise around
valid chart geometry and mastery** (`ClearingBearingTool.tsx`, scenario model
and tests)

- Reproduction/context: enter 040 in scenario 1 or 325 in scenario 2; each is
  praised despite the theory labelling it dangerous. Independently plot the
  landmark/hazard coordinates and compare the tangent bearings above.
- Learner impact: the exercise rewards copying, geometrically wrong answers and
  explicitly unsafe sides while claiming chartwork competence.
- Acceptance: define each scenario from coherent chart geometry and a named
  bearing reference/direction; derive or independently validate the limiting
  bearing and safe side; remove answers from prompts; require the learner to
  plot/measure or perform an equivalent assessable task; make chart features
  meaningful; use directional rather than symmetric acceptance; give
  explanatory retry feedback; wire declared mastery to page completion; add
  deterministic geometry, wrap, boundary, input and terminal-flow tests.
- GitHub link: [#268 — Rebuild the Clearing Bearing exercise around valid
  chart geometry and mastery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/268).

## Accessibility, responsive layout and input methods

- The chart SVG has no role, accessible name, description or structured text
  equivalent. Its landmarks, vessel, hazard and coordinate text form an
  unlabelled graphics tree; a non-visual learner cannot obtain the geometry.
- Feedback is inserted without `role=status`/`alert`, a live region or focus
  movement. After Check, keyboard and screen-reader users are not deliberately
  led to the outcome or newly appearing Next/Complete control.
- The number input has a programmatic label and all action buttons are native
  keyboard controls. Pressing Enter in the field does not submit because the
  controls are not a form; keyboard users must tab to Check.
- Meaning is reinforced with text/icons rather than colour alone, but the
  green/amber badge text uses relatively low-intensity colour on varying
  backgrounds and no contrast verification is checked in.
- Five tabs become two columns until `lg`; labels/icons can wrap and create
  irregular rows at narrow widths or high zoom. The input and Check button use
  a non-wrapping horizontal flex row with no small-screen fallback.
- `ChartSurface` uses `preserveAspectRatio="xMinYMin slice"` in a width/height
  auto SVG inside an unconstrained wrapper. Its generic chart can be cropped or
  take browser-dependent intrinsic height; there is no aspect-ratio container
  or viewport regression coverage.
- Pointer/touch users cannot interact with the advertised chart at all. No live
  375/768/1280 CSS-pixel, 200%-zoom, touch, screen-reader or keyboard workflow
  evidence exists.

**Proposed focused issue C — Make the Clearing Bearing learning path
accessible and responsive** (`ClearingBearingsTheory.tsx`,
`ClearingBearingTool.tsx`, `ChartSurface.tsx` where shared, and tests)

- Reproduction/context: inspect the route with a screen reader or at a narrow
  viewport/high zoom; the chart has no equivalent, feedback is unannounced,
  and tabs/input actions have no explicit reflow contract.
- Learner impact: non-visual learners cannot perform the geometric task, while
  keyboard, mobile and zoom users can miss outcomes or encounter compressed and
  cropped controls.
- Acceptance: provide an equivalent structured chart/task; name and describe
  the graphic and its relevant objects; announce feedback and manage focus;
  support Enter without accidental duplicate actions; define robust tab,
  chart, input and action reflow; preserve touch scrolling and target sizes for
  any future plot interaction; verify contrast; add component/a11y coverage and
  document checks at 375/768/1280 CSS pixels, 200% zoom, keyboard, touch and a
  screen reader.
- GitHub link: [#269 — Make the Clearing Bearing learning path accessible and
  responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/269).

## Follow-up ownership

1. [#267 — Correct Clearing Bearings theory and teach a chart-derived safe
   limit](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/267).
2. [#268 — Rebuild the Clearing Bearing exercise around valid chart geometry
   and mastery](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/268).
3. [#269 — Make the Clearing Bearing learning path accessible and
   responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/269).
4. Existing shared owner: [#238 — completion persistence and save-failure
   behavior](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238).

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca-oral]: UK Maritime and Coastguard Agency, [Master (Code vessels less than
  200 GT)/Officer of the Watch (yachts less than 500 GT) Oral Examination
  Syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  updated 17 June 2026, section 1.1 items 1, 5–7 and 10.
[^mca-nav]: UK Maritime and Coastguard Agency, [Navigation and Radar
  Examination Syllabus](https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus),
  section 1.3.1 items 2–6.
