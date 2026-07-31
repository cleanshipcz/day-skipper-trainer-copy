# Tidal Height Calculator learner-facing audit

- Audit issue: [#110](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/110)
- Route/topic: `/navigation/tides/heights-calc` / menu ID
  `tidal-heights-calc`
- Audited: 2026-07-31
- Page: `src/pages/TidalHeightsCalculator.tsx`
- Calculator: `src/components/navigation/TidalPassageCalculator.tsx`
- Completion path: `src/hooks/useCompletion.ts`

## Verdict

**The calculator demonstrates the correct basic under-keel-clearance
rearrangement, but it is not dependable as either an operational passage
planner or an assessment.** With the defaults it computes the required height
of tide as `1.5 + 1.0 - 0.5 = 2.00 m` and draws a plausible-looking curve.
However, it fits an undocumented cosine to one HW/LW pair and describes the
resulting, sampled and arbitrarily clipped windows as “exact.”

Clock times have no date or time zone. An overnight pair is interpreted as a
long reversed interval; equal event times divide by zero. Missing and
physically invalid values enter the model without validation. Threshold
crossings are sampled at six-minute increments but formatted to the minute,
while axes, clipping and out-of-range values can disagree with the text
summary.

The random drill leaks its answer through the always-visible safe-window
summary and gives only binary feedback. Pointer interaction is suppressed in
drill mode while keyboard editing remains possible. Inputs lack reliable
programmatic labels and the SVG has no accessible equivalent. Completion is
available immediately, uses a non-canonical ID and navigates away without
awaiting persistence. Two focused follow-ups cover calculator correctness and
interaction quality; existing #245 and #248 retain shared completion and theory
ownership.

## Evidence and audit bounds

### Method

The parent Tides menu, route definition, page, complete calculator component,
completion hook, progress registry and durable-ID catalogue were inspected.
Every input and control was traced through its state transitions. The default
formula and representative normal, threshold, overnight, equal-time, inverted,
empty, negative and extreme cases were evaluated from the implementation.

The model was compared with the MCA navigation syllabus, which requires
predicted height or time to be calculated with tide tables and tidal curves and
requires prediction reliability to be discussed.[^mca] Admiralty Tide Tables
include prediction methods and the effects of meteorological conditions; the
calculator identifies neither a publication nor those limits.[^att]

The repository does not install Playwright. The requested live route exercise
at 375, 768 and 1280 CSS pixels therefore could not be performed. Responsive,
keyboard and accessibility findings are source-based. No authenticated backend
round-trip, offline replay, screen reader, touch hardware, high zoom,
forced-colour mode or generated random distribution was exercised. The
calculator itself has no focused tests.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learning path

- `/navigation` exposes **Tidal Theory & Streams** at `/navigation/tides`.
  The parent menu exposes **Tidal Height Calculator**, and `routes.tsx`
  resolves the audited path to `TidalHeightsCalculator`.
- Back returns to `/navigation/tides`. The adjacent theory page links forward
  to this route, although it does not prepare the learner for this model.
- The page title changes the menu's “Tidal Height Calculator” into **Tidal
  Passage Planner**. It states that the graph shows “exact” safe windows, but
  does not identify its cosine interpolation, data source or intended
  non-operational status.
- There is no prerequisite, help, example, reset or route back to the theory.
  Practice and completion are available immediately.

## Inputs, units and required height

### What is sound

- The displayed relationship `required height of tide = draught + clearance -
  charted depth` is the correct rearrangement when all values are metres
  relative to the same datum and positive charted depth is used.
- The defaults therefore require `2.00 m` of tide. Equality is classified safe,
  consistently treating the entered clearance as the minimum.
- A negative charted-depth value can algebraically represent a drying height.
  Number fields use a nominal `0.1` step, and the required result displays
  metres.

### Validation and sign failures

- No field has `min`, `max`, `required`, validity handling or an error message.
  Empty number fields are converted with `Number("")` to zero. Negative
  draught/clearance, inverted or negative HW/LW heights, extreme values and
  non-finite programmatic values all flow into output.
- HW need not exceed LW. Equal heights create a flat “tide”; inverted heights
  relabel a low point as HW without objection.
- “Use negative for Drying ex: -1.2” is the only sign guidance. It does not
  explain that a charted drying height is subtracted, require a common chart
  datum or guard against entering the printed positive drying-height magnitude.
- “Safety” and “Clearance” are used interchangeably. No rounding policy,
  source precision, uncertainty or conservative-margin guidance supports the
  two-decimal required result.

[#251](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/251)
owns validation, datum/sign treatment and safe numeric behavior.

## Curve, time and safe-window calculations

- `parseTime` turns clock time into hours since an unspecified midnight. There
  is no date, zone or daylight-saving context.
- The code divides by `lwTime - hwTime`. Equal times yield a zero half-cycle
  and non-finite curve coordinates. For HW 23:00 and LW 05:00 it uses `-18`
  hours rather than the next day's six-hour fall, sorts the plot endpoints to
  05:00 then 23:00 and produces an unrelated reversed curve.
- The cosine is simply forced through the entered extrema. It is not a selected
  standard-port curve, secondary-port correction or harmonic prediction.
  Calling its output “exact” is unsupported by both model and source data.
- The plot begins one hour before the smaller numeric clock time and ends one
  hour after the larger. A safe interval reaching either boundary is reported
  as if that artificial boundary were a crossing.
- Despite comments saying ten or fifteen minutes, points use `0.1` hour
  (six minutes). Crossing times are the first sampled unsafe/safe point rather
  than solved intersections, then are rounded to a displayed minute. The
  apparent precision exceeds the input step and model.
- Time labels select every fourth point, so they are 24 minutes apart rather
  than “approximately every hour.” Their bespoke formatting can emit `:60`;
  unlike `formatTime`, it does not carry rounded minutes into the hour.
- The vertical scale has a six-metre minimum maximum but no lower-domain
  accommodation. Negative tide curves can draw below the plot and high LW
  values can draw above it when HW is lower. Required lines outside `0..hMax`
  disappear, although safe-window text is still emitted.
- Safe status is based only on height. No timing tolerance, squat, wave action,
  changing draught, survey/chart uncertainty or observed-versus-predicted
  residual is represented or bounded.

These defects can turn valid overnight data into a wrong window and invalid
data into authoritative-looking green output. [#251] owns the calculation
model and regression matrix; [#248] owns publication-aligned teaching and
prediction limitations.

## Generated practice and feedback

- **Start New Scenario** generates plausible-looking one-decimal heights,
  vessel values and a 5.5–6.5-hour fall. It includes signed charted depths from
  `-2.0` to `+2.0 m` without teaching or checking the drying-height convention.
- Randomness is unseeded. The unrelated `0..999` scenario ID can collide and
  does not make a scenario reproducible.
- The question time is retained at unrounded precision while displayed to the
  minute; HW/LW times are rounded separately before answer calculation.
- Before an answer, only the translucent green SVG rectangles are hidden. The
  full curve and required line remain, and the textual **Safe Navigation
  Windows** badges remain visible, directly revealing the answer.
- Feedback is only “Correct! Well done.” or “Incorrect. Check the graph!” It
  omits the predicted height at the question time, required height,
  substitution, clearance margin, units, rounding and explanation.
- Either answer ends the attempt. There is no answer selection state, retry,
  attempt history, mastery criterion or relationship between drill success and
  completion.
- In drill mode the input grid receives `pointer-events-none`, but its controls
  remain enabled and keyboard-focusable. Keyboard users can alter the scenario
  while pointer users cannot, with no announced read-only state.

[#252](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/252)
owns reproducible scenarios, non-leaking assessment, explanatory feedback and
coherent interaction semantics.

## Completion and persistence

- **Mark Exercise as Complete** is enabled from first render and does not
  depend on using the calculator or answering a drill.
- It calls `completeTopic("tidal-heights-calc")` and immediately navigates away.
  `completeTopic` does not return or await `saveProgress`, so pending, anonymous
  and failed saves are indistinguishable from confirmed persistence.
- `tidal-heights-calc` is absent from both `topicRegistry` and
  `durableProgressIds`; the registered `tides` parent has no leaf catalogue.
- Existing [#245](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
  owns canonical Tides IDs, evidence-based completion, save outcomes,
  idempotency, aggregation and reload behavior. #252 owns this calculator's
  accessible presentation and assessment integration without duplicating the
  shared persistence work.

## Accessibility and responsive behavior

- The icon-only Back button has no accessible name. Its arrow is not marked
  decorative.
- Every `Label` lacks `htmlFor`, and every input lacks an `id`; visual proximity
  does not create a reliable programmatic name. Hints and units likewise lack
  description/error associations.
- The SVG has no `title`, `desc`, labelled role or structured data equivalent.
  Green/red colour, shading and geometry carry safety meaning; the textual
  badges give windows but not the curve, values or required-height
  relationship.
- Drill correctness is styled red/green but does include different text.
  Changes are not in a status/live region and focus is not managed between new
  question, result and next scenario.
- Two-column input grids collapse below `md`, but the drying-height hint is
  forced `whitespace-nowrap` beside its input. Long answer buttons remain in a
  fixed horizontal row. Narrow, high-zoom and translated layouts may overflow.
- The SVG scales through its viewBox and its wrapper permits horizontal
  scrolling, but small tick labels, dense 24-minute labels and colour-only
  regions have no responsive alternative.

[#252] owns calculator accessibility and checked-in viewport/input-method
coverage. Existing #249 covers the separate theory route.

## Follow-up ownership

1. [#251 — Correct Tidal Passage Planner calculations and safety
   boundaries](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/251)
2. [#252 — Make Tidal Passage Planner practice, validation, and completion
   accessible and testable](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/252)
3. Existing shared owner: [#245 — Make Understanding Tides completion durable,
   registered, and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
4. Existing instructional owner: [#248 — Make Calculating Tidal Heights
   operationally correct and practice-ready](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/248)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca]: UK Maritime and Coastguard Agency, [Officer of the Watch Unlimited
  digital assessment syllabus — Navigation, stability and
  operations](https://www.gov.uk/government/publications/mca-deck-digital-assessment-syllabuses/officer-of-the-watch-unlimited-mca-digital-assessment-syllabus-operational-navigation-stability-and-operations),
  section 5.
[^att]: UK Hydrographic Office, [Admiralty Tide
  Tables](https://www.admiralty.co.uk/publications/publications-and-reference-guides/admiralty-tide-tables).
