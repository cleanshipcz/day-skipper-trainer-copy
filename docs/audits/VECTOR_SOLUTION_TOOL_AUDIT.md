# Vector Solution Tool learner-facing audit

- Audit issue: [#112](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/112)
- Route/topic: `/navigation/tides/vector-tool` / menu ID
  `tides-vector-tool`
- Audited: 2026-07-31
- Page: `src/pages/VectorTriangleTool.tsx`
- Visualisation/calculation: `src/components/navigation/VectorTriangleVisualizer.tsx`
- Completion path: `src/hooks/useCompletion.ts`

## Verdict

**The tool's central constant-vector geometry is sound, but the route is not
yet a dependable course-to-steer lesson or assessment.** The solver correctly
finds the forward intersection between the desired ground-track ray and the
circle representing fixed speed through the water. Its default inputs produce
CTS `066°T` and SOG `4.6 kn`; an independent component calculation gives
`066.42°T` and `4.583 kn`. Drill mode also adds the through-water and tidal
vectors correctly and handles bearing wrap when it scores the resulting COG.

The learner is nevertheless given only rounded answers and an animated
triangle, not a reproducible calculation. Direction conventions, model limits,
precision and infeasible boundaries are unexplained. The drill uses hidden
`<5°` binary scoring, non-reproducible scenarios and no diagnostic or worked
feedback. Its scoring duplicates rather than shares the visualiser's
calculation. Completion is available on entry, is unrelated to drill success,
uses an ID different from the registry and reports local success without a
confirmed save.

The SVG can be panned completely out of view and has no reset. Its static
accessible name conveys none of the values or results; vector identity and
meaning remain primarily visual. Slider labels are not programmatically
associated, result changes are not announced, and browser/touch/screen-reader
behavior is unverified. Two focused follow-ups own the solver and the
learner-facing drill/accessibility work. Existing #245, #254 and #255 retain
shared progress and adjacent-theory ownership.

## Evidence and audit bounds

### Method

The Navigation and Tides menus, route table, adjacent theory handoff, complete
page and visualiser, completion hook, topic registry and durable-ID catalogue
were inspected. Solver and drill state transitions were traced, including
defaults, cardinal/oblique vectors, bearing wrap, zero tide, head/following and
cross-stream cases, the discriminant boundary and generated scenario ranges.

The implementation was checked independently in east/north components, using
`x = speed sin(bearing)` and `y = speed cos(bearing)`. For desired ground unit
vector **d**, tidal vector **t**, boat speed `v` and unknown SOG `s`, the tool
solves `|s d - t|² = v²`, or
`s² - 2(d·t)s + |t|² - v² = 0`, then selects the larger positive root. This is
the correct forward solution. The MCA chartwork syllabus requires tidal-stream
effect and CTS to be determined by construction on a chart; the yacht syllabus
also expects magnetic CTS and ETA from position, log speed and predicted tidal
set/rate.[^chartwork][^yacht]

The repository does not install Playwright. The requested live exercise at
375, 768 and 1280 CSS pixels could not be performed. Responsive, keyboard and
accessibility findings are source-based. No authenticated backend round-trip,
offline replay, screen reader, touch hardware, high zoom or forced-colour path
was exercised. Random generation was inspected but not statistically sampled.
Two visualiser render tests cover one solvable and one impossible case, and one
interaction test checks pointer/keyboard pan state. They assert neither numeric
results nor drill scoring, generation, completion or accessible relationships.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learner path

- `/navigation` exposes **Tidal Theory & Streams** at `/navigation/tides`.
  That menu exposes **Vector Solution Tool**, and `routes.tsx` resolves its path
  to `VectorTriangleTool`.
- Back returns to `/navigation/tides`. **Course to Steer Theory** appears
  immediately before the tool and links directly to it.
- Neither route checks prerequisite/readiness state. The tool does not link
  back to the theory, identify an example shared with it or explain whether it
  is a teaching model, assessment or operational aid.
- The menu calls it “Interactive vector triangle plotting,” although the
  learner does not plot endpoints or construct the triangle. Sliders alter a
  solved SVG. This weakens the connection with chartwork construction.

## Solver geometry and numerical results

### Correct behavior

- Bearings are converted consistently: `000°` points up/north, `090°` right/
  east, `180°` down/south and `270°` left/west in the SVG coordinate system.
- The red tidal vector is added head-to-tail after the blue through-water
  vector. The green vector from A to C is their ground resultant.
- For desired `090°T`, boat `5.0 kn`, tide `180°T @ 2.0 kn`, the required
  through-water north component is `+2.0 kn`; its east component is
  `sqrt(25 - 4) = 4.5826 kn`. Thus CTS is `atan2(4.5826, 2) = 66.42°T`, and
  SOG is `4.5826 kn`, agreeing with displayed `066°T` and `4.6 kn`.
- Zero tide returns CTS equal to desired course and SOG equal to boat speed.
  Following and opposing streams choose the forward root when one exists.
  A cross-stream component greater than boat speed makes the discriminant
  negative and produces the impossible state.
- Drill scoring computes the resultant independently of SVG scale and reduces
  angular error across `359°/000°` to the smaller circular difference.

### Transparency, precision and boundary gaps

- The page shows no equation, components, common time basis, scale, triangle
  side lengths or substitution. A learner cannot reproduce or diagnose the
  answer from the UI.
- CTS is rounded to a whole degree and SOG to `0.1 kn`; input speeds use
  `0.1 kn`. No rounding policy, unrounded result, uncertainty or acceptable
  plotting tolerance is stated. A rounded green line can appear coincident
  while the hidden drill error differs.
- Set is labelled only “Direction.” The page never says that tidal set is the
  true direction **towards which** water moves, or that all displayed bearings
  use degrees true. “Water Track/Heading” and “CTS (Heading)” conflate course,
  heading and track when leeway is outside the model.
- “Impossible scenario!” does not distinguish excessive cross-stream set from
  a net ground vector that cannot progress along the requested direction. It
  gives no boundary value, explanation or learner response.
- The solver is embedded inside a render component, while drill checking
  repeats a separate forward calculation in the page. There is no single
  domain function or regression matrix proving displayed and scored results
  stay aligned.
- Sliders bound ordinary UI values sensibly (`1..10 kn` boat, `0..6 kn` tide,
  `0..359°`), but offer no precise text entry, validation message or resilience
  to non-finite/programmatic props. The SVG calculation has no explicit guard
  for non-finite intermediates.
- The constant-rate model omits changing streams, passage duration, leeway,
  variation/deviation, steering error, forecast uncertainty and position
  monitoring. It does not say that displayed CTS is true within that simplified
  model rather than necessarily the compass course to steer aboard.

[#257](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/257)
owns the shared solver, calculation exposition, terminology, numerical tests,
validation and operational boundaries. #254 retains the full chartwork lesson.

## Drill generation, scoring and feedback

- **Start “Find the Heading” Drill** draws integer target and set bearings,
  tide `1.0..3.9 kn` and boat speed `4.0..7.9 kn`. Since tide rate is always
  below boat speed, every target has a feasible through-water heading.
- The starting user heading is offset by `90..269°` from the target rather than
  from the solved CTS. It is usually far away but does not guarantee a declared
  initial COG error or pedagogically selected misconception.
- Scenarios use `Math.random` with no seed or identifier. A learner, teacher or
  failing test cannot reproduce a case.
- **Check Answer** accepts only an angular error strictly below `5°`. The page
  does not disclose that tolerance, the exact boundary, the learner's resulting
  COG or angular error. The visualiser shows the entered CTS and SOG but not the
  resulting COG numerically.
- Incorrect feedback says only that green does not match yellow. It gives no
  direction of error, vector components, hint, expected CTS, worked solution or
  relationship between changed heading and changed COG. Correct feedback is
  only “Good job.”
- A learner can retry without penalty and request unlimited new scenarios, but
  no attempt count, progression, mastery threshold, history or resume state is
  retained. Exiting discards the current scenario.
- The target line uses a fixed visual length unrelated to resultant magnitude.
  Alignment can be judged directionally, but labels and vectors may extend
  outside the viewBox for some bearings and after panning.

[#258](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/258)
owns reproducible scenarios, explicit scoring, explanatory feedback, mastery
and accessible assessment interaction.

## Diagram, input methods and responsive behavior

- The vector geometry and arrow directions agree with the arithmetic. One,
  two and three shaft marks visually distinguish through-water, ground and
  tidal vectors, but the labels call all three marks “ArrowHead” and do not
  explain the convention.
- Blue, red, green and yellow plus line style carry most of the distinction.
  Text labels help sighted users, but there is no compass rose, bearing scale,
  endpoint table, vector magnitude labels or non-visual construction.
- The SVG has `role="img"`, keyboard focus and a static label saying it is a
  course-to-steer triangle and can be dragged. The label omits inputs,
  endpoints, direction/magnitude, validity and calculated results. SVG text is
  not a reliable structured equivalent.
- Pointer-down anywhere starts panning and `touch-none` suppresses native touch
  gestures on the 500-pixel-high diagram. Pan is unbounded, so the complete
  triangle and result can be moved permanently off-screen. There is no reset,
  home position, boundary or panning status.
- Arrow keys pan a focused SVG, but the direction mapping moves content opposite
  the named arrow and no instructions beyond “Drag” disclose keyboard support.
  The focusable image has no dedicated controls for zoom or recovery.
- Radix sliders generally expose slider semantics, but visible `Label`
  components have no `htmlFor`/ID relationship. Units, instructions and current
  values are separate text; no `aria-label`/`aria-labelledby` or value text is
  supplied at the call sites.
- The icon-only Back button has no accessible name. Feedback, new scenario,
  result and completion changes lack live/status semantics and focus management.
- The three-column layout collapses below `lg`, but the sticky header remains a
  single `justify-between` row. Long title/subtitle and completion button can
  crowd narrow or zoomed layouts. The SVG has a fixed 500-pixel wrapper and
  small absolute labels; clipping/overlap was not browser-tested.
- Drill tide controls use `opacity-50 pointer-events-none` rather than disabled
  semantics. They remain in the DOM as ordinary sliders and may remain keyboard
  operable, creating different pointer and keyboard behavior.

Issue #258 owns the diagram equivalent, labelled controls, bounded touch/
keyboard interaction, feedback announcements and checked responsive coverage.

## Completion and persistence

- **Mark as Complete** is enabled on first render in solver or drill mode. It
  requires no inspected result, correct answer, scenario count or mastery.
- It calls `completeTopic("tides-vector-tool")` and immediately changes local
  state to a disabled **Completed** badge. `completeTopic` does not return or
  await `saveProgress`, so pending, anonymous and failed saves look identical
  to confirmed persistence.
- `tides-vector-tool` matches the menu item but is absent from
  `topicRegistry` and `durableProgressIds`. The registry instead identifies
  this route as `vector-triangle`; the `tides` parent has no registered leaves.
- Reload does not derive the local badge from persisted state. Drill scenario,
  attempts and feedback are entirely ephemeral.
- Existing [#245](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
  owns canonical Tides identities and save architecture. #258 owns the tool's
  evidence requirement, assessment integration and visible route-level states.

## Follow-up ownership

1. [#257 — Make the Vector Solution Tool a transparent, verified
   course-to-steer solver](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/257)
2. [#258 — Make Vector Solution Tool drills accessible, explanatory, and
   progress-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/258)
3. Existing shared owner: [#245 — Make Understanding Tides completion durable,
   registered, and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
4. Existing instructional owner: [#254 — Teach a complete, chart-ready
   course-to-steer construction](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/254)
5. Adjacent route owner: [#255 — Make Course to Steer Theory accessible,
   responsive, and progress-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/255)

## Authoritative sources

All sources were accessed 2026-07-31.

[^chartwork]: UK Maritime and Coastguard Agency, [OOW 500GT Near Coastal
  Chartwork and Practical Navigation examination syllabus](https://assets.publishing.service.gov.uk/media/69973732bfdab2546272c016/OOW_-_500GT_NC_-_Chart-work_and_Practical_Navigation_-_Revised_Nov_24.pdf),
  section 4.
[^yacht]: UK Maritime and Coastguard Agency, [Master (Code Vessels less than
  200 GT)/Officer of the Watch (Yachts less than 500 GT) oral examination
  syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  section 1.1.
