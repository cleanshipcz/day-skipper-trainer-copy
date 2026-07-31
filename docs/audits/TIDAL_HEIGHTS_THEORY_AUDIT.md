# Calculating Tidal Heights learner-facing audit

- Audit issue: [#109](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/109)
- Route/topic: `/navigation/tides/heights-theory` / menu ID
  `tides-heights-theory`
- Audited: 2026-07-31
- Theory page: `src/pages/TidalHeightsTheory.tsx`
- Calculator handoff: `/navigation/tides/heights-calc`
- Completion path: `src/hooks/useCompletion.ts`

## Verdict

**Calculating Tidal Heights is reachable and contains a correct basic
depth-of-water relationship and Rule of Twelves arithmetic, but it does not yet
teach a dependable tidal-height calculation.** The page defines height of tide,
charted depth, drying height, draught and clearance, and correctly calculates a
3.6 m range, one twelfth as 0.3 m, a 0.9 m fall after two hours and a resulting
height of 4.1 m.

The central tidal-curve lesson has no tidal curve. Its five instructions refer
ambiguously to plotting both heights and time on a “bottom scale,” joining
points diagonally and “adjusting for Springs/Neaps,” with no labelled scales,
source table, selected curve or worked trace. It never demonstrates the
syllabus outcomes of finding height at a given time and time for a given
height. The Rule of Twelves is presented without a sufficiently precise
applicability boundary, and the page omits secondary ports, prediction
uncertainty, date/midnight handling, irregular tides, explicit rounding and an
operational safety example.

There is no learner input or knowledge check. **Mark as Complete** is available
on first render and claims local completion regardless of persistence outcome;
its ID is outside the canonical progress catalogue. **Go to Practice Tool**
does reach the adjacent calculator, but the page neither checks readiness nor
explains that the destination's passage-window model is not a published
standard-port tidal curve. Accessibility and narrow-screen risks remain
unverified in a browser. Two new follow-ups and one existing shared owner cover
the findings.

## Evidence and audit bounds

### Method

The Tides parent menu, route table, complete theory page, calculator page and
calculator component, completion hook, progress registry and durable-ID
catalogue were inspected directly. Every control and route transition on the
theory page was traced from source. The worked Rule of Twelves arithmetic was
recalculated independently.

Content was compared with the MCA Navigation syllabus, which requires tidal
datum definitions, calculation of height at a given time and time for a given
height using tide tables and curves, and discussion of prediction
reliability.[^mca] The current MCA yacht oral syllabus separately expects
intermediate-height/time predictions for standard and secondary ports.[^oral]
The page identifies no sources.

The repository does not install Playwright, so the requested 375, 768 and 1280
CSS-pixel route exercise could not be performed. Responsive observations are
source-based. No authenticated backend round-trip, offline replay, screen
reader, touch hardware, high-zoom or forced-colours path was exercised.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learning path

- `/navigation` exposes **Tidal Theory & Streams** at `/navigation/tides`.
  Its menu exposes **Calculating Tidal Heights** at the audited URL, and
  `routes.tsx` resolves it to `TidalHeightsTheory`.
- Back returns to `/navigation/tides`. **Go to Practice Tool** resolves to
  `/navigation/tides/heights-calc` and `TidalHeightsCalculator`.
- The parent description and menu ordering imply theory followed by calculator
  practice, but neither route declares a prerequisite or loads progress.
  Completion does not navigate; the practice handoff does not mark completion.
- The destination is headed **Tidal Passage Planner** and uses
  `TidalPassageCalculator`. It accepts one HW/LW pair, vessel dimensions and
  charted depth, then fits a cosine curve and reports passage windows. The
  theory page does not explain that model or distinguish it from the published
  standard-port curve it claims to teach. Audit [#110] owns the calculator's
  own correctness and interaction review.

## Definitions, units and safety

### What is sound

- Height of tide is correctly measured above Chart Datum, and depth of water is
  correctly expressed as charted depth plus height of tide.
- `Required HOT = Draft + Clearance - Charted Depth` correctly rearranges the
  under-keel-clearance relationship for a positive charted depth.
- Treating a drying height as negative charted depth makes the same algebra
  work. The page at least flags this convention rather than silently adding a
  drying height.
- The worked quantities consistently use metres and preserve one decimal place.

### Material limitations

- “Chart Datum ... Usually Lowest Astronomical Tide” is useful UK context but
  not a safe universal assumption. The learner is not told to verify the datum
  stated on the chart and tide-table publication.
- “Standard Port” predictions are described as “very accurate.” They are
  astronomical predictions, not guarantees of observed water level or time.
  Wind, atmospheric pressure, river flow and other local conditions are absent,
  as are the need for observations and conservative margins.[^mca]
- The page defines only under-keel clearance. It omits the parallel
  height-of-tide use for overhead clearance, including air draught and charted
  height datum, despite presenting itself as the general heights lesson.
- `HOT` is introduced as an acronym without noting that ordinary publications
  normally use “height of tide.” “Almanac” is not identified by title/edition,
  and no source extract lets a learner connect the terminology to actual data.
- There is no policy for input precision, intermediate rounding, final
  reporting or avoiding premature rounding. The exact one-decimal example
  avoids rather than teaches the issue.
- The drying-height rule appears in a small italic parenthesis under formulae.
  There is no signed worked example to show why a drying height must be
  subtracted from the available height.

[#248](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/248)
owns operational terminology, units, uncertainty and safety application.

## Tidal curves

- There is no curve image, SVG, canvas, table or interactive plot on the theory
  page. `TrendingUp` is a decorative section icon, not instructional evidence.
- “Plot the HW height and LW height on the bottom scale” and then “Enter the
  time on the bottom time scale” names two different quantities on a bottom
  scale without identifying a publication layout. “Join these points with a
  diagonal line” is impossible to reproduce without showing the height/range
  transfer scale it refers to.
- “Adjusting for Springs/Neaps” does not say whether the learner selects or
  interpolates between curves, what data determines that choice, or which
  publication's method is in use.
- The five steps do not show how time is measured before/after HW, how the
  appropriate bounding HW/LW pair is selected, or how a horizontal/vertical
  trace produces a value.
- The page claims a curve can find either height at a time or time at a height
  but works neither direction. It does not explain that the latter can have a
  rising and falling answer.
- Secondary-port corrections, dates and time zones, crossing midnight,
  non-six-hour intervals and irregular/diurnal regimes are absent. There is no
  warning to use the method supplied with the relevant current publication.

The MCA syllabus explicitly expects both solution directions, definitions and
prediction reliability; the yacht oral syllabus includes both standard and
secondary ports.[^mca][^oral] [#248] owns the missing reproducible curve lesson.

## Rule of Twelves and worked calculation

- The `1, 2, 3, 3, 2, 1` hourly fractions sum to 12/12. For HW 5.0 m and LW
  1.4 m, the 3.6 m range gives 0.3 m per twelfth; a two-hour fall of
  `1/12 + 2/12 = 0.9 m` gives 4.1 m. Those displayed values are correct.
- The first bullet's “1.0m drop? No” is unexplained noise rather than a
  plausible intermediate step. It can suggest that a learner error occurred
  without identifying why.
- The third hour is labelled “Fastest!” while the fourth also contributes
  3/12. Both are the equal maximum hourly changes in this approximation.
- The subtitle confines the shortcut to an approximately six-hour
  semidiurnal tide, but the caution says only “especially in shallow waters.”
  The important boundary is whether the local rise/fall is sufficiently
  regular and close to the assumed shape and duration. Local tidal curves,
  irregular regimes and meteorological residuals can make the shortcut poor.
- Only a falling-tide, whole-hour example is shown. There is no rising case,
  partial-hour convention, required-height inversion, non-integral twelfth,
  drying-height case, learner answer or feedback.
- Calling this an “Example Calculation” is fair, but it demonstrates mental
  interpolation rather than the preceding tidal-curve process. Nothing lets a
  learner compare the estimate with a port-specific curve.

[#248] owns a corrected, bounded shortcut and applied checks.

## Completion, calculator handoff and edge states

- **Mark as Complete** is enabled immediately. `handleComplete` invokes
  `completeTopic("tides-heights-theory")` and synchronously sets
  `markedComplete=true`; reading, calculation or practice evidence is not
  required.
- `useCompletion.completeTopic` does not return or await `saveProgress`.
  Anonymous and failed saves are therefore displayed identically to confirmed
  persistence. There is no pending, queued, failed or retry state.
- The badge is mount-local and existing progress is never loaded. Reload or
  navigation resets the visible result. Rapid activation can initiate repeated
  saves before React disables the button.
- `tides-heights-theory` is absent from `topicRegistry` and
  `durableProgressIds`. The registered `tides` parent declares no submodules.
  This leaf cannot participate in the canonical hierarchy as written.
- Existing [#245](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
  explicitly owns canonical IDs and aggregation for **all Tides leaves**, the
  legacy `useCompletion` boundary, evidence-based completion, save outcomes,
  idempotency and reload behavior. A duplicate was not created.
- The practice handoff is always available and has no readiness check,
  explanation of expected skill or return path. The destination's model and
  failure states are reserved for audit #110; [#248] owns making this handoff
  pedagogically explicit.

## Accessibility and responsive behavior

- Back is an icon-only button without an accessible name.
- The sticky header is a single non-wrapping `justify-between` row containing a
  title/subtitle cluster and a long completion button. Neither side has
  explicit shrink/reflow constraints, creating a source-based narrow-screen and
  high-zoom collision/overflow risk.
- Content grids collapse below `md`, which should avoid their side-by-side
  squeeze. The Rule of Twelves rows themselves use paired text spans, but not a
  semantic table that communicates hour, fraction, cumulative change and
  result relationships.
- Formulae are monospaced paragraphs, and the worked example relies heavily on
  visual alignment, borders and colour. There is no labelled equation or
  structured figure equivalent.
- The page has no instructional tidal-curve visual. Any correction must include
  a structured textual equivalent and legible, non-colour-only labels rather
  than creating a new visual-only barrier.
- Completion persistence outcomes are not exposed in a status/live region.
  Focus remains on a button that changes to a disabled local badge.

[#249](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/249)
owns accessible controls, calculation semantics and checked-in responsive/input
coverage. It coordinates completion state presentation with #245.

## Follow-up ownership

1. [#248 — Make Calculating Tidal Heights operationally correct and
   practice-ready](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/248)
2. [#249 — Make Calculating Tidal Heights accessible and
   responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/249)
3. Existing shared owner: [#245 — Make Understanding Tides completion durable,
   registered, and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
4. Adjacent audit boundary: [#110 — Audit functionality and content quality:
   Tidal Height Calculator](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/110)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca]: UK Maritime and Coastguard Agency, [MCA/SQA Officer of the Watch
  Unlimited Navigation syllabus](https://assets.publishing.service.gov.uk/media/678e2b6eea48a571517acf4f/034-83_OOW_Navigation_Sylabus__Version_-_June_2024___002_.pdf),
  sections 8–9.
[^oral]: UK Maritime and Coastguard Agency, [Master (Code Vessels less than
  200 GT)/Officer of the Watch (Yachts less than 500 GT) oral examination
  syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  section 1.1.
