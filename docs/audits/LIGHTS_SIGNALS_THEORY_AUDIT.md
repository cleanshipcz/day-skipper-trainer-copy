# Lights, Shapes & Sounds learner-facing audit

- Audit issue: [#102](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/102)
- Route/topic: `/rules/lights/theory` / `lights-theory`
- Audited: 2026-07-31
- Primary implementation: `src/pages/LightsTheory.tsx`
- Parent navigation: `src/pages/LightsSignalsMenu.tsx`
- Related quiz: `src/data/quizzes/lightsSignals.ts`, `src/pages/Quiz.tsx`
- Completion: `src/features/progress/useTheoryCompletionGate.ts`

## Verdict

**This is a mnemonic revision sheet, not the “Comprehensive Theory” promised
by its parent, and it is not safe as a standalone guide to COLREG Parts C and
D.** The registered parent card reaches the page, four keyboard-operable tabs
organize a useful starter set, the quiz link works, and the production build is
technically healthy. However, the lesson reduces Rules 20–31 to six light cards
and eight day-shape cards, Rules 32–36 to eight whistle patterns, and Annex IV
to a flat list.

Material rules, conditions and configurations are absent. Among the retained
statements, `<20 m` combined sidelights/sternlight are incorrectly described as
a “masthead lantern,” the second masthead-light threshold is stated as “Over
50m” rather than 50 m or more, one forward all-round white light is presented
as the general anchor requirement, and exactly “5 Short” is presented for the
Rule 34 doubt signal rather than at least five short and rapid blasts. Towing,
pushing, fishing, NUC/RAM operations, dredging, mine clearance, CBD, larger
anchor configurations, small vessels and most fog signals cannot be learned
reliably from the page.

There are no vessel-aspect diagrams, light placement/range comparisons, audible
signals or applied identification exercises. Lights are 16 px coloured dots
and shapes are unlabeled CSS silhouettes; learners never practise turning an
observed aspect/rhythm into vessel status and safe action.

Completion measures tab activation, not learning. Lights is visited on mount;
pressing ArrowRight three times visits the remaining tabs and immediately
unlocks completion. Reload discards that local evidence. Save failure behavior
is inherited from the shared gate: a resolved `false` is treated as success,
while a rejection has no recovery UI. At 375 CSS px the default Lights tab had
44 px of horizontal overflow and both bottom actions extended off-screen. Back
has no accessible name.

## Evidence and audit bounds

### Method

The page, parent route, route/registry declarations, completion hook, 20-item
linked question bank and relevant shared tests were inspected directly.
Content was compared rule-by-rule with the current US Coast Guard official
International Rules amalgamation/handbook and the IMO COLREG overview.[^uscg]
[^handbook][^imo]

Typecheck, lint, production build and the internal-artifact guard passed. A
placeholder local Supabase endpoint was used only to let the production bundle
render; no live persistence claim is made. The built app was served locally and
exercised in headless Chromium through the Chrome DevTools Protocol with a clean
profile at 375, 768 and 1280 CSS px.

Observed browser results:

- The parent **Comprehensive Theory** card reached `/rules/lights/theory` and
  the quiz card was present at all three widths.
- The page initially exposed four native tabs with Lights selected. Real
  ArrowRight input selected Shapes, Sounds and Distress in order; after the
  third key the completion button changed from disabled **Explore all sections
  to complete** to enabled **Complete Module**.
- Reload restored the gate to disabled, confirming that visited tabs were not
  hydrated.
- On the default Lights tab, document/client width was 419/375: 44 px
  horizontal overflow. Cards reached approximately x=388 from a 16 px start;
  the actions reached approximately x=-44 and x=404. At 768 and 1280 there was
  no document-level overflow on that tab.
- The parent had no overflow at the three widths. No runtime exception occurred
  after the placeholder backend configuration was supplied.
- Back was an icon-only button with neither text nor `aria-label`.

A live authenticated/anonymous save round-trip, actual touch hardware,
screen-reader output, sound output, high zoom, forced colours, reduced motion,
offline reconciliation and completion activation against a real backend were
not exercised.

## Reachability and implemented flow

- `/rules/lights` is registered from Rules of the Road and presents
  **Comprehensive Theory** and **Mastery Quiz** cards. The theory card correctly
  reaches `/rules/lights/theory`; Back returns to `/rules/lights`.
- The page links directly to `/quiz/lights-signals`. The bank contains exactly
  20 questions although the parent promises “30+ scenarios.” Most are short
  recall prompts rather than scenarios and every source answer is index zero.
  Quiz-shell issues already tracked elsewhere apply; audit #105 owns a complete
  assessment review, and #214 already covers prerequisites/count/alignment.
- `useTheoryCompletionGate` requires `lights`, `shapes`, `sounds` and
  `distress`. An effect visits Lights on mount and `Tabs.onValueChange` visits
  every selected tab, with no read, dwell, recognition or application check.
- Only the first `in_progress` transition is persisted. Later visited tabs are
  not saved, and returning evidence is not loaded into the hook.
- Completion awaits `markCompleted()` and then navigates. The hook ignores the
  Boolean returned by `saveProgress`; resolved `false` still returns `true`.
  Rejection escapes without a loading, failure, retry or queued/offline state.

## Part C: lights and shapes

### Rules 20–22 foundations

- Rule 20 requires Rules 20–31 in all weathers. Prescribed lights are exhibited
  sunset to sunrise; during that period no confusing/visibility-impairing
  lights may be shown. Restricted-visibility lights are also exhibited from
  sunrise to sunset and prescribed lights may be shown whenever necessary.
  “Lights must be shown from sunset to sunrise and in restricted visibility”
  drops these distinctions.
- Rule 21 definitions are absent. The page gives only masthead/stern arcs and
  never defines sidelights, towing, all-round or flashing lights. “Masthead
  lantern” for a sailing vessel's combined lantern is wrong terminology.
- Rule 22 visibility ranges are wholly absent, as are size-dependent ranges.

### Vessel configurations

- **Rule 23:** “Under 50m” is presented as a single configuration and “Over
  50m” as requiring two masthead lights. The threshold is 50 m or more; a
  vessel under 50 m may exhibit the second light. Under-12 m and under-7 m/
  7-knot alternatives, WIG craft and the precise non-displacement hovercraft
  condition are absent.
- **Rule 24:** towing and pushing are absent from theory, although quiz item
  `ls12` tests the yellow towing light and `ls19` tests a tow over 200 m.
  Masthead counts, composite units, inconspicuous/partly submerged tows and
  shapes are not taught.
- **Rule 25:** basic sailing sidelights/sternlight, combined lantern,
  red-over-green option and power cone are mentioned. The combined lantern is
  incorrectly located at the “masthead”; the options' mutual constraints,
  under-7 m and oar-vessel alternatives are absent.
- **Rule 26:** red/white and green/white mnemonics omit day shapes, making-way
  sidelights/sternlight, trawler masthead option/requirement and gear extending
  over 150 m. “Fishing” is not tied to Rule 3's restricted-manoeuvrability
  definition.
- **Rule 27:** NUC and generic RAM status lights/shapes are shown, but the page
  omits their making-way lights and RAM operation-specific towing, dredging/
  underwater-operation, diving and mine-clearance indications. Learners cannot
  distinguish obstruction/free sides.
- **Rules 28–29:** CBD is represented only by a cylinder and pilot only by two
  status lights. CBD lights and optional power lights, pilot underway/anchor
  additions and the non-pilot fallback are absent.
- **Rule 30:** one all-round white “Fore part” is overgeneralized. Vessels 50 m
  or more require forward and lower aft anchor lights plus available deck
  illumination; under 50 m may use one where best seen. Aground also requires
  three balls and two all-round reds, subject to stated small-vessel exceptions.
- **Rule 31:** seaplane/WIG closest-possible compliance is absent.

### Visual learning

The page never draws a vessel, horizon, centreline, aspect or sector. Coloured
dots appear inline in reading order, so relative vertical/horizontal placement,
visibility arc, range and which lights can be seen together are not represented.
CSS balls/cones/diamonds are cleaner than the dots but are not semantic images,
and the labels do not teach placement or operation-specific combinations.
There is no recognition from ahead/astern/beam, ambiguity case, range/aspect
transition, feedback, replay or accessible structured equivalent.

## Part D: sound and light signals

- Rule 32's short/prolonged definitions appear only in a card subtitle as
  “Tests use,” while whistle/bell terminology is absent. Rule 33 equipment is
  absent.
- Rule 34 maneuver signals need the power-driven, in-sight, underway context.
  The danger signal is **at least five** short and rapid blasts, not exactly
  “5 Short.” Overtaking proposals/agreement in a narrow channel, bend/
  obstruction signals and permitted synchronized light flashes are absent.
- Rule 35 teaches making way, underway but stopped, a compressed
  prolonged-short-short group, and the last manned tow. Anchor, aground, pilot,
  pushing/towing distinctions and relevant small-vessel alternatives are
  absent. “Everything Else” obscures exact applicability and exceptions.
- Rule 36 attention signals and their non-confusion/searchlight constraints are
  absent.
- Nothing produces sound. Badges such as `1 Pro` and `every 2m` are compact but
  unexplained notation, not an audible/timed pattern with a non-audio
  equivalent.

## Rule 37 and Annex IV distress

The introductory “Used only when in grave and imminent danger” is not the
rule's formulation: Rule 37 points to Annex IV signals indicating distress and
need of assistance, and Annex IV prohibits using/exhibiting them for another
purpose. The flat list does not distinguish recognition, transmission and
equipment operation. Labels such as `MAYDAY by Radio`, `EPIRB Activate`, `DSC
Distress Alert` and `Square flag & Ball` omit exact configuration/context.

The page supplies no visual depiction of N over C, flag-and-ball arrangement,
flares, smoke or arm movement; no audio/rhythm; no false-alert/cancellation
boundary; and no response duties. A warning triangle repeated on every card
does not encode the signal.

## Completion, persistence and edge states

- Mounting is enough to visit Lights; one keyboard traversal or four quick
  taps completes the entire evidence set.
- Visited state contains broad presentation-tab IDs, not versioned rule or
  objective evidence. Content can change without invalidating completion.
- The first partial state can be saved, but later tabs are never persisted and
  reload starts empty.
- Resolved-false, rejection, offline, delayed save, rapid double activation,
  owner change and repeated reward behavior have no page-specific UI/tests.
- Completion and quiz controls compete side by side; at 375 px their combined
  full-width/margin layout extends beyond both viewport edges.

## Accessibility, responsive behavior and input

Positive foundations include semantic headings/cards, native Radix tabs with
working arrow-key selection, text beside most symbols, and native completion/
quiz buttons.

Material gaps remain:

- Back has no accessible name.
- Tiny colour dots and black CSS shapes are not accessible graphics and provide
  no equivalent geometry. Forced-colour behavior is undefined.
- At 375 px Lights cards and the action row cause 44 px document overflow.
- Gate/save changes are not deliberately announced and error/retry focus does
  not exist.
- Mobile reflow, high zoom, screen reader, long localization, forced colours
  and touch targets have no checked-in regression coverage.

## Follow-up issues

1. [#217 — Correct and complete COLREG lights and day shapes](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/217)
2. [#218 — Complete COLREG sound and light signal teaching](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/218)
3. [#219 — Correct and contextualize Annex IV distress signals](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/219)
4. [#220 — Make Lights & Signals theory completion durable and evidence-based](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/220)
5. [#221 — Make Lights & Signals theory accessible and responsive](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/221)

Existing [#105](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/105)
owns the dedicated linked-quiz audit. Existing
[#214](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/214)
already owns combined Rules quiz prerequisites, count/copy and theory
alignment; shared quiz-shell issues should be reused rather than duplicated.

## Authoritative sources

All sources were accessed 2026-07-31.

[^uscg]: United States Coast Guard Navigation Center, [“Amalgamated Navigation
  Rules — International & U.S.
  Inland”](https://www.navcen.uscg.gov/navigation-rules-amalgamated), current
  International Rules text, Rules 20–37 and Annex IV.
[^handbook]: United States Coast Guard, [“Navigation Rules and Regulations
  Handbook, corrected 8 August
  2024”](https://www.navcen.uscg.gov/sites/default/files/pdf/navRules/Handbook/NavRules_Handbook_Corrected_08_08_2024.pdf).
[^imo]: International Maritime Organization, [“COLREG — Preventing collisions
  at sea”](https://www.imo.org/en/ourwork/safety/pages/preventing-collisions.aspx),
  convention structure, amendments and Annex IV distress-signal text.
