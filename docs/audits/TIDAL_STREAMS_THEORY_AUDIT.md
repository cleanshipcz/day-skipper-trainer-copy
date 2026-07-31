# Course to Steer Theory learner-facing audit

- Audit issue: [#111](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/111)
- Route/topic: `/navigation/tides/streams-theory` / menu ID
  `tides-streams-theory`
- Audited: 2026-07-31
- Theory page: `src/pages/TidalStreamsTheory.tsx`
- Tool handoff: `/navigation/tides/vector-tool`
- Completion path: `src/hooks/useCompletion.ts`

## Verdict

**Course to Steer Theory gives a recognisable and broadly correct sequence for
constructing a tidal vector triangle, but it is not yet a usable chartwork
lesson.** It distinguishes a vessel's through-water vector, the tidal vector
and the resulting ground track, and its plot order can produce a course to
steer when all vectors use a common time and scale. Its arrow-head convention
of one, two and three marks is also internally identifiable.

However, the page contains no vector triangle. Its only “diagram” is a dashed
circle with the instruction to imagine a sideways push. There are no numeric
bearings, rates, distances, duration, scale, arithmetic, measured CTS or
answer to verify. The procedure therefore cannot demonstrate that a learner
can determine tidal-stream effect or CTS by construction. It also conflates
course and heading, describes rates as diagram lengths without explaining the
common time interval, omits the direction convention for set, and does not
carry a true plotted course through leeway and compass correction to a
steerable compass course.

The lesson has no learner input or knowledge check. **Mark as Complete** is
available immediately, reports only local component state and uses an ID
outside the canonical progress catalogue. **Open Vector Solution Tool** does
resolve to the adjacent interactive route, but there is no readiness check or
statement of what the tool should practise. Accessibility and narrow-screen
risks remain unverified in a browser. Two focused follow-ups cover instruction
and route-specific interaction; existing #245 retains shared Tides progress
ownership, and audit #112 retains ownership of the tool itself.

## Evidence and audit bounds

### Method

The parent Navigation and Tides menus, route table, complete theory page,
destination tool, completion hook, topic registry and durable-ID catalogue
were inspected. Every control and navigation transition was traced from
source. The six-step construction was checked geometrically: laying the tidal
vector from the departure point, intersecting the desired ground-track ray
with an arc whose radius is the vessel's through-water distance, then joining
the tidal-vector endpoint to the intersection is a valid vector addition when
both distances cover the same interval and an intersection exists.

Content was compared with the MCA chartwork syllabus, which requires the
effect of tidal stream and the course to steer to counter it to be determined
by construction on a chart.[^chartwork] The MCA yacht syllabus also expects a
candidate to find magnetic CTS and ETA from starting position and log speed,
find or predict tidal set and rate, and apply compass corrections.[^yacht]

The repository does not install Playwright. The requested live route exercise
at 375, 768 and 1280 CSS pixels therefore could not be performed. Responsive,
keyboard and accessibility findings are source-based. No authenticated
backend round-trip, offline replay, screen reader, touch hardware, high zoom
or forced-colour path was exercised. The page has no focused tests.

The full test suite, typecheck, lint, production build, internal-artifact guard
and `git diff --check` were run for this audit.

## Reachability and learning path

- `/navigation` exposes **Tidal Theory & Streams** at `/navigation/tides`.
  Its menu exposes **Course to Steer Theory**, and `routes.tsx` maps the
  audited URL to `TidalStreamsTheory`.
- Back returns to `/navigation/tides`. The final action resolves to
  `/navigation/tides/vector-tool`, whose page is headed **Vector Solution
  Tool** and offers solver and drill modes.
- The Tides menu orders theory immediately before the tool and describes the
  pair as plotting a CTS with vector triangles. Neither route declares a
  prerequisite or reads progress, and opening the tool does not complete the
  lesson.
- The lesson gives neither a learning objective nor a recap/check before the
  handoff. A learner can mark it complete on entry and open a tool whose input
  conventions and geometry have not been demonstrated. Audit #112 owns the
  destination's calculations, validation and interaction behavior.

## Concepts and terminology

### What is sound

- The core physical model is sound: motion through the water plus motion of
  the water produces motion over the ground.
- Plotting the desired ground-track ray, then the tidal vector from the
  departure point, then intersecting the track with the vessel-distance arc
  is a valid graphical CTS construction.
- The final line from the tidal-vector endpoint to the intersection points in
  the required through-water direction. The resulting distance along the
  desired track can support SOG and ETA.
- Identifying tidal stream by set and rate, through-water motion by vessel
  speed, and ground motion by CMG/SOG gives the learner the three relevant
  vector families.

### Material gaps and ambiguities

- “Water Track” is defined as “the boat's heading and speed through the
  water,” then labelled “CTS (Heading).” A course is an intended direction of
  travel; heading is the direction the vessel's bow points. They differ when
  leeway is present. The page never establishes whether its bearings are true,
  magnetic or compass.
- Set is not defined as the direction **towards which** the stream flows. Rate
  is not explicitly tied to knots, and “drift” appears only colloquially even
  though it can denote the stream's speed or the resulting displacement.
- “Boat Speed” and tidal “Rate for the hour” are used as line lengths. A
  construction needs distances over one declared common interval: speed ×
  time for the vessel and rate × the same time for the stream. The current
  wording works only by an unstated one-hour convention.
- “Steer INTO the tide to go straight” is only a mnemonic for a cross-stream
  case. The stream may have head, following and cross components; the required
  correction need not resemble a simple sideways aim.
- The page does not explain where set/rate comes from, how the reference-port
  time and spring/neap information apply, or how to segment a passage when the
  stream changes.
- There is no leeway, variation or deviation, no conversion from true CTS to
  the magnetic/compass course actually steered, and no resulting distance,
  SOG or ETA.
- There is no infeasible-case boundary. If the cross-stream component exceeds
  the vessel's through-water speed, the vessel-distance arc does not intersect
  the desired track in the required forward direction; the learner receives
  no instruction to recognise or respond to that condition.
- The opening promises arrival at the waypoint if CTS is calculated. It omits
  uncertainty in forecast stream, steering and vessel speed, and the need to
  monitor position and revise the plan.

[#254](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/254)
owns terminology, data selection, common-time scaling, operational boundaries
and a complete chart-ready example.

## Plot procedure, calculations and visual teaching

- The six instructions are an outline, not a worked construction. They give
  no departure/destination, desired bearing, distance, time, boat speed, tidal
  set/rate, chosen scale or measured result.
- Because there is no numeric example, there is no arithmetic, bearing wrap,
  unit conversion, precision or rounding policy to verify. A learner cannot
  compare an independently plotted answer with an expected tolerance.
- The right half of **Three Component Vectors** contains a dashed circular
  border and two lines of italic text. It has no arrows, vertices, vector
  addition, direction, length, scale, compass rose or connection to the six
  plotting steps.
- The “Arrow: 1/2/3 heads” notes never appear on a diagram. “Heads” is also
  ambiguous: traditional chartwork distinguishes vectors with arrow marks on
  their shafts, not three separate arrowheads at an endpoint.
- Colour and numbered cards distinguish the three vectors, but there is no
  visual demonstration that the tidal and through-water vectors join head to
  tail or that their sum terminates on the desired ground track.
- There is no learner task, revealable answer, error diagnosis or feedback.
  The page cannot establish readiness for the solver/drill handoff or justify
  completion.

Issue #254 owns a recalculated worked example, accurate labelled diagram,
instructional practice and focused content/geometry tests.

## Completion and persistence

- **Mark as Complete** is enabled from first render and does not depend on
  plotting, answering a question or opening the tool.
- It calls `completeTopic("tides-streams-theory")` and immediately sets local
  `markedComplete` to true. `completeTopic` does not return or await
  `saveProgress`; pending, anonymous and failed saves look identical to
  confirmed persistence.
- `tides-streams-theory` is absent from `topicRegistry` and
  `durableProgressIds`. The registry instead maps `vector-triangle` directly
  to the adjacent tool, while the `tides` parent has no registered children.
- Existing [#245](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
  owns canonical Tides IDs, durable save outcomes, evidence-based completion,
  aggregation and reload behavior. Issue #255 owns this route's gating and
  accessible state presentation without duplicating that architecture.

## Accessibility, responsive behavior and failure states

- The icon-only Back button has no accessible name, and its arrow is not
  marked decorative.
- The placeholder is ordinary text, not an instructional figure. Any real
  vector visual will need a structured textual equivalent; colour, geometry
  and arrow marks alone cannot communicate the construction accessibly.
- The blue, green and red cards have numbered/text labels, so their identity
  is not strictly colour-only. Their smallest notes use `text-xs` and muted
  colours, making the only arrow-convention guidance visually subordinate.
- The sticky header uses one non-wrapping `justify-between` row for Back,
  title/subtitle and a long completion button. There is no explicit narrow or
  high-zoom reflow, so crowding, truncation or overflow is credible but was not
  browser-confirmed.
- Main content changes from two columns to one below `md`, and the final tool
  button has short content. No actual diagram exists to assess for responsive
  labels or pan/zoom behavior.
- Completion changes a button to a disabled badge but is not announced in a
  status/live region. Save failure has no visible state, retry or recovery.
  Focus is not managed on completion or route transitions.
- The page has no inputs, validation or calculation failure states. Its main
  content failure is absence: no handling for unavailable tidal data,
  changing streams, impossible geometry or uncertain results.

[#255](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/255)
owns route-specific accessibility, responsive layout, completion semantics
and checked-in interaction coverage.

## Follow-up ownership

1. [#254 — Teach a complete, chart-ready course-to-steer
   construction](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/254)
2. [#255 — Make Course to Steer Theory accessible, responsive, and
   progress-aware](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/255)
3. Existing shared owner: [#245 — Make Understanding Tides completion durable,
   registered, and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/245)
4. Adjacent audit boundary: [#112 — Audit functionality and content quality:
   Vector Solution Tool](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/112)

## Authoritative sources

All sources were accessed 2026-07-31.

[^chartwork]: UK Maritime and Coastguard Agency, [OOW 500GT Near Coastal
  Chartwork and Practical Navigation examination syllabus](https://assets.publishing.service.gov.uk/media/69973732bfdab2546272c016/OOW_-_500GT_NC_-_Chart-work_and_Practical_Navigation_-_Revised_Nov_24.pdf),
  section 4.
[^yacht]: UK Maritime and Coastguard Agency, [Master (Code Vessels less than
  200 GT)/Officer of the Watch (Yachts less than 500 GT) oral examination
  syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  section 1.1.
