# The Compass learner-facing audit

- Audit issue: [#106](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/106)
- Route/topic: `/navigation/compass` / `compass-theory`
- Audited: 2026-07-31
- Theory page: `src/pages/CompassTheory.tsx`
- Interactive tools: `src/components/navigation/CompassConverter.tsx`,
  `src/components/navigation/DeviationDrill.tsx`
- Registry/navigation: `src/app/routes.tsx`, `src/pages/NavigationMenu.tsx`,
  `src/constants/topicRegistry.ts`

## Verdict

**The Compass is reachable and its basic east/west arithmetic is internally
consistent, but it is not yet a trustworthy practical lesson in using a chart
compass rose and a vessel deviation card.** It introduces True, Magnetic and
Compass references, variation, deviation and CADET, offers a live True-to-
Compass converter, and drills eight headings across east and west variation.
For valid integer inputs, the converter applies the displayed convention
correctly and normalizes ordinary crossings of 000°.

The central drill nevertheless selects deviation by **true heading**, while a
deviation card/curve applies residual deviation by the vessel's compass
heading. It therefore rewards a procedure learners cannot transfer safely to a
real card. Neither tool shows a worked calculation, and the page has no
compass-rose or deviation-card visual. It does not teach how to update charted
variation for epoch/annual change, how to obtain the appropriate deviation
entry, or how the same process works for bearings.

The converter treats cleared and out-of-range fields as usable numbers and can
retain or emit authoritative-looking “Steer This” output for incomplete or
invalid exercises. The drill accepts an entirely blank submission, gives
wrong rows only red styling, never reveals the expected answer or reasoning,
and tests the same fixed table in two variation states. Important controls and
results lack accessible names/state/announcements. Theory completion is gated
only by reaching 80% of document height, and the page navigates away even when
progress persistence reports failure. These findings are owned by five focused
follow-ups.

## Evidence and audit bounds

### Method

The parent menu, route and topic registries, complete theory page, converter,
drill, completion hook and persistence path were inspected directly. Each
conversion formula and all 16 drill keys (eight headings under 5°W, then 4°E)
were independently recomputed from the source sign convention. Edge paths
were traced for cleared, blank, zero, decimal, boundary, out-of-range and
wraparound input; submit, lock, reset and completion paths were also inspected.

Content and expected competency were compared with current MCA syllabus and
magnetic-compass guidance. The production route could not be browser-exercised:
the repository does not install Playwright, and the available OpenClaw browser
handler was unavailable. Requested 375, 768 and 1280 CSS-pixel checks are
therefore source-based only. No authenticated backend round-trip, offline
replay, touch hardware, screen reader, forced colours, high zoom or actual
vessel deviation card was exercised.

Focused completion-gate tests, the full test suite, typecheck, lint, production
build, internal-artifact guard and `git diff --check` were run for this audit.

## Reachability and module promise

- `/navigation` exposes **The Compass**, described as “True, Magnetic, Compass
  & CADET rule,” at `/navigation/compass`; `routes.tsx` resolves that path to
  `CompassTheory`, and the topic registry associates it with
  `compass-theory`.
- The header Back control and successful completion both return to the correct
  parent, `/navigation`.
- The page has no direct quiz prerequisite. Its drill appears below the
  converter in normal reading order, but completion requires neither tool to
  be used nor any answer to be correct.
- The page is text/cards/table only. The globe, rotate and compass icons are
  decorative cues; none explains angular relationships. There is no actual
  chart compass rose, north-reference diagram, deviation card/curve, or plotted
  heading with which to connect the arithmetic to passage planning.

## Theory quality and currentness

- The three-reference sequence is broadly correct: charts conventionally
  provide true reference, variation relates true and magnetic, and deviation
  relates magnetic and a particular vessel compass. Calling Magnetic North
  simply “the direction the Earth's magnetic field points” is compressed, but
  the learner-facing distinction is serviceable at this level.
- The signed operations shown are internally consistent. With east positive,
  `T = C + D + V`, so True-to-Compass reverses them:
  `C = T - V - D`. The converter implements exactly that sequence.
- The lesson gives no fully worked example in either direction despite naming
  both Compass→True and True→Compass. It does not expose intermediate signed
  values in a calculation trace or diagnose a sign error.
- Variation is said to change with location and time, but the learner is not
  shown a chart's variation epoch/annual change, how to update it to the
  relevant date, or when to obtain a current value.
- Deviation is correctly said to vary with vessel heading and be unique to the
  vessel, but the page never says that a deviation card/curve is tied to a
  particular compass and indexed by compass heading. It omits practical
  interpolation/iteration and the need to re-check after changes which may
  affect vessel magnetism.
- The current MCA yacht oral syllabus explicitly expects application of
  variation and deviation in both directions and understanding their causes.
  MCA written compass-work outcomes include determining local variation from
  the chart, explaining deviation change with ship's head, and converting both
  courses and bearings. MCA MGN 610 requires a residual-deviation table/curve
  and identifies equipment/structural changes and regular monitoring as
  reasons to verify or adjust a compass.[^mca-oral][^mca-written][^mgn610]
- “True Virgins Make Dull Company” is neither explained nor needed for the
  displayed arithmetic. It is outdated/exclusionary phrasing in a learning
  product and competes with the clearer signed convention. “At Easter we Buy
  (Add) Eggs” also does not encode the complete direction/conversion rule.
  [#237](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/237)
  owns complete, traceable theory and neutral procedural teaching.

## Interactive CADET Converter

### Correct valid path

For complete ordinary inputs, the tool correctly computes:

1. `M = T - V`, treating east as positive and west as negative;
2. `C = M - D` with the same convention; and
3. a 0–359 result for normal single-turn wraparound.

Direction buttons toggle independently between E and W and the displayed
minus/plus signs match the formula. Magnetic provides a useful intermediate
checkpoint. However, the converter supports only True→Compass input despite
the surrounding lesson presenting both conversion directions, and it rounds
both results without explaining its precision policy.

### Invalid and failure paths

- Each `onChange` stores `Number(e.target.value)`. `Number("")` is zero, so
  clearing a field cannot restore the declared empty state. Missing data is
  silently reinterpreted as a real 0° error/heading.
- HTML `min`/`max` attributes do not prevent manually typed out-of-range
  values from reaching the effect. No application validation or learner-facing
  error exists.
- `(value + 360) % 360` handles normal crossings but only adds one turn.
  Sufficiently large invalid values can still produce a negative JavaScript
  remainder.
- Results are rounded to whole degrees without saying whether decimals are
  allowed or how rounding affects a course to steer.
- Outputs are always styled as valid results and Compass is captioned “Steer
  This”; there is no caveat that the exercise result depends on current,
  applicable source data and must not substitute for passage verification.
  [#235](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/235)
  owns validation and honest output state.

## Deviation Table Drill

### Calculation defect

The table presents each row's starting value as True and computes Magnetic
correctly as `T - variation`. It then executes
`DEVIATION_DATA[heading]`, where `heading` is the True row key. Thus the 000°T
row always uses the entry named `000`, the 045°T row always uses `045`, and so
on. A real residual-deviation table/curve is applied for the compass heading
to which it belongs, not the starting true heading. Finding compass course may
require selecting/interpolating the applicable entry against the resulting
compass heading. The table supplies no heading label for its mock deviation
data and hides this invalid lookup behind a pre-filled “Dev” column.

The exercise therefore keys consistent arithmetic against an incorrectly
selected source value. For example, initial 000°T, 5°W variation and the
source's 2°W `000` entry is keyed as 007°C. That does not demonstrate that 2°W
is the deviation applicable at 007°C, and the learner cannot inspect a card to
resolve it. [#234](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/234)
owns the model and answer-key correction.

### Every drill path

- Initial state uses 5°W variation. `New Drill` toggles to 4°E; the next reset
  toggles back. Headings, deviation values and row order never change, so
  repeated practice quickly becomes answer recall.
- `Check Answers` is enabled with no entries. Every blank becomes
  `Number("") === 0`; the attempt completes as 0/8 and all inputs lock.
- Any JavaScript numeric syntax accepted by a text input is coerced by
  `Number`; there are no range, integer, three-digit or 000°/360° equivalence
  rules. A mathematically equivalent 367° response to 007° is marked wrong.
- Correct answers get green styling and an icon; wrong answers get red styling
  only. Neither path shows the expected value, calculation, applicable card
  row or explanation. Learners cannot diagnose whether variation, deviation
  or wraparound caused an error.
- `New Drill` clears score, entries and feedback correctly and changes
  variation, but no progress or mastery record is persisted. This is
  reasonable for an embedded practice widget only if the page does not imply
  drill success is required; currently module completion ignores it entirely.

## Completion and persistence

- A passive scroll calculation marks the single synthetic `read-content`
  section visited once viewport bottom reaches 80% of total document height.
  This does not prove that the learner viewed named sections or attempted
  either tool. Tall screens may satisfy it on initial load; content/layout
  changes can move the threshold.
- In-progress visited state is held in component memory and written at most
  once, but the hook does not load it on remount. Reload can disable completion
  again even if an authenticated in-progress record exists.
- `markCompleted` ignores the boolean returned by `saveProgress` and returns
  true whenever the local gate was open. The page ignores that return value
  anyway and always navigates to `/navigation`. Anonymous save, non-retryable
  backend failure, and offline-queue failure can therefore look like success
  while losing completion and points.
- The shared persistence layer has useful retryable-error queueing and
  idempotent completion/points behavior, but this page provides no visible
  retry/recovery contract at its completion boundary.
  [#238](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)
  owns shared completion integrity.

## Accessibility and responsive behavior

- Header Back is an icon-only button without an accessible name.
- True input has a label, but Variation and Deviation number inputs do not.
  Their E/W buttons announce only the current letter, with no quantity or
  explicit state. Repeated drill inputs have no labels connected to their
  True-heading rows.
- Magnetic and Compass results are generic visual containers. Converter
  changes, score, per-row correctness and completion errors have no deliberate
  live-region or focus behavior.
- Drill correctness depends on green/red borders; the correct-row icon has no
  accessible label and wrong rows have no textual status or answer.
- The converter intentionally stacks at below `md`, which is a reasonable
  source-level mobile approach. The drill remains a five-column table with
  fixed-width hints and a compound final cell, without an explicit overflow
  wrapper/reflow treatment. Browser verification at 375/768/1280 was blocked,
  so clipping and touch target behavior remain unverified.
  [#236](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/236)
  owns accessible feedback and checked-in responsive coverage.

## Follow-up ownership

1. [#234 — Correct Deviation Drill to use compass-heading deviation and show
   the applied lookup](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/234)
2. [#235 — Validate Compass Converter input and keep incomplete or invalid
   calculations honest](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/235)
3. [#236 — Make Compass tools and drill feedback accessible and usable on
   narrow screens](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/236)
4. [#237 — Complete Compass theory with traceable worked conversions and real
   chart/deviation-card use](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/237)
5. [#238 — Keep theory completion gated until progress is actually
   saved](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca-oral]: UK Maritime and Coastguard Agency, [Master (code vessels less than
  200 GT)/Officer of the Watch (yachts less than 500 GT) Oral Examination
  Syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  section 1.1.6, updated 17 June 2026.
[^mca-written]: UK Maritime and Coastguard Agency, [Navigation and Radar
  Examination Syllabus](https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus),
  section 3.3, compass work.
[^mgn610]: UK Maritime and Coastguard Agency, [MGN 610 (M+F) Amendment
  1](https://www.gov.uk/government/publications/mgn-610-mf-amendment-1-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020/mgn-610-mf-amendment-1-navigation-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020),
  Annex D, magnetic compass adjustment, deviation tables and monitoring.
