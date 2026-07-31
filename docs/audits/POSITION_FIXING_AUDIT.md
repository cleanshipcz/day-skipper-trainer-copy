# Position Fixing learner-facing audit

- Audit issue: [#107](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/107)
- Route/topic: `/navigation/position` / `position-theory`
- Audited: 2026-07-31
- Theory page: `src/pages/PositionFixingTheory.tsx`
- Embedded exercise: `src/components/navigation/unified/UnifiedChartTable.tsx`
- Dormant alternative: `src/components/navigation/FixSimulator.tsx`
- Shared completion: `src/features/progress/useTheoryCompletionGate.ts`

## Verdict

**Position Fixing is reachable and introduces the right vocabulary, but it is
not yet a trustworthy or completable practical lesson.** The page correctly
distinguishes latitude from longitude at an introductory level, tells learners
to convert observed compass bearings to true before plotting, and distinguishes
a DR from an EP. Its three charted objects also produce a reasonable theoretical
cut at the hidden scenario position.

The lesson nevertheless compresses position fixing into three captions. It
does not teach a transferable sight-record-correct-plot-annotate procedure,
coordinate plotting, reciprocal bearings, simultaneous observations, fix
quality, systematic error, cross-checks or appropriate fix intervals. Saying
that the vessel is inside a cocked hat is unsafe: systematic error may place it
outside. DR and EP have no worked plots, and the definitions omit important
construction and uncertainty detail.

The embedded Unified Chart Table cannot receive its intended pointer events
because its root SVG has `pointer-events-none`. Even with that removed, it
validates gestures against an undisclosed fixed boat answer, accepts unsighted
or duplicate lines, does not calculate an intersection or fix, and has no
terminal result. The separate `FixSimulator` named in the audit brief is
commented out and unused; it draws selected lines directly to another known
boat answer rather than assessing learner plotting.

The exercise has no keyboard or structured non-visual path, its chart and
feedback are not accessibly described or announced, and its toolbar/fullscreen
layout is not robustly responsive. Page completion requires only reaching an
80% document-height threshold and navigates away even when saving reports
failure. Three focused follow-ups own the new findings; the already-open shared
completion defect remains owned by #238.

## Evidence and audit bounds

### Method

The parent menu, route and topic registries, complete theory page, active and
dormant simulators, chart surface, navigation-tool geometry, mentor feedback,
completion hook and persistence boundary were inspected directly. The active
scenario's three true and magnetic bearings were independently recomputed from
the fixed source coordinates. Pointer, duplicate-line, reciprocal, reset,
fullscreen, completion and save-failure paths were traced from source.

Content and expected competency were compared with the current MCA yacht oral
and written navigation syllabuses, the March 2026 IHO S-4 specification and MCA
guidance on cross-checking position information.[^mca-oral][^mca-written][^s4][^mgn379]

The repository does not install Playwright (`ERR_MODULE_NOT_FOUND`), so the
requested 375, 768 and 1280 CSS-pixel routes could not be exercised. Responsive
findings are source-based and require browser verification. No authenticated
backend round-trip, offline replay, screen reader, touch hardware, forced
colours, high zoom or paper-chart plotting was exercised.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learning path

- `/navigation` exposes **Position Fixing**, described as “Lat/Long and Three
  Point Fixes,” at `/navigation/position`. `routes.tsx` resolves it to
  `PositionFixingTheory`, and the topic registry maps it to `position-theory`.
- Back and successful completion both return to `/navigation`.
- There is no quiz or prerequisite. Neither the chart exercise nor any correct
  plotting is required for completion.
- `FixSimulator` is explicitly commented out on the page “for reference.” The
  learner instead receives `UnifiedChartTable`, whose mission text says to
  sight, convert and plot a fix.

## Latitude, longitude and position theory

- Latitude and longitude are correctly introduced as angular positions north/
  south of the Equator and east/west of the Prime Meridian. The example format
  uses degrees, minutes and decimal minutes with a cardinal suffix, matching
  normal chart practice in substance.
- “1 minute of Latitude = 1 Nautical Mile” is a useful chartwork convention,
  but it is presented as exact without the local latitude-scale/chart context.
  “NEVER measure distance on the Longitude scale” is a memorable practical
  rule, but neither statement is demonstrated on an actual plotted scale.
- The lesson never asks the learner to read, write or plot a coordinate. It
  does not teach coordinate order, leading zeros, datum/title-block checks,
  interpolation of decimal minutes or how precision relates to chart scale.
  IHO S-4 specifies degrees, minutes and decimals and a concrete coordinate
  convention; this page's isolated examples are not an applied competency.[^s4]
- The MCA oral syllabus expects fixing from magnetic bearings and/or radar
  ranges and quoting latitude/longitude. The written syllabus also expects
  position lines/circles, DR/EP, running fixes and multiple land/sea-feature
  methods. Those outcomes are mostly absent.[^mca-oral][^mca-written]

## Visual fixes and safety

- Selecting conspicuous, charted objects with a useful angular spread is good
  advice. However, “roughly 60° - 120° apart” is presented as a universal
  three-object rule rather than geometry to assess in the actual situation.
  The page does not show weak cuts, near-parallel LOPs or uncertainty bands.
- “Take Bearings” says to record time and log and convert Compass to True, but
  no deviation/variation source, worked conversion or bearing sequence is
  supplied. There is no explanation that a bearing *to* an object is plotted
  back from the object on its reciprocal direction.
- The page calls every case a three-point fix and does not discuss taking
  observations rapidly on a moving vessel, transferring earlier LOPs, or
  combining bearing/range/transit/depth/electronic evidence.
- “If they form a Cocked Hat (triangle), you are inside it” is not dependable.
  Random errors may surround a probable position, while common systematic
  error can move the actual vessel outside all three LOPs. The learner is not
  taught to investigate an unexpectedly large triangle, choose a conservative
  position relative to danger, or cross-check by an independent method.
- Current MCA outcomes emphasize regular position checks, methods appropriate
  to the circumstances, and accuracy/reliability. MCA guidance warns against
  reliance on one aid and requires cross-checking positional information.
  [#240](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/240)
  owns corrected, worked and safety-aware teaching.

## Unified Chart Table

### Scenario arithmetic

The fixed hidden boat is `(300, 300)`. Recomputing clockwise bearings from
true north gives:

| Object | Chart point | True bearing | Displayed magnetic, 5°W |
| --- | ---: | ---: | ---: |
| Headland Lt | `(100, 150)` | 306.87°T | 311.87°M |
| North Buoy | `(450, 80)` | 34.29°T | 39.29°M |
| Island Beacon | `(500, 350)` | 104.04°T | 109.04°M |

The code's `magBearing = trueBearing + 5` is consistent with the declared 5°W
variation and its instruction to subtract 5° to recover True. The successive
true-bearing separations are about 87°, 70° and 203° (or 157° on the smaller
arc), giving a plausible illustrative spread.

The visible coordinate labels are not coherent chart evidence, however.
`ChartSurface` advances its longitude minute labels as x increases but does not
show a scale relationship between its 100-pixel grid and those minutes. Only
major lines at five-grid intervals are visible, while labels are emitted at
every grid position. The scenario points and LOP checks operate in arbitrary
pixels, not the displayed geographic coordinates.

### Broken and incomplete interaction

- `ChartSurface` assigns `pointer-events-none` to the root SVG. None of the
  landmark `<g>`, plotter body or rotation-handle descendants restores pointer
  events, so their click/pointer handlers are not targetable.
- The initial plotter happens to be centred on Headland Lt, but the learner is
  not given its required true bearing until selecting the inaccessible compass
  tool and landmark. Validation does not require that sight: any landmark and
  any source-derived answer may be plotted directly.
- Rotation and dragging add raw browser `movementX/Y` to SVG viewBox state.
  CSS pixels do not map 1:1 to viewBox units when the 800×500 chart is scaled
  or cropped, so behavior varies with viewport/fullscreen size.
- A line is accepted when rotation is within 5° of any scenario bearing and
  the plotter centre is within 150 arbitrary pixels of that landmark. The
  actual drawing edge is not tested despite feedback claiming it must pass
  through the object.
- Correct reciprocal angles get a warning, but normal wraparound is handled.
  The same valid landmark can be submitted repeatedly and each submission
  appends the same LOP.
- The code never intersects LOPs, populates its `fixes` state, renders
  `PencilMark` or `SightLine`, compares a resulting position, counts unique
  evidence or reaches a terminal success/failure state. There is no reset.
- `preserveAspectRatio="xMinYMin slice"` may crop the fixed chart rather than
  fit it. The chart cannot pan despite “pan” being the initial active tool.
- The dormant `FixSimulator` has better native landmark buttons and reset, but
  reveals a pulsing boat point and draws every selected line exactly to it. Its
  “good spread” check merely requires landmark IDs 1 and 3; it does not assess
  angles, observations or learner geometry.

[#241](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/241)
owns a coherent, independently tested scenario and assessment.

## DR and EP

- DR is described as course steered and log distance without tide or leeway.
  That is a useful first distinction, but it omits the starting fix/time,
  compass corrections and the accumulating uncertainty of heading, log and
  steering errors.
- EP is described as DR corrected for tide and leeway. No vector construction,
  set/drift/time calculation, water track or annotation is shown. Calling it
  “your best guess” understates that it is a constructed estimated position
  with explicit assumptions and uncertainty.
- Neither position is related back to the active chart, fix interval or
  comparison between EP and a subsequent observed fix.

These teaching gaps are included in #240 rather than split into an overlapping
follow-up.

## Completion, persistence and failure states

- A passive scroll calculation marks one synthetic `read-content` section when
  viewport bottom reaches 80% of total document height. Tall screens can unlock
  it on load; no named section, coordinate task or chart action is required.
- Visited evidence is local component state and is not hydrated on remount.
  In-progress persistence is attempted only once per mount.
- `markCompleted` awaits `saveProgress` but ignores its Boolean result and
  returns true whenever the local gate was open. The page ignores even that
  return value and always navigates away. A caught non-retryable or queueing
  failure can therefore look completed while losing progress/points.
- These are the same shared completion defects already identified by the
  Compass audit. [#238](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)
  remains the owner; no duplicate issue was created.

## Accessibility and responsive behavior

- Back is an icon-only button without an accessible name. Compass and Plotter
  rely on `title`; fullscreen has no name. Tool selection/fullscreen state is
  not exposed with pressed/expanded semantics.
- Chart landmarks are SVG groups with pointer handlers, not focusable controls.
  The plotter body and rotation handle are drag-only. There is no keyboard,
  switch or precise numeric input path.
- The root SVG has no role, name, description or structured equivalent for
  landmark coordinates, last sight, plotted LOPs or the resulting geometry.
- Last sight and mentor feedback are visual text only. Feedback is not a live
  region and does not receive focus. Plot changes have no textual history.
- “Fullscreen” is a fixed-position CSS enlargement, not a fullscreen/dialog
  contract: it does not expose state, move/trap/restore focus, isolate the
  background or support Escape.
- The header combines title/mission text, optional sight data, separators and
  controls in one non-wrapping flex row. The chart keeps a 500px fixed content
  height and 800×500 sliced viewBox. Narrow-screen overflow/cropping and touch
  behavior are therefore material risks, not verified behavior.

[#242](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/242)
owns accessible interaction and checked-in 375/768/1280/high-zoom coverage.

## Follow-up ownership

1. [#240 — Correct Position Fixing theory and teach reliable fix
   interpretation](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/240)
2. [#241 — Rebuild Unified Chart Table as a geometrically valid position-fixing
   exercise](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/241)
3. [#242 — Make Position Fixing and its chart exercise accessible and
   responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/242)
4. Existing shared owner: [#238 — Keep theory completion gated until progress
   is actually saved](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca-oral]: UK Maritime and Coastguard Agency, [Master (code vessels less than
  200 GT)/Officer of the Watch (yachts less than 500 GT) Oral Examination
  Syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  section 1.1, updated 17 June 2026.
[^mca-written]: UK Maritime and Coastguard Agency, [Navigation and Radar
  Examination Syllabus](https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus),
  sections 3.4.3–3.4.5.
[^s4]: International Hydrographic Organization, [S-4 edition 4.10.0 (March
  2026)](https://iho.int/uploads/user/pubs/standards/s-4/S-4%20Ed%204.10.0_FINAL.pdf),
  B-130–B-132.
[^mgn379]: UK Maritime and Coastguard Agency, [MGN 379 (M+F), Navigation: Use
  of Electronic Navigation Aids](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/440740/MGN_379.pdf),
  summary and section 1.
