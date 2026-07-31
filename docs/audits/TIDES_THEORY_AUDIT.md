# Understanding Tides learner-facing audit

- Audit issue: [#108](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/108)
- Route/topic: `/navigation/tides/theory` / menu ID `tides-theory`
- Audited: 2026-07-31
- Theory page: `src/pages/TidalTheory.tsx`
- Visual: `public/amphidromic.png`
- Completion path: `src/hooks/useCompletion.ts`

## Verdict

**Understanding Tides is reachable and its spring/neap summary is broadly
correct, but it is not yet a dependable or complete tides lesson.** It
correctly identifies lunar and solar forcing, the Moon's stronger
tide-generating influence, spring alignment, neap quadrature, and the tendency
for local range and streams to be larger at springs than neaps. The page also
usefully warns that real tides behave as long waves shaped by geography.

The causal model stops at one near-side “bulge,” omitting differential forcing,
the far-side bulge, the lunar day, the normal timing vocabulary and how the
idealized equilibrium model differs from observed local tides. It contains no
worked example, concept check, tide-table connection, prediction limitation or
safety context. Its qualified statement that Northern Hemisphere amphidromic
rotation is generally anti-clockwise is a useful tendency, but its North Sea
image visibly shows clockwise arrows and unexplained, duplicated phase labels.

There is no learning interaction. **Mark as Complete** is enabled on first
render, immediately displays a local completed state, and discards every
persistence outcome. The saved ID is not registered in either the topic
registry or durable-ID catalogue. Accessibility and narrow-screen risks remain
unverified in a browser. Three focused follow-ups own the findings.

## Evidence and audit bounds

### Method

The Tides parent menu, route table, topic/durable-ID registries, complete theory
page, source image, completion hook and persistence boundary were inspected
directly. Every control and state transition was traced from source. The
1024×1024 image was inspected at native content scale.

Content was compared with the current MCA Navigation and Radar Examination
Syllabus and NOAA's tide education material.[^mca][^noaa-causes][^noaa-springs]
These sources support the audit's competency and physical-model findings; the
page does not identify its own sources.

The repository does not install Playwright, so the requested 375, 768 and 1280
CSS-pixel routes could not be exercised. Responsive observations are
source-based and require browser verification. No authenticated backend
round-trip, offline replay, screen reader, touch hardware, reduced-motion,
forced-colours or high-zoom path was exercised.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learning path

- `/navigation` exposes **Tidal Theory & Streams** at `/navigation/tides`.
  Its menu exposes **Understanding Tides** at `/navigation/tides/theory`, and
  `routes.tsx` resolves that URL to `TidalTheory`.
- Back returns to `/navigation/tides`. Completion leaves the learner on the
  same page with a disabled **Completed** button; there is no explicit handoff
  to tidal heights, streams, practice or assessment.
- The parent describes a sequence covering generation, heights and course to
  steer, but there are no prerequisites or connections between leaf outcomes.
- There is no question, example, calculation, diagram control or other
  interaction. Completion measures one unverified click.

## Tide-generation concepts and terminology

### What is sound

- Lunar and solar gravity are the primary astronomical drivers. The Moon's
  tide-generating effect is larger despite the Sun's greater mass because
  tide-producing force depends strongly on distance.[^noaa-causes]
- New/full-moon alignment produces larger-than-average spring ranges, while
  first/last-quarter geometry produces smaller neap ranges. The listed higher
  high waters/lower low waters at springs and the reverse at neaps communicate
  the basic range contrast.[^noaa-springs]
- Describing real tides as very long waves modified by shelves and coastal
  geography is a useful correction to treating the equilibrium bulge as a
  literal ocean shape.

### Material omissions and misleading simplifications

- “Vertical rise and fall ... caused by gravitational attraction” never
  explains that the relevant tide-producing force is *differential*: different
  parts of Earth experience different lunar/solar attraction. Only the
  Moon-facing bulge is drawn. The opposite bulge and why it exists are absent,
  so the visual cannot explain the common two-high/two-low pattern.
- There is no lunar-day (`about 24 h 50 min`) or typical semidiurnal timing,
  nor a warning that local regimes may be semidiurnal, mixed or diurnal. NOAA
  notes two highs and lows occur on most, not all, coastlines; the MCA syllabus
  explicitly expects awareness that some Pacific ports may have only one
  daily HW/LW.[^noaa-causes][^mca]
- High water, low water, range and tidal stream are used but not explicitly
  defined. Tide (vertical height) and stream/current (horizontal flow) are not
  separated. “Stronger streams” at springs is a useful tendency, not a
  sufficient local prediction; atlas/diamond timing, bathymetry and local
  circulation still govern the stream.
- “The gravitational forces combine/oppose” is introductory shorthand, but
  the solar and lunar *tide-generating patterns* reinforce or partially cancel;
  gravity itself does not simply switch off. No spring/neap diagram lets the
  learner test the geometry.
- The page implies springs coincide cleanly with new/full moon. It omits local
  age/lag of the tide and other astronomical inequalities. It also omits wind,
  pressure, river flow and waves as causes of observed water differing from an
  astronomical prediction.
- The MCA outcome includes chart datum, LAT, HAT, MHWS, MLWS and Admiralty Tide
  Table information in the same causes/tides competency.[^mca] Those belong
  primarily in the adjacent heights lesson, but this page supplies no boundary
  or forward link, and no operational example connects its theory to a local
  prediction or clearance decision.

[#244](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/244)
owns corrected, deeper and applied teaching without duplicating the dedicated
height and stream leaves.

## Visual and amphidromic evidence

- The Moon visual contains an Earth, a Moon to its right and a single pulsing
  halo. It shows neither the far-side bulge nor the differential force, Sun,
  spring/neap alignment or rotation. The pulse can suggest one symmetric
  expansion rather than two axial bulges.
- `amphidromic.png` is a 1024×1024 JPEG despite its `.png` extension. It is a
  schematic titled “TIDAL AMPHIDROMIC SYSTEM: NORTH SEA.”
- The prose says the North Sea wave rotates anti-clockwise. The image's large
  arrows point right at the top, down at the right, left at the bottom and up
  at the left: visibly clockwise. This contradicts both the prose and the
  North Sea's anti-clockwise tidal-wave propagation.
- “Generally anti-clockwise in the northern hemisphere” is a supportable
  introductory tendency. Local propagation still depends on basin geometry,
  so retaining the page's qualifier and anchoring the claim to this specific
  North Sea example are important.
- Blue radial lines carry repeated `0h`, `3h`, `6h`, `9h` and `12h` labels,
  but the page never defines co-tidal lines or the time/reference implied.
  Concentric red circles are called “Co-range Lines (meters)” with values
  `1m`–`4m`, but neither their meaning nor the intentionally schematic,
  non-geographic geometry is explained.
- The asset has no visible source, date, licence or data provenance. It cannot
  be checked as a real North Sea cotidal/co-range chart and should not be
  presented as one.

Visual correction and provenance are included in #244.

## Completion, persistence and edge states

- **Mark as Complete** is enabled immediately. `handleComplete` invokes
  `completeTopic("tides-theory")` and synchronously sets `markedComplete=true`;
  no content evidence is required.
- `useCompletion.completeTopic` calls asynchronous `saveProgress` without
  returning or awaiting it. The Boolean outcome and rejection are therefore
  unavailable to the page. Anonymous users return `false`; non-retryable save
  failures and offline-queue failures also return `false`, yet all display the
  same completed badge.
- The button has no pending/failed/retry state. Repeated activation before the
  state update can start duplicate saves; save idempotency is not expressed at
  this boundary.
- `markedComplete` is mount-local and existing progress is never loaded.
  Reload/navigation therefore resets the visible badge even if a record exists.
- `tides-theory` is a menu ID but is absent from `topicRegistry` and
  `durableProgressIds`. The registered `tides` parent declares no submodules.
  Other tide leaves also save separate menu-style IDs. The app can write
  progress records that its canonical catalogue cannot resolve or aggregate.
- A missing/broken image receives the browser's alt fallback, but the lesson
  offers no alternate structured diagram. There are no empty-content or data
  states because all content is hard-coded.

[#245](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
owns the legacy completion path and Tides catalogue contract. It should
coordinate shared save semantics with #238, but is not a duplicate:
`TidalTheory` does not use `useTheoryCompletionGate`.

## Accessibility and responsive behavior

- Back is an icon-only button without an accessible name. Its destination can
  only be inferred visually and from context.
- The CSS Earth/Moon visual exposes the words but no useful figure semantics or
  structured explanation. Its pulsing animation has no reduced-motion
  treatment. Decorative layers are not explicitly hidden.
- The amphidromic image's alt text, “Amphidromic System Diagram,” does not
  convey direction, phase labels, co-range values or the image/prose conflict.
  A non-visual learner receives none of its claimed instructional content.
- The sticky header uses one non-wrapping `flex` row with a title/subtitle block
  and the long completion button. Neither child has `min-w-0`/wrapping
  constraints. At narrow widths or high zoom, collision, clipping or
  document-level horizontal overflow is a material source-based risk.
- Main cards and the spring/neap and real-world grids do switch to one column
  below `md`. The image uses `object-contain`, so no source-level crop is
  expected in its own responsive container. This does not resolve the header
  risk or guarantee readable labels after the square diagram is reduced.
- Completion outcome and persistence errors are not exposed as a status/live
  message. Focus remains on a button that changes to disabled, with no durable
  result semantics.

[#246](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/246)
owns accessible visuals, controls and checked-in viewport/zoom coverage.

## Follow-up ownership

1. [#244 — Correct and deepen Understanding Tides theory and its amphidromic
   visual](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/244)
2. [#245 — Make Understanding Tides completion durable, registered, and
   evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
3. [#246 — Make Understanding Tides accessible and
   responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/246)
4. Related shared owner: [#238 — Keep theory completion gated until progress
   is actually saved](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca]: UK Maritime and Coastguard Agency, [Navigation and Radar Examination
  Syllabus](https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus),
  sections 3.6.1–3.6.2.
[^noaa-causes]: NOAA/NESDIS, [What Causes
  Tides?](https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides),
  updated 2025.
[^noaa-springs]: NOAA National Ocean Service, [What are spring and neap
  tides?](https://oceanservice.noaa.gov/facts/springtide.html).
