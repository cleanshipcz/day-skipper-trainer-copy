# Flares & Pyrotechnics theory audit

Audit issue: [#134](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/134)  
Route: `/safety/flares`  
Primary implementation: `src/pages/FlaresTheory.tsx`,
`src/components/safety/FlareIdentificationDrill.tsx`, and
`src/data/flareTypes.ts`  
Audit date: 2026-08-01

## Verdict

**Not safe or complete enough to teach as authoritative marine-pyrotechnics
training.** The route is registered and reachable from the Safety menu, its
four tabs and eight-question scenario interaction form a coherent basic UI,
and the data model consistently covers five named products. However, the most
actionable disposal instruction is obsolete, several performance/use/carriage
statements are unqualified generalisations, and the page teaches no physical
identification or manufacturer-specific operating procedure. The drill is a
name-selection exercise, not the advertised identification exercise, and any
score is persisted as completed for points.

The page should remain supplementary theory until the safety content has been
corrected and reviewed by a qualified maritime practitioner. It must not be
used as a substitute for the instructions printed on the unit aboard or for
supervised practical familiarisation.

## Reachability and structure

- `/safety` exposes a Flares & Pyrotechnics card and navigates to the audited
  route. The route is lazy-registered in `src/app/routes.tsx`.
- Both back controls return to `/safety`. The icon-only header control has the
  accessible name `back`, although a destination-specific name would be more
  useful.
- The canonical registry contains `safety-flares`, its drill child
  `safety-flares-drill`, and the quiz route `/quiz/safety-flares-quiz`.
- The quiz button is only inside the Drill tab. The generic dynamic quiz route
  and quiz catalogue make the destination valid. The bank itself is a separate
  audit leaf owned by #135.
- The route has Overview, Flare Types, Expiry & Storage, and Drill tabs. The
  completion action is outside the tabs and is available immediately.

## Content and safety review

### Types and roles

The data lists red parachute rocket, red hand flare, handheld orange smoke,
buoyant orange smoke, and white hand flare. Separating long-range attraction,
close-range location, daytime smoke, and collision warning is a useful starting
model. It is not a complete operational model:

- A red hand flare is marked `daySuitability: false` and displayed as “Night
  only”. Red handheld flares are recognised close-range distress signals and
  are not categorically prohibited or useless by day. Their visibility and
  best use differ with conditions; the binary label creates false certainty.
- Exact ranges, burn times, altitude and “15° downwind” instructions are shown
  as properties of the entire category. Product approvals and manufacturer
  instructions matter. Nominal figures must be sourced and labelled as such,
  not treated as universal firing instructions.
- The page does not distinguish recognition under COLREG Annex IV from SOLAS or
  UK type-approval/performance standards. It also omits current MCA advice on
  electronic visual distress signals and why they are not a drop-in substitute
  for required or internationally recognised pyrotechnics.
- “Using [red/orange signals] when not in distress is a criminal offence” is a
  useful warning, but the lesson should teach the wider alerting chain: DSC/VHF,
  EPIRB/PLB where carried, initial alert, long-range attraction, close-range
  position marking, conserving signals, and acting on SAR instructions.

### Carriage

“UK law does not mandate specific flare types for pleasure craft” is too broad.
Current MCA MIN 542 Amendment 3 says pleasure vessels under 13.7 m have no
specific carriage requirement, while the Class XII exemption framework for
vessels of 13.7 m and over in Category C waters and seaward specifies distress
alerting equipment including four red handheld flares and two orange smoke
flares. Commercial/coded vessels have their own requirements. A generic
“coastal” versus “offshore” outfit is not a safe substitute for checking vessel,
length, use, operating area and applicable code.

### Expiry, condition, storage, and disposal

- The page says all products have a typical three-year life from manufacture.
  Learners should follow the marked expiry and manufacturer/service regime;
  current MCA material itself discusses manufacturer expiry varying over three
  or four years. Manufacture date is not a safe universal calculation rule.
- Storage advice usefully says cool, dry, waterproof, accessible, and known to
  crew. It does not cover inspecting container and units for damage/water,
  separation from heat/ignition, readable instructions, inventory/expiry
  control, or the tension between accessibility and preventing unauthorised
  handling.
- Every record and the Disposal card say Coastguard station or chandlery.
  **This is obsolete. HM Coastguard stopped accepting private unwanted flares
  after 31 December 2022.** GOV.UK directs owners to a suitable third-party
  service and lists possible accepting suppliers, marinas, liferaft services,
  local authorities and waste businesses; acceptance must be confirmed.
  “Chandlery” alone is not a guaranteed disposal route.
- The page correctly forbids casual firing and dumping at sea, but should also
  explicitly forbid household/garden waste, recycling centres and abandonment,
  and explain continued owner responsibility for safe storage, transport and
  disposal.

### Use and handling

“Hold at arm's length downwind” and “wear gloves if possible” are insufficient
as operating instruction and can be wrong for a particular casing. Missing
essentials include reading each unit's instructions before an emergency;
identifying firing end, cap and ignition method; adopting the product-specified
orientation and stance; clearing faces, crew, sails/rigging, fuel and liferaft
canopy; dealing with damaged/wet units and misfires; and never firing toward or
under aircraft. The page must defer to the casing/manufacturer rather than teach
one memorised angle for every rocket or one grip for every handheld product.

## Visual audit

There are no flare illustrations, photographs, silhouettes, casing labels,
approval/expiry markings, firing-end diagrams, smoke/trajectory diagrams, or
handling sequences. Lucide Sparkles, AlertTriangle, Clock, Gamepad, Sun and Moon
icons are decorative navigation cues, not instructional visuals.

Consequently, a learner can finish “Flare Types” without seeing what any item
looks like and the “identification” drill reveals the product's full name. The
lesson needs licensed, representative product/form-factor visuals with visible
markings and structured text equivalents. Identification cannot depend on red,
orange or white colour alone: casing shape, wording, symbols, ends and marked
purpose/expiry must be taught. Any visual must make product variation and the
need to read the actual onboard instructions explicit.

## Drill behavior and feedback

- Eight scenarios are Fisher-Yates shuffled once per mount. All five named
  answers appear for every scenario with day/night and burn-time clues.
- Check Answer is disabled until a selection. A normal submission disables all
  options, outlines the correct option, marks a selected wrong option, shows an
  inline explanation, and also creates a toast. However, `handleSubmit` does
  not guard `prev.answered`: same-turn/programmatic duplicate activation can
  process the same scenario more than once, repeat its toast, and increment
  `correctCount`/`totalAnswered` repeatedly. The final denominator can therefore
  exceed the eight scenarios and the persisted score can be corrupted.
- Next Scenario advances; after the eighth answer, a score and Restart Drill
  button appear. Reset/restart reshuffles and erases the local attempt.
- `onComplete` fires once per finished run through a ref and can fire again
  after reset. With an empty scenario bank, `isComplete` is evaluated before
  the missing-current-scenario branch: the component renders a misleading
  Drill Complete 0/0 card and calls `onComplete({0, 0})`. The parent callback's
  `totalAnswered === 0` guard prevents persistence, but the learner still sees
  a false completion instead of an unavailable/error state.
- Explanations state the intended answer but do not explain why the selected
  distractor is unsuitable, cite the operative rule, or route a misconception
  back to a specific theory section.
- There is no mastery threshold, missed-item review, spaced retry, attempt
  history, or scenario/version identity in persistence. A score of 0/8 and 8/8
  both save `completed: true` and request ten points.
- Several scenarios reproduce the same unsafe absolutes as the theory data,
  notably the fixed 15° rocket instruction and categorical day/night roles.

This interaction assesses scenario-to-name matching, not visual
identification. Its clues also make answers easier by restating the metadata.

## Completion and persistence

- Mark as Complete is enabled on first render. It calls `saveProgress` with
  100%, ten points, then immediately sets local `theoryCompleted` true. No
  content review, drill attempt, or knowledge evidence is required.
- Neither theory nor drill awaits the returned promise. Resolved `false`,
  rejection, successful offline queueing and server persistence are not
  represented distinctly in the page UI.
- Anonymous `saveProgress` returns false without feedback, but the theory
  button still becomes Completed. A drill run looks complete but silently has
  no durable record.
- Existing progress is never loaded. Reload restores neither theory UI nor a
  partial drill; returning users see Mark as Complete again. Rapid repeated
  interaction is not guarded while a save is pending.
- Drill and theory are separate durable IDs, but their relationship to parent
  Safety completion and the separate quiz is not explained. The reward and
  retry/idempotency contract is invisible.

Shared save-result semantics are already represented by #238. Route-specific
evidence, drill completion, hydration and UI are owned by #349.

## Accessibility, inputs, and layouts

Positive source-level observations:

- Radix tabs provide established keyboard tab semantics and focus styles.
- Answer options and actions are native buttons; submitted options become
  disabled. Text accompanies colour and check/cross icons in the result panel.
- The header back button has an accessible name and all primary actions have
  visible text.

Risks and gaps:

- Five independent buttons do not expose a programmatically named single-choice
  group or selected state before submission. A radio-group model would better
  communicate the task.
- Question changes, reset, feedback, score changes and completion have no
  deliberate focus-management/live-region contract. Toast plus inline feedback
  may duplicate announcements or announce neither reliably.
- Correct/wrong card borders use red/green styling; icons lack explicit hidden
  text relationships. Forced-colour behavior has not been verified.
- The four-column tab list becomes two columns at narrow widths, but long labels,
  320/375 px layouts, high zoom, horizontal overflow, touch targets and sticky
  header interaction have no browser evidence. At 400% zoom the fixed tab grid
  and whitespace-preserving triggers are particular risks.
- No reduced-motion, screen-reader, keyboard-only, touch, forced-colours, dark
  mode contrast, or focus-after-transition tests exist.

The checked-in drill tests only render static markup and look for five names,
the prompt, and score text. They do not perform an interaction.

## Follow-up ownership

Duplicate searches for flare/pyrotechnic, disposal, visual identification,
drill and progress terms found audit #134, separate quiz audit #135, and shared
progress issue #238, but no implementation issue covering these findings.

- [#348](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/348)
  owns authoritative theory/data correction, current disposal/carriage advice,
  handling procedure, EVDS context, and actual accessible identification
  visuals. The quiz may consume this source, but #135 owns quiz-bank findings.
- [#349](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/349)
  owns the drill's assessment, feedback, accessibility, responsive behavior,
  route-specific completion and persistence. It coordinates shared
  `saveProgress` behavior with #238.

## Sources consulted

- MCA, **MIN 542 (M+F) Amendment 3: life saving appliances – recognised
  distress signals and advertised alternatives to pyrotechnic flares**, 12
  April 2024, current notice expiring 1 March 2027.
- MCA/DfT, **Disposing of unwanted marine flares**, updated 1 January 2023.
- MCA, **MIN 687: Changes to how individuals can dispose of redundant flares**.
- RYA, **Disposing of out of date flares**, used as corroborating sector advice;
  it states HM Coastguard and RNLI lifeboat stations do not accept flares.

Authoritative sources support the audit boundary and identify defects; exact
replacement product instructions still require manufacturer-specific evidence
and qualified review.

## Verification and limitations

The audit inspected implementation, data, registry, routes, parent menu,
progress hook, existing tests, quiz catalogue linkage, and existing GitHub
issue ownership. Static/type/test/lint/build checks verify the documentation
change does not break the repository; they do not validate the maritime claims.

Not performed: handling or firing pyrotechnics; manufacturer/product comparison;
qualified maritime review; authenticated/anonymous/offline browser sessions;
screen-reader and forced-colour sessions; 200%/400% zoom; physical phone/tablet;
touch-only operation; or live production persistence. These remain acceptance
work for #348 and #349, not evidence that the current experience is safe.
