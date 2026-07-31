# Sail Controls & Lines learner-facing audit

- Audit issue: [#88](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/88)
- Route/topic: `/nautical-terms/sail-controls` / `nautical-terms-sail-controls`
- Audited: 2026-07-30; reconciled with the updated Boat Parts audit chain on
  2026-07-31
- Primary implementation: `src/pages/SailControls.tsx`
- Related navigation and terminology: `src/pages/NauticalTermsMenu.tsx`,
  `src/pages/NauticalTerms.tsx`, `src/constants/topicRegistry.ts`

## Verdict

**Needs targeted remediation before it is a high-quality, inclusive learning
leaf.** The route is reachable, all 12 entries reveal substantial explanatory
content, and the 12-question purpose-to-name quiz can be completed with
coherent first/second-attempt scoring. However, the complete learning
interaction is unavailable from a keyboard or screen reader, save success is
assumed rather than verified and returning progress is not loaded, delayed
quiz transitions can outlive the run that created them, and several sail-trim
statements and the page's rigging taxonomy need correction. The quiz also does
not perform the diagram identification promised by its instructions.

## Evidence and exercised paths

### Runtime method and scope

A production build using local placeholder Supabase configuration (no
credentials or live backend) was served locally and exercised in headless
Chromium through the Chrome DevTools Protocol with a clean browser profile.
The run used actual click events and responsive layout, revealed a named
control, started the quiz, selected the correct answer for every shuffled
question, and observed completion.

Observed browser results:

- The second **Start Learning** action on `/nautical-terms` navigated to
  `/nautical-terms/sail-controls`; the leaf heading rendered correctly.
- At 375, 768, and 1280 CSS px, document-level horizontal overflow was 0 px.
  The 600×700 schematic rendered at 294×343, 671×782.83, and 896×1045.33 CSS
  px respectively, with all 12 learning cards present.
- Clicking the Main Halyard SVG group revealed its purpose, location, effect,
  and description.
- Learn mode exposed only two native tab stops: an unnamed icon-only Back
  button and **Start Quiz**. All 12 SVG groups had `tabIndex=-1`, no role, and
  no accessible name; the 12 clickable cards were also absent from the tab
  order.
- Quiz mode began at **Question 1 of 12**. A clean first-try run answered all
  12 shuffled controls and reached **Quiz Complete!**, **Final Score: 120
  points**, and **You identified 12 out of 12 sail controls.**

No authenticated remote persistence round-trip was attempted because no audit
backend was available. Save-failure and returning-progress findings therefore
come from direct control-flow inspection. The delayed-transition hazard is
also source-confirmed rather than timing-injected in the browser: every
correct answer creates an untracked `setTimeout`, and reset/unmount paths do
not invalidate it.

### Navigation and completion

- The parent menu names and routes the leaf correctly; Back returns to
  `/nautical-terms`.
- Learn mode offers the same 12 entries in a labelled schematic and card grid.
  Clicking either path selects a detail card; selecting the same entry again
  closes it.
- Quiz completion offers **Review Controls** and **Try Again**, but no
  parent/full-quiz handoff. Review preserves the completed score/state in
  memory; Try Again resets it.
- Completion calls `saveProgress` with the registered durable topic ID only
  when `user` is truthy. It does not await or inspect the result, show a
  saving/failure state, or load an existing record.

### Quiz, scoring, and edge behavior

- `startQuiz` shuffles all 12 controls exactly once. Each prompt displays the
  active control's purpose and four shuffled names.
- A correct first response awards 10 points; any correct response after one or
  more wrong attempts awards 5. The completion maximum is 120 and percentage
  uses that maximum.
- The chosen wrong option is disabled and explained. Other wrong options
  remain available, so multiple attempts are counted but never reduce the
  eventual award below 5 points.
- Each correct answer schedules a one-second transition that is not tracked or
  cancelled. Reset, restart, navigation, and unmount during that interval can
  allow an obsolete callback to update a newer or hidden run.

### Diagram, responsive behavior, and accessibility

- The SVG scales without page overflow at the required widths, but embedded
  text and narrow line targets become substantially smaller at 375 px. There
  are no enlarged touch targets.
- Learn-mode SVG groups and cards are pointer-only. Hover highlighting is
  useful for mouse users but has no focus equivalent. Back and detail Close
  are icon-only without names; the custom progress bar has no progress
  semantics; feedback/state changes lack a live region.
- Quiz mode retains the fully labelled diagram but does not highlight the
  control being asked about. The prompt is actually a purpose-to-name recall
  task, not the advertised line-identification task.
- The jib luff is drawn vertically beside the mast while the forestay is
  diagonal to the bow, repeating the misleading geometry identified in the
  Boat Parts audit.

## Content-quality notes

The catalogue covers a useful introductory set of running-rigging and
sail-shape controls, with concise purpose/location/effect fields. However, the
page calls the whole catalogue “running rigging” and “control lines” even
though Mainsheet Traveller and Jib Fairlead are hardware and Backstay Adjuster
acts on standing-rigging tension. That scope blurs the category boundary the
introductory copy is meant to teach. The following statements also need
technical revision:

- Treating **Cunningham** as simply “also called: Downhaul” obscures the
  defining cringle-versus-tack distinction.
- Reefing copy implies both luff and leech controls run through the boom and
  describes tying down a fold without distinguishing reefing control lines
  from non-load-bearing reef ties.
- Moving the traveller leeward is described as producing “more power”, though
  dropping it is commonly a depowering/open-leech adjustment.
- Jib-sheet trimming is said to flatten the sail and improve pointing as an
  unconditional effect; lead position, existing trim, and over-trim matter.

Terminology uses the same names as Boat Parts for mast, boom, mainsail, jib,
forestay, backstay, head, clew, tack, luff, leech, and foot. That agreement is
not proof that all shared definitions are sound: the updated Boat Parts audit
requires configuration-aware corrections for boom and mainsail in #153, while
the more detailed Sail Controls taxonomy and trim claims require the focused
corrections in #147. Those two follow-ups explicitly coordinate their wording,
and #142 owns the shared visual relationship between jib and forestay.

## Focused follow-up issues

- [#145 — Make Sail Controls learning interactions keyboard- and screen-reader-accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/145)
- [#146 — Cancel stale Sail Controls quiz transitions across reset and restart](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/146)
- [#147 — Correct misleading Sail Controls terminology and trim-effect guidance](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/147)
- [#148 — Align the Sail Controls quiz interaction with its identification instructions](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/148)
- [#149 — Load Sail Controls progress and surface durable save failures](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/149)
- [#150 — Make the Sail Controls schematic legible and touch-usable at responsive sizes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/150)
- [#142 — Correct jib/forestay geometry across Boat Parts and Sail Controls](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/142)
- [#153 — Correct configuration-dependent Nautical Terms and Boat Parts definitions](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/153)
