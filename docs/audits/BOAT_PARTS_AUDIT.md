# Boat Parts learner-facing audit

- Audit issue: [#87](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/87)
- Route/topic: `/nautical-terms/boat-parts` / `nautical-terms-boat-parts`
- Audited: 2026-07-30
- Primary implementation: `src/pages/NauticalTerms.tsx`
- Related navigation and assessment: `src/pages/NauticalTermsMenu.tsx`,
  `src/pages/Quiz.tsx`, `src/constants/topicRegistry.ts`
- Named media reviewed: `src/resources/boatparts.gif`,
  `src/resources/sailboat-explained.png`, `src/resources/sailboat.png`

## Verdict

**Needs targeted remediation before this can be considered a high-quality,
inclusive learning leaf.** The core activity is coherent and its 20-part,
four-choice discovery loop, scoring, reset, completion card, and quiz handoff
are internally consistent. The page is nevertheless unusable without a
pointing device, its persisted-state lifecycle can destroy or reject valid
returning progress, and the custom headsail drawing teaches a misleading
jib/forestay relationship.

The finding set is focused rather than a rejection of the whole experience:
the parent menu makes the leaf reachable, feedback is immediate, descriptions
are generally concise and appropriate for an introductory sailing-yacht
context, port/starboard orientation in the stern view is correct, and the
legacy onward route resolves to the canonical nautical-terms quiz topic.

## Evidence and exercised paths

### Reachability and navigation

- The parent menu at `/nautical-terms` exposes **Boat Parts** as a learn item
  and routes to `/nautical-terms/boat-parts`.
- The page's back control returns to `/nautical-terms`.
- Completion offers `/quiz/nautical-terms`. `Quiz.tsx` intentionally maps that
  legacy topic ID to `nautical-terms-quiz`, while the menu and topic registry
  use the canonical `/quiz/nautical-terms-quiz`. The handoff therefore works,
  though future changes should prefer the registry/canonical route.

### Diagram, labels, and discovery interaction

- The activity contains 15 side-view and 5 stern-view targets. Selecting an
  undiscovered marker changes it to guessing and presents four shuffled
  choices drawn from the same view.
- A correct first response awards 10 points; any later correct response awards
  5. Correct targets reveal their name and description and cannot be scored
  again. Wrong choices are visibly disabled for the current attempt and reveal
  corrective feedback.
- Reset returns all 20 entries, score, selection, and feedback to their initial
  state. Completion requires all 20 entries to be correct; the maximum is 200.
- The leader endpoints were compared with the generated SVG geometry. Most
  point to distinguishable features. The jib itself is drawn with a vertical
  luff beside the mast while the forestay runs diagonally to the bow, contrary
  to both the expected rig relationship and the source comment. This is a
  substantive visual-teaching defect, not cosmetic polish.
- The three named raster assets are not imported anywhere in application code.
  Visual inspection shows that they are heterogeneous references: a detailed
  labelled rigging GIF, a rendered multi-view hull-parts plate, and an
  unlabelled line drawing. None is currently learner-visible and none explains
  the active SVG's geometry. Their intended lifecycle needs an explicit
  decision alongside the diagram correction.

### Knowledge checks, completion, and persistence

- Choice distractors remain within the current view, preventing impossible
  side-versus-stern distractors. Shuffling and repeat protection are correct
  for the in-memory session.
- A mount with an authenticated learner can run the save effect with the fresh
  empty state before the asynchronous load resolves. The loaded payload is
  then accepted without validating part IDs, states, attempts, or score.
  Partial/stale data can make render-time `partProgress[part.id].state` reads
  fail. Load rejection is not handled inside `loadSavedProgress`.
- Completion is saved under the registered
  `nautical-terms-boat-parts` durable topic ID with score percentage and answer
  history. Reset consequently persists an intentional fresh state once the
  lifecycle race is corrected.

### Responsive, input, accessibility, and failure states

- The responsive grid stacks the two diagrams and option controls, and the
  option grid reduces to two columns. SVG `viewBox` scaling preserves the full
  drawing rather than clipping it.
- Side-view markers have a 30-unit visual diameter in a 600-unit-wide SVG. At
  common narrow phone content widths this is only about 16–19 CSS pixels; the
  stern markers are also below a robust touch target. No separate hit area is
  provided.
- All 20 markers are click-only SVG groups: no role, accessible name,
  `tabIndex`, or keyboard activation. A keyboard or screen-reader learner
  cannot enter the exercise. The back and close buttons are icon-only without
  accessible names, and the progress bar has no programmatic progress value.
- Color is supplemented by symbols and legend text for discovered states, but
  those state changes are not announced programmatically.
- The current focused component test passes and confirms reset does not write
  unrelated module IDs. It does not cover the main discovery flow,
  accessibility, hydration race, malformed data, completion, or navigation.

## Content-quality notes

The 20 terms are useful, common introductory yacht vocabulary. Descriptions
are short and mostly accurate for the particular fin-keel, tiller-steered
sloop being depicted. Statements such as the keel's weight keeping the boat
upright and the mainsail being the largest sail are configuration-dependent;
the surrounding diagram makes that scope reasonably inferable, but a future
content pass could name the depicted yacht type explicitly. No separate issue
was filed for that optional wording polish.

The stern view correctly states that port appears on the viewer's left when
looking forward from behind the boat, and uses the conventional red/green
association. “Back View (Helm)” is less precise than “stern view” but the
in-diagram explanation removes material ambiguity.

## Focused follow-up issues

- [#140 — Make Boat Parts diagram and controls keyboard- and screen-reader-accessible](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/140)
- [#141 — Harden Boat Parts saved-progress hydration and validation](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/141)
- [#142 — Correct the Boat Parts jib/forestay diagram and verify label geometry](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/142)
