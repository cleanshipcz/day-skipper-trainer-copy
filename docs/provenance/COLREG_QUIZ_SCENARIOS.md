# COLREG quiz scenario provenance

The Rules of the Road assessment uses structured HTML scenario cards authored
for this project, rather than third-party or generated image assets. The cards
were introduced for issue #223 and are stored with their questions in
`src/data/quizzes/colregs.ts`. They may be modified and distributed under the
repository's licence. No separate permission or attribution is required.

## Removed legacy assets

The nine files formerly under `public/images/colregs/` (`crossing`, `headon`,
`sailing`, and the six `quiz_*` files) had no recorded creator, source,
generation/edit history, licence, or permission. They were removed rather than
retained with unestablished rights. None of those raster composites is used by
the quiz or theory pages after this change.

## Modification and accessibility history

- 2026-08-09, issue #223: replaced the legacy raster scenarios with original,
  repository-native structured text equivalents.
- Assessment-relevant vessel identity, direction, relative side, navigation
  lights, measured angles, bearing trend, range trend, and encounter facts are
  ordinary text. They remain available when images, colour, CSS, or forced
  colour styling are unavailable.
- Visual grouping uses borders and text, not colour alone. The scenario is an
  accessible named figure with a question-specific description; its definition
  list remains readable and selectable by keyboard and assistive technology.
- The scenario data states observations only. It does not state the required
  manoeuvre or identify the correct answer.
