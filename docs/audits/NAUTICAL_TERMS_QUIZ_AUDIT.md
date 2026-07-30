# Full Nautical Terms Quiz learner-facing audit

- Audit issue: [#89](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/89)
- Route/topic: `/quiz/nautical-terms-quiz` / `nautical-terms-quiz`
- Audited: 2026-07-30
- Primary implementation: `src/pages/Quiz.tsx`
- Question catalogue: `src/data/quizzes/index.ts`,
  `src/data/quizzes/nauticalTerms.ts`
- Quiz services: `src/features/quiz/`
- Parent and registry: `src/pages/NauticalTermsMenu.tsx`,
  `src/constants/topicRegistry.ts`

## Verdict

**The quiz can complete, but its current live score makes it unsuitable as a
trustworthy assessment.** A clean anonymous Chromium run reached the route
from its parent, answered all 20 shuffled questions, showed every explanation,
calculated 100%, and completed cleanly at all required viewport widths.
However, tentative option selection is included in the visible score before
Submit locks the answer. A learner can cycle the four choices and use the score
increment as an answer oracle on every question. Pass threshold, retry setup,
catalogue failure UI, canonical progress keys, and authenticated save retry
logic are otherwise thoughtfully separated and substantially tested.

The “Full” bank nevertheless contains only Boat Parts material and no Sail
Controls questions. Several explanations overstate one common yacht
configuration as a definition. Persisted answers are unstable option indices,
the shared shell omits important selection/progress/focus semantics, and both
Back and completion leave the known parent for global Home.

## Evidence and exercised paths

### Runtime method and scope

The production build was served locally with placeholder local Supabase
configuration (no credentials and no live backend) and exercised in a clean
headless Chromium profile through the Chrome DevTools Protocol. The audit used
real clicks, the dynamically imported production question chunk, its actual
seeded shuffle, every submit/next transition, explanations, and completion.

Observed results:

- `/nautical-terms` rendered the **Full Nautical Terms Quiz** card and its
  “20-question challenge across every boat part and orientation term”
  description. **Take Quiz** navigated to
  `/quiz/nautical-terms-quiz`.
- At 375, 768, and 1280 CSS px there was 0 px document-level horizontal
  overflow. The sticky header measured 375×125, 768×105, and 1280×105 px;
  the main region was 375, 768, and 768 px wide respectively.
- The initial state rendered four answer buttons and disabled **Submit
  Answer** until selection. The Back button had no text or accessible name.
  The runtime progressbar exposed neither an accessible label nor
  `aria-valuenow`.
- All 20 shuffled questions accepted their catalogue-defined correct option.
  Each submission rendered **Explanation** before advancing.
- Completion rendered **Quiz Complete!**, **100%**, **20 out of 20 correct**,
  **Home**, and **Retry Quiz**.

An authenticated Supabase round-trip, mid-session reload, rejected dynamic
import, and offline recovery were not exercised against a real backend.
Persistence and failure findings below are based on direct inspection of
`Quiz.tsx`, the quiz service helpers, and their focused tests. The runtime did
exercise only the anonymous completion branch. The pre-submit answer oracle
was confirmed from the concrete render path: `handleAnswerSelect` immediately
writes the tentative index into `answers`; `correctAnswers` immediately calls
`countCorrectAnswers(answers, questions)`; and the header renders that value as
**Score** while all options remain enabled until `handleSubmit` sets
`showExplanation`.

### Coverage and content

`nauticalTerms.ts` contains exactly 20 stable question IDs. They assess the
Boat Parts set: orientation, hull/deck/keel/rudder/tiller, spars and sails,
standing rigging, telltales, and cockpit. They do not assess any of the 12
Sail Controls entries. A learner can therefore pass the “Full” parent quiz
without demonstrating knowledge of halyards, sheets, vang, outhaul,
Cunningham, topping lift, reefing controls, traveller, fairlead, or backstay
adjustment.

Most answers are concise and have one clearly intended choice. Configuration
dependent explanations need revision:

- A keel is defined as a heavy underwater fin that keeps the boat upright,
  conflating one common fin-keel form, lateral resistance, and ballast
  stability.
- The stern is said to house the rudder and helm area.
- The boom is said to hold/support the mainsail foot despite common
  loose-footed sails.
- The mainsail is said to provide most driving force.
- Forestay and backstay definitions assume masthead-to-bow/stern geometry.

These are reasonable descriptions of the pages' depicted sloop, but the
questions present them as general definitions rather than diagram-specific
observations.

### Scoring, navigation, retry, and failure states

- Correct count compares each stored answer with the shuffled question's
  remapped correct index. Percentage is rounded, passing is 70% or higher,
  and client-scored quizzes intentionally award zero profile points.
- Correctness is calculated too early. Selecting an option immediately changes
  `answers` and therefore the visible score, while the learner remains free to
  select another option. Cycling choices until the score increments reveals
  the correct answer before submission and invalidates the resulting score.
- Previous is available only before submitting the current answer. Submit
  locks the options, reveals correct/incorrect styling and explanation, and
  Next persists the new question index. Retry clears the session, increments
  the shuffle seed, and requests a new server attempt when authenticated.
- Unknown, empty, and rejected catalogues have an explicit unavailable card;
  rejected imports can be retried and the catalogue cache evicts failures.
- Both active Back and completed Home navigate to `/`, although the quiz was
  entered from `/nautical-terms`. The unavailable branch alone provides a
  parent-specific Nautical Terms action.

### Persistence and edge behavior

- Authenticated in-progress state saves under the canonical
  `quiz-nautical-terms-quiz` key. A legacy topic record can be migrated and
  reset. Completed records are not resumed as editable sessions.
- Server attempt creation, score submission, final progress, engagement, and
  spaced-review seeding have separate recovery behavior. A score submitted
  before final progress is retained locally so completion save can be retried
  without submitting the score twice.
- The session payload stores question position and option indices only.
  `parseSavedQuizSession` accepts any finite answer value, including negative,
  fractional, or out-of-range numbers. It cannot detect option/question
  reorder, so catalogue evolution can reinterpret old answers or hydrate a
  contradictory selection.

### Keyboard and accessibility

Answer options and action controls are native buttons and can be activated
from a keyboard. Correct/incorrect states also use icons and text, not color
alone. Remaining gaps affect orientation through the multi-step task:

- Back is icon-only and unnamed.
- Answer selection is visual only; no radio/selected/pressed state is exposed.
- Progress lacks an observed numeric value and label.
- Explanation insertion has no dedicated status/live semantics.
- Next replaces the focused control without intentionally focusing the next
  question, and completion focus is not managed.

## Focused follow-up issues

- [#152 — Cover Sail Controls content in the Full Nautical Terms Quiz](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/152)
- [#153 — Correct configuration-dependent claims in Nautical Terms quiz answers](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/153)
- [#154 — Restore quiz focus and expose answer/progress state accessibly](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/154)
- [#155 — Return topic quizzes to their parent module instead of global Home](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/155)
- [#156 — Validate persisted quiz answers against stable question and option identities](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/156)
- [#157 — Do not reveal quiz correctness through the live score before submission](https://github.com/cleanshipcz/day-skipper-trainer-copy/issues/157)
