# Pilotage Plan Builder learner-facing audit

- Audit issue: [#116](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/116)
- Route/topic: `/pilotage/plan` / `pilotage-plan`
- Audited: 2026-07-31
- Page: `src/pages/PilotagePlan.tsx`
- Builder: `src/components/pilotage/PilotagePlanBuilder.tsx`
- Calculation model: `src/components/pilotage/pilotagePlan.ts`

## Verdict

**The route is reachable and the builder can collect and remove a short list of
named legs, but it is not yet a safe or cockpit-ready pilotage-plan exercise.**
The preloaded plan can be completed immediately without any learner action. It
cannot edit or reorder a waypoint, save a draft, reload a plan, or produce a
brief/printout. Its five waypoint fields do not capture positions, clearing or
danger bearings, hazards/no-go areas, depth/draught limits, expected visual
cues, fix/monitoring methods, abort points or contingencies despite the page
telling the learner to record several of them.

The time model is the most consequential defect. It adds an arbitrary signed
number of “tidal offset” minutes to distance / speed. A tidal stream changes
course and speed over the ground as a vector; it is not an independently chosen
number of minutes. A learner can enter `-10000` and receive a zero-minute plan.
The guided “Safe-water mark” also carries `Q(6)+LFl.10s`, the characteristic
of a south cardinal mark, not a safe-water mark. The exercise therefore embeds
both unsafe navigational content and no meaningful mastery check.

The basic calculation is deterministic for ordinary finite data, completion
correctly waits for a successful persistence result, and controls are native
HTML inputs/buttons. Three focused follow-ups are proposed below. Shared
cross-topic completion hydration and durable save behavior remain with #238.

## Evidence and audit bounds

### Method

The menu link, route and topic registry; complete page, builder and calculation
model; progress boundary; feature requirements; and all five existing unit and
interaction tests were inspected. Every state transition and numeric boundary
was traced from source, and the supplied example was independently calculated:
2.6 NM at 5 kn is 31.2 minutes, plus the configured `+3` minutes, rounded to 34.

The content was compared with IMO voyage-planning guidance, which calls for
appraisal, detailed berth-to-berth planning, execution and close continuous
monitoring, and with the current MCA yacht syllabus requirements for charts and
publications, position checks, course/bearing reference conversion and action
when off track.[^imo][^mca]

No actual chart, Port Victoria identity, chart edition, notices, tide source,
stream atlas, vessel particulars or harbour publication is supplied, so the
example cannot be approved for real navigation. No live browser, touch device,
screen reader, high-zoom check, print workflow or authenticated backend
round-trip was exercised. The repository has no general installed Playwright
suite; responsive and accessibility findings are source-based.

## Reachability, workflow, completion and persistence

- `/pilotage` exposes a practice card to `/pilotage/plan`; the lazy route and
  canonical topic ID agree, and the header back control returns to `/pilotage`.
- Three guided rows are present on first render. **Complete pilotage plan** is
  immediately enabled and awards score 100 / 15 points without an edit,
  validation review, question or demonstrated crew brief.
- The copy says “Adjust it,” but rows have only **Remove**. There is no edit,
  reorder, insert-between, duplicate or undo operation. A removed guided row
  cannot be restored except by reload.
- Draft data lives only in component state. Navigation/reload discards it; no
  draft is loaded from progress. Completion stores a summary in
  `answers_history`, but the route never renders, exports or reopens that data.
  There is no printable cockpit card or even a final ordered textual output
  distinct from the editable list.
- A successful save locks only the completion button. Changing speed, removing
  a row or adding one clears local completion and permits another save; editing
  draft fields does not, appropriately, because they are not part of the plan.
- During persistence all mutations are disabled and `finally` releases the
  lock. A false save result permits retry. Anonymous completion therefore
  remains visibly incomplete, an improvement over pages that self-certify.
- Existing completion is not hydrated and successful offline queueing can show
  local completion before server sync. These shared progress concerns are
  already owned by [#238](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238).

## Navigational content, fields and calculation safety

- `Q(6)+LFl.10s` is the IALA south-cardinal quick-group characteristic. A
  safe-water mark may use Iso, Oc, LFl.10s or Morse “A”; labelling the guided
  object “Safe-water mark” teaches a dangerous identification error.
- “Port Victoria” has no country, coordinates, chart or publication. Bearings,
  distances, marks, harbour call and speed limit are therefore untraceable and
  should be unmistakably fictional or tied to current authoritative data.
- “Bearing (°T)” does not state from which position to which object/waypoint it
  runs. Each row is called a waypoint but behaves like a leg. There are no
  coordinates, reciprocal/cockpit compass value, variation/deviation, course
  to steer, cross-track/clearing limits or position-monitoring cue.
- The notes placeholder mentions lights, clearing bearings, VHF and contingency
  but none is required or structured. The guided plan includes no explicit
  hazard/no-go area, depth/draught/height-of-tide margin, abort point, expected
  depth, fix frequency, sector light, leading line, traffic or loss-of-visual
  contingency. A blank-notes waypoint can be completed.
- Distance / speed through water gives time through the water, not necessarily
  elapsed time over the ground in tidal stream. Summing arbitrary signed minute
  offsets has no navigational derivation, direction, time/source or uncertainty.
  `-10000` clamps the total to zero; huge positive values are accepted.
- Speed accepts any positive finite browser number with no operational range or
  precision. `calculatePlanSummary` itself accepts `NaN`, infinity, negative
  distances and non-finite offsets, yielding `NaN`/infinity in several cases;
  only newly added waypoint values receive partial finite/range validation.
- Bearing correctly rejects `<0` and `>=360` on add, and distance rejects zero
  and negatives. However invalid add attempts fail silently, with no field
  error, focus movement or explanation. No upper bounds or sensible precision
  are enforced, and scientific notation may be accepted by the browser.
- Floating distance is rounded only after summing and time is rounded to a
  whole minute. The UI does not disclose rounding or retain leg-by-leg timings,
  cumulative ETAs, planned start time or tidal validity window.

**Proposed focused issue A — Correct the Pilotage Plan model, example and
timing calculations** (`PilotagePlan.tsx`, `pilotagePlan.ts`, guided data and
tests)

- Reproduction/context: inspect the first mark and enter a very negative tidal
  offset; the builder identifies a south-cardinal light as safe water and can
  report zero minutes for a 2.6 NM approach.
- Learner impact: learners are rewarded for a false light identification and a
  physically unsupported ETA that can understate confined-water time.
- Acceptance: replace the example with explicitly fictional, internally
  coherent data or traceable current source material; correct every mark/light;
  model named legs and bearing direction/reference; derive timing from defined
  speed-over-ground or defensible vector inputs and expose assumptions/rounding;
  reject non-finite and operationally invalid data; include deterministic unit
  tests for ordinary, boundary and hostile numeric cases.

## Exercise validity, pedagogy and cockpit output

- The builder assesses data entry, not pilotage planning: it provides no chart
  or scenario constraints against which a bearing, leg or safe limit can be
  judged. Any syntactically valid plan earns full marks.
- It gives no learning feedback about sequencing seaward-to-berth, safe water,
  visual identification, monitoring, tidal effects or contingency quality.
- Removing all rows disables completion, but retaining any one default row is
  sufficient. There is no minimum coverage, review checklist or mastery gate.
- The displayed total is global only; it omits leg times and cumulative timing.
  The saved snapshot has no schema/version, date, vessel, source references or
  user-entered plan identity and is not surfaced as a usable cockpit artifact.
- Two calculation tests cover one ordinary sum and empty/zero speed. Three
  interaction tests cover the persistence lock/retry and mutation after save.
  They do not cover add validation, removal to zero, ordering/editing, numeric
  edges, content correctness, route rendering, output or accessible errors.

**Proposed focused issue B — Turn Pilotage Plan Builder into a scenario-based
planning and briefing exercise** (`PilotagePlanBuilder.tsx`, plan model,
progress payload/output and tests)

- Reproduction/context: load the route and click completion immediately, or
  remove two defaults and complete the remaining row; both earn 100 without
  planning or briefing.
- Learner impact: the route labels an unassessed waypoint list a cockpit-ready
  plan and gives false evidence of mastery.
- Acceptance: provide a coherent chart/publication-backed or clearly fictional
  scenario; support add/edit/remove/reorder and structured marks, courses,
  distances, hazards, safe limits, monitoring cues, depth/tide, communications,
  abort/contingency fields; validate plan coverage and explain corrections;
  require a review/briefing mastery step; produce a concise printable/exportable
  ordered cockpit plan with leg and cumulative timing; preserve/reopen drafts
  with a versioned model; test every operation and terminal flow.

## Accessibility, responsive layout and input feedback

- Labels are programmatically associated and buttons are native keyboard
  controls. The two-column grid collapses below `md`, and the page has no
  obvious fixed-width content.
- All row controls share the accessible name “Remove”; screen-reader and voice
  users must infer which repeated control belongs to which waypoint. Rows are
  generic `div`s rather than a semantic ordered list.
- Silent validation provides neither inline error text nor `aria-invalid`, a
  live region or focus placement. Pressing Enter in a field does not submit
  because the inputs are not in a form.
- Saving/completed state is communicated only through the disabled button
  label; no status region announces persistence success/failure. Failure toast
  behavior is outside this component and anonymous failure has no local reason.
- Number fields rely on browser steppers and constraints, but semantic
  validation is deferred until **Add waypoint**. Mobile numeric keyboard hints,
  units in accessible descriptions and locale/decimal behavior are unverified.
- Long names/notes and large numeric output can wrap inside the row’s
  `flex justify-between` header; there is no viewport/high-zoom regression test.
  The small ghost remove targets have no documented touch-size verification.

**Proposed focused issue C — Make Pilotage Plan input, errors and output
accessible and responsive** (`PilotagePlanBuilder.tsx` and component/browser
tests)

- Reproduction/context: submit an empty name or bearing 360; nothing explains
  why no row was added. Navigate repeated “Remove” controls by screen reader,
  voice or keyboard at narrow width/high zoom.
- Learner impact: users can be stranded by invisible validation and cannot
  reliably target or review the ordered plan non-visually.
- Acceptance: use semantic ordered/form structure; uniquely name row actions;
  expose units, constraints and inline errors with focus/live announcements;
  support predictable Enter submission without duplicate action; announce save
  outcomes; define robust long-content/action reflow and touch targets; make
  the final cockpit artifact readable non-visually; add component/a11y checks
  and documented 375/768/1280 CSS-pixel, 200%-zoom, keyboard, touch and screen-
  reader verification.

## Follow-up ownership

1. Proposed: **Correct the Pilotage Plan model, example and timing calculations**.
2. Proposed: **Turn Pilotage Plan Builder into a scenario-based planning and
   briefing exercise**.
3. Proposed: **Make Pilotage Plan input, errors and output accessible and
   responsive**.
4. Existing shared owner: [#238 — completion persistence and save-failure
   behavior](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/238).

## Authoritative sources

All sources were accessed 2026-07-31.

[^imo]: International Maritime Organization, [Resolution A.893(21), Guidelines
  for Voyage Planning](https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.893%2821%29.pdf),
  paragraphs 1–4.
[^mca]: UK Maritime and Coastguard Agency, [Master (Code vessels less than 200
  GT)/Officer of the Watch (yachts less than 500 GT) Oral Examination
  Syllabus](https://www.gov.uk/government/publications/deck-officer-yacht-oral-examination-syllabuses/master-code-vessels-less-than-200-gtofficer-of-the-watch-yachts-less-than-500-gt-oral-examination-syllabus),
  updated 17 June 2026, section 1.1.
