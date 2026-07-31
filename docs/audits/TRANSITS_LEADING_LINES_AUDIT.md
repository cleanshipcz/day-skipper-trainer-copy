# Transits & Leading Lines learner-facing audit

- Audit issue: [#114](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/114)
- Route/topic: `/pilotage/transits` / `pilotage-transits`
- Audited: 2026-07-31
- Theory page: `src/pages/TransitsTheory.tsx`
- Exercise: `src/components/pilotage/TransitExercise.tsx`
- Scenario/geometry data: `src/components/pilotage/transitScenarios.ts`

## Verdict

**The route is reachable and the exercise is operable by pointer and keyboard,
but the lesson currently teaches the decisive off-line indication backwards
and the exercise does not simulate what a navigator sees or demonstrate a safe
transit competency.** The definitions of a transit, leading line and clearing
line are useful introductions, and the page distinguishes designated leading
marks from improvised conspicuous objects. However, both worked directions say
that a rear mark appearing right means the vessel is left of track. In fact the
near/front mark has the larger apparent displacement: from left of the line the
rear mark appears left of the front mark. The stated corrective helm happens to
point back toward the line, but it is derived from the wrong visual cue.

The SVG is a plan view in which the learner moves a vessel icon onto an already
known mathematical line between chart symbols. It never presents the
front/rear sight picture that the theory asks the learner to interpret. It
accepts any point near the infinite line, including land, hazards and positions
beyond the useful leading-line segment; depicted depths and rocks have no
effect. “Difficulty” is only a shrinking arbitrary pixel tolerance. One check
locks each scenario permanently, gives no diagnostic correction, and any three
checks—including three failures—unlock module completion.

The route has a canonical progress ID and a genuine two-part local completion
gate. It nevertheless substitutes 80% page scroll for reading, discards the
exercise score, does not hydrate visited evidence, and navigates away after a
save failure. Three focused follow-ups are proposed below; shared persistence
behavior should be fixed once rather than duplicated per topic.

## Evidence and audit bounds

### Method

The Pilotage menu, route and topic registries, complete theory page, exercise
state machine, coordinate conversion, all three scenarios, completion gate,
progress boundary and relevant tests were inspected. Scenario lines,
tolerances, starts, keyboard increments and terminal paths were independently
recomputed. The sight-picture direction was checked with simple bearing
geometry from positions on either side of the straight leading line.

Content and expected competency were compared with the current MCA yacht oral
syllabus and IALA's definitions/design guidance for leading lines.[^mca][^iala]
The audit did not validate a specific port approach, chart edition, local
direction, dayboard or light characteristic; the lesson supplies none.

The repository does not install Playwright, so a live 375, 768 and 1280
CSS-pixel browser pass was unavailable. Responsive, touch, keyboard and
accessibility findings are source- and component-test-based. No authenticated
backend round-trip, offline replay, screen reader, touch hardware, high zoom,
forced colours or real on-water sight picture was exercised.

## Reachability and learning path

- `/pilotage` exposes **Transits & Leading Lines** at `/pilotage/transits`.
  The route table and topic registry agree on `pilotage-transits`; back and
  successful completion return to `/pilotage`.
- The parent card describes the topic only as “Visual navigation using fixed
  objects.” There is no quiz, prerequisite, chart-publication exercise or
  route-planning context.
- Completion locally requires one synthetic `read-content` event and finishing
  the embedded exercise. It does not require one correct alignment.
- The MCA outcome is to identify transits and clearing marks **from the chart
  in order to plan a safe approach to harbour or anchorage**.[^mca] This route
  neither identifies a real chart symbol nor asks the learner to plan, verify
  or monitor an approach.

## Theory, terminology and safety

### Sound foundations

- Two fixed objects in line constrain an observer to the straight line through
  them. A designated leading line is an alignment intended to be followed;
  IALA likewise defines it as a straight navigational line produced by aligned
  marks, lights or radio signals.[^iala]
- The nearer front mark being lower and the farther rear mark higher is the
  normal useful arrangement. Separating designated leading marks from natural
  or improvised transits is pedagogically useful.
- A clearing line is a boundary rather than a track to follow. “Open” and “in
  transit” are useful vocabulary when the named objects and safe side are
  established unambiguously.

### Incorrect indication and missing operational limits

- The page repeats a reversed rule: “If the rear mark drifts right, you have
  drifted left,” and labels **Rear Mark Right** as drift left. With front and
  rear objects fixed on one line, moving left gives the nearer/front object the
  greater rightward angular displacement; the rear therefore appears **left of
  the front**. The sentence “rear mark moves in the same direction as your
  drift” is compatible with that geometry, but both examples contradict it.
  This is safety-relevant because a learner may misdiagnose which side of a
  narrow channel they occupy.
- “Rear directly above front” is only the usual vertical presentation, not the
  definition of every transit. Marks can be aligned horizontally or obliquely,
  and the charted/local identification governs.
- “Works day and night” overgeneralises. It works at night only when the marks
  or lights are visible, identifiable and suitable at the observer's position;
  dayboards alone do not acquire night capability. IALA design guidance treats
  daytime marks and night lights separately.[^iala]
- “On the safe track,” “safe channel” and “very high precision” are stated
  without chart, draught, tide, lateral limits, useful segment, visibility,
  background lighting, mark outage/off-station status or cross-check. Alignment
  establishes a line, not that every point on it is presently safe.
- The clearing-line example declares the right-open side safe without a chart
  or diagram that establishes object identity, viewing direction or danger
  side. It then says crossing means the vessel “entered the danger zone”; the
  line is a limit, while the actual hazard and safety margin remain chart- and
  plan-specific.
- “Dashed line with shading on the danger side” is presented as a universal
  chart convention. The learner is not shown an authoritative chart symbol,
  bearing, leading-light characteristics, useful limit or how to confirm them
  in chart notes, sailing directions, light lists and notices.

**Proposed focused issue A — Correct and complete transit/clearing-line
teaching** (`src/pages/TransitsTheory.tsx`)

- Reproduction/context: compare the two “rear mark right” examples with a
  plan-view construction from a vessel left of two fixed marks.
- Learner impact: the primary visual off-track cue is reversed, while
  unconditional safety/night claims encourage use outside the aid's limits.
- Acceptance: correct both side indications with an unambiguous observer-view
  diagram; distinguish alignment from safe water; teach identity, charted
  bearing/direction, useful segment/lateral limits, visibility/light and
  publication checks; give a chart-based clearing-line example with named safe
  side and margin; cite current authoritative sources; test the crucial labels
  and safety qualifications.
- GitHub link: pending parent-created issue.

## Exercise geometry, scenarios and feedback

- The learner sees a 600×500 overhead “chart,” not an observer's view. Front
  and rear marks are identical red triangles at different y coordinates. They
  never visually converge or separate as the vessel moves, so the interaction
  cannot practise the lesson's defining sight cue.
- `isOnTransit` measures perpendicular distance to the **infinite** line
  through the two markers. It does not constrain along-track position, useful
  segment, land, water, depth or hazards. A vessel on a harbour wall, rock or
  beyond/behind both marks can score correct.
- The vessel can be dragged to every chart edge. The fixed rocks and soundings
  are decorative; collision, clearance and draught are not scenario inputs.
  Claims such as “safe approach,” “narrow channel,” “thread through” and “even
  a small deviation puts you in danger” therefore are not supported.
- The three scenarios reuse the same chart and task. Difficulty changes only
  from 25 to 18 to 12 viewBox pixels. Responsive scaling changes the physical
  tolerance on screen, and no angular or cross-track real-world meaning is
  defined. The line is revealed only after checking, but marker coordinates
  make the answer visually obvious in plan view.
- Check is single-shot. An incorrect result says only “not on the leading
  line,” then forces Next; it does not state the side, distance, correct cue or
  safe corrective reasoning. A correct result also supplies no explanation.
- `correctCount` is returned but the page discards it. There is no result,
  retry, review or mastery threshold. Three immediate failed checks satisfy
  `complete-exercise` exactly like three correct checks.
- Unit tests establish render presence, data shape and one keyboard increment.
  Geometry tests cover line distance, but no test rejects land/hazards/outside
  segment, proves meaningful difficulty, checks pointer scaling/capture,
  exercises all terminal outcomes or enforces mastery.

**Proposed focused issue B — Replace the plan-view placement game with valid
transit competency** (`TransitExercise.tsx`, `transitScenarios.ts`,
`transitCoordinates.ts` and tests)

- Reproduction/context: place the vessel on the mathematical line inside a
  harbour wall or beyond both marks; it is accepted. Alternatively fail all
  three one-shot checks; the page unlocks completion.
- Learner impact: success demonstrates pixel-line placement, not recognition,
  correction or safe use of a transit, while unsafe positions can be praised.
- Acceptance: define the assessable outcome and real geometry; present an
  observer sight picture and/or chart-to-view task; constrain useful water and
  segment; make hazards/depth meaningful or remove their claims; use
  scale-independent tolerances; provide side-specific explanatory feedback and
  retry; require declared mastery for completion; add deterministic geometry,
  edge-state and terminal-flow tests.
- GitHub link: pending parent-created issue.

## Accessibility, touch and responsive behavior

- The header back control is icon-only and has no accessible name.
- The SVG has no role, accessible name or description. Its marker labels and
  decorative chart text can be exposed as an incoherent graphics tree, while
  non-visual users get only vessel x/y values with no line equation, relative
  side, target, safe bounds or meaningful units.
- The vessel is an SVG group with `role="button"`, although arrow-key movement
  is a two-axis application control rather than button activation. It has no
  value semantics. Position announcements can fire for every 5-unit keypress,
  but focus is removed after Check and not deliberately placed on feedback or
  Next.
- Feedback text is not a status/live region. Toasts are an additional transient
  channel; correctness also relies on red/green vessel and line styling,
  though icons and text provide a visible non-colour distinction.
- Pointer drag begins only within a 30-viewBox-unit radius. The target scales
  with the responsive SVG and may become physically small. Pointer capture is
  requested on the deepest event target rather than the stable SVG, and there
  are no `pointercancel`/`lostpointercapture` handlers.
- `touch-none` disables native panning/zoom gestures over the full-width 600×500
  chart. On a narrow phone the exercise occupies a large scroll region, so a
  learner starting a vertical gesture there cannot scroll the page.
- Card header title/description and right-aligned progress share a
  non-wrapping `flex` row. Long text can be squeezed at narrow widths/high zoom.
  Source offers no breakpoint or overflow strategy, and live viewport checks
  were unavailable.

**Proposed focused issue C — Provide an accessible, touch-safe transit
interaction** (`TransitExercise.tsx`, page header and interaction tests)

- Reproduction/context: navigate with a screen reader or touch-scroll starting
  on the chart; inspect the unnamed SVG/control semantics and `touch-none`.
- Learner impact: non-pointer users receive coordinates without navigational
  meaning, feedback/focus transitions are fragile, and the exercise can trap a
  large portion of a phone's scrolling surface.
- Acceptance: supply an equivalent structured task and meaningful control
  semantics; name/describe the graphic and target state; announce feedback and
  manage focus; retain a robust keyboard path; use a stable pointer-capture
  lifecycle and intentional touch-action policy; label the back button; verify
  at 375/768/1280 CSS pixels, 200% zoom, keyboard, touch and a screen reader.
- GitHub link: pending parent-created issue.

## Completion and persistence

- The gate requires `read-content` and `complete-exercise`, which is stronger
  than an immediately enabled completion button. However, reaching 80% of
  document height (possibly on initial render with a tall viewport) is treated
  as reading every theory section.
- Exercise completion means advancing after one check in each scenario,
  independent of `correctCount`. The page stores only a local `exerciseDone`
  flag and discards the result.
- Visited sections are not hydrated on remount. The in-progress write is tried
  once per mount and does not expose pending, queued or failed status.
- `markCompleted` awaits `saveProgress` but ignores its Boolean outcome and
  returns true whenever the local gate was open; the page ignores that return
  value and always navigates away. This is shared hook/page behavior already
  identified by prior audits and should retain one shared issue owner rather
  than a transit-only duplicate.

## Follow-up ownership

1. Proposed issue A — Correct and complete transit/clearing-line teaching
2. Proposed issue B — Replace the plan-view placement game with valid transit
   competency
3. Proposed issue C — Provide an accessible, touch-safe transit interaction
4. Existing shared owner: [#238 — completion persistence and save-failure
   behavior](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238)

## Authoritative sources

All sources were accessed 2026-07-31.

[^mca]: UK Maritime and Coastguard Agency, [Master (Code vessels less than 200
  GT)/Officer of the Watch (yachts less than 500 GT) Oral Examination
  Syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  updated 17 June 2026, section 1.1 items 1, 5, 9–11.
[^iala]: International Association of Marine Aids to Navigation and Lighthouse
  Authorities, [Guideline G1023: The Design of Leading Lines, edition
  1.1](https://www.iala.int/content/uploads/2021/06/1023-Ed1.1-Design-of-Leading-Lines-December-2005.pdf),
  sections 2 and 5; and [Recommendation R0112: Leading
  Lights](https://www.iala.int/content/uploads/2017/10/leading-lines-ed-1-1-e-112-1.pdf).
