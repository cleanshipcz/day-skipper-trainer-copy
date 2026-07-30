# Learning leaf functionality audit inventory

This inventory turns every terminal learning destination in the application/module
navigation tree into a reviewable GitHub issue draft. A **leaf** is a destination
at which the learner consumes theory, uses a practice tool, or takes an assessment.
Menu pages are branches, not leaves. An interactive component embedded in a leaf
page (for example the fire-extinguisher drill) is audited with that page rather
than counted again. Dynamic quiz topics are separate leaves because each presents
a different assessment even though they share `/quiz/:topicId`.

## How to create the issues

For each row below:

1. Use the value in **Issue title** as the GitHub issue title.
2. Use its **Context** paragraph followed by the **Shared audit request** below,
   without alteration, as the issue body.

That combination is the complete, ready-to-file issue draft. Keeping the common
request in one normative block makes later improvements to the audit rubric
reviewable without maintaining 52 divergent copies.

## Shared audit request

> Perform a rigorous learner-facing functionality and content-quality audit of
> the exact leaf identified above. Exercise the route from its parent navigation
> and inspect the named implementation/data files. Determine whether it
> effectively teaches or assesses its stated topic; whether all information,
> terminology, worked examples, calculations, procedures, and safety advice are
> correct, current, sufficiently complete, and high quality; whether its images,
> diagrams, icons, labels, and other visual media are correct, legible,
> appropriate, and high quality; and whether every interactive tool, drill,
> control, validation path, scoring rule, completion action, and persistence
> behavior is correct and high quality on relevant screen sizes and input
> methods. Check accessibility and failure/edge states where they affect the
> learning experience. Record concrete evidence and an overall quality verdict.
> For every distinct problem or worthwhile improvement discovered, create a
> focused follow-up GitHub issue with reproduction/context, learner impact,
> acceptance criteria, and the relevant paths; do not bundle implementation into
> this audit issue. Finish with links to all follow-up issues, or explicitly state
> that none were needed.

## Inventory and issue drafts

### Nautical terms

1. **Boat Parts**
   - Route/ID: `/nautical-terms/boat-parts` · `nautical-terms-boat-parts`
   - Issue title: `Audit functionality and content quality: Boat Parts`
   - Context: Audit **Boat Parts**, reached from **Nautical Terms & Boat Parts** at `/nautical-terms/boat-parts`. Start with `src/pages/NauticalTerms.tsx`, `src/resources/boatparts.gif`, `src/resources/sailboat-explained.png`, and `src/resources/sailboat.png`; include the page's diagram, labels, discovery interactions, embedded knowledge checks, completion, and onward quiz action.

2. **Sail Controls & Lines**
   - Route/ID: `/nautical-terms/sail-controls` · `nautical-terms-sail-controls`
   - Issue title: `Audit functionality and content quality: Sail Controls & Lines`
   - Context: Audit **Sail Controls & Lines**, reached from **Nautical Terms & Boat Parts** at `/nautical-terms/sail-controls`. Start with `src/pages/SailControls.tsx`; include every control/line explanation, visual, interactive reveal or check, completion behavior, and terminology consistency with Boat Parts.

3. **Full Nautical Terms Quiz**
   - Route/ID: `/quiz/nautical-terms-quiz` · `nautical-terms-quiz`
   - Issue title: `Audit functionality and content quality: Full Nautical Terms Quiz`
   - Context: Audit the **Full Nautical Terms Quiz** at `/quiz/nautical-terms-quiz`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/nauticalTerms.ts`, and `src/features/quiz/`; verify question coverage against both Nautical Terms leaves as well as answer accuracy, explanations, scoring, retry/completion, and persistence.

### Seamanship foundations

4. **Ropework & Knots**
   - Route/ID: `/ropework` · `ropework`
   - Issue title: `Audit functionality and content quality: Ropework & Knots`
   - Context: Audit **Ropework & Knots** at `/ropework`. Start with `src/pages/RopeworkTheory.tsx` and `src/data/ropeworkKnots.ts`; include all knot purposes, steps, visuals, discovery interactions, completion, and the link to its quiz.

5. **Ropework Quiz**
   - Route/ID: `/quiz/ropework` · `ropework`
   - Issue title: `Audit functionality and content quality: Ropework Quiz`
   - Context: Audit the **Ropework Quiz** at `/quiz/ropework`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/ropework.ts`, and `src/features/quiz/`; verify coverage of the taught knots, answer accuracy, explanations, scoring, retry/completion, and persistence.

6. **Anchorwork Theory**
   - Route/ID: `/anchorwork` · `anchorwork`
   - Issue title: `Audit functionality and content quality: Anchorwork Theory`
   - Context: Audit **Anchorwork Theory** at `/anchorwork`. Start with `src/pages/AnchorTheory.tsx` and `src/data/anchorTopics.ts`; include all anchoring procedures, scope guidance, visuals, calculations/examples, completion, and links to the minigame and quiz.

7. **Anchor Minigame**
   - Route/ID: `/anchor-minigame` · standalone practice route
   - Issue title: `Audit functionality and content quality: Anchor Minigame`
   - Context: Audit the **Anchor Minigame** at `/anchor-minigame`. Start with `src/pages/AnchorMinigame.tsx` and `src/pages/anchor-minigame/`; include geometry, scenario generation, drag/placement behavior, feedback, scoring/completion, responsive behavior, and consistency with Anchorwork Theory.

8. **Anchorwork Quiz**
   - Route/ID: `/quiz/anchorwork` · `anchorwork`
   - Issue title: `Audit functionality and content quality: Anchorwork Quiz`
   - Context: Audit the **Anchorwork Quiz** at `/quiz/anchorwork`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/anchorwork.ts`, and `src/features/quiz/`; verify theory coverage, numerical/safety accuracy, explanations, scoring, retry/completion, and persistence.

9. **Victualling (Provisioning)**
   - Route/ID: `/victualling` · `victualling`
   - Issue title: `Audit functionality and content quality: Victualling (Provisioning)`
   - Context: Audit **Victualling (Provisioning)** at `/victualling`. Start with `src/pages/VictuallingTheory.tsx` and `src/data/victuallingItems.ts`; include provisioning guidance, quantities/examples, storage and safety advice, interactions, completion, and its quiz link.

10. **Victualling Quiz**
    - Route/ID: `/quiz/victualling` · `victualling`
    - Issue title: `Audit functionality and content quality: Victualling Quiz`
    - Context: Audit the **Victualling Quiz** at `/quiz/victualling`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/victualling.ts`, and `src/features/quiz/`; verify taught-topic coverage, answer accuracy, explanations, scoring, retry/completion, and persistence.

11. **Engine Checks & Maintenance**
    - Route/ID: `/engine` · `engine`
    - Issue title: `Audit functionality and content quality: Engine Checks & Maintenance`
    - Context: Audit **Engine Checks & Maintenance** at `/engine`. Start with `src/pages/EngineTheory.tsx` and `src/data/engineChecks.ts`; include checks, maintenance/troubleshooting and safety advice, visuals, interactions, completion, and its quiz link.

12. **Engine Checks Quiz**
    - Route/ID: `/quiz/engine` · `engine`
    - Issue title: `Audit functionality and content quality: Engine Checks Quiz`
    - Context: Audit the **Engine Checks Quiz** at `/quiz/engine`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/engine.ts`, and `src/features/quiz/`; verify coverage, mechanical and safety accuracy, explanations, scoring, retry/completion, and persistence.

13. **Rig Checks & Preparation**
    - Route/ID: `/rig` · `rig`
    - Issue title: `Audit functionality and content quality: Rig Checks & Preparation`
    - Context: Audit **Rig Checks & Preparation** at `/rig`. Start with `src/pages/RigTheory.tsx` and `src/data/rigChecks.ts`; include standing/running rigging checks, preparation and safety advice, visuals, interactions, completion, and its quiz link.

14. **Rig Preparation Quiz**
    - Route/ID: `/quiz/rig` · `rig`
    - Issue title: `Audit functionality and content quality: Rig Preparation Quiz`
    - Context: Audit the **Rig Preparation Quiz** at `/quiz/rig`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/rig.ts`, and `src/features/quiz/`; verify coverage, terminology/safety accuracy, explanations, scoring, retry/completion, and persistence.

### Rules of the road

15. **Steering & Sailing Rules**
    - Route/ID: `/rules/colregs` · `colregs-theory`
    - Issue title: `Audit functionality and content quality: Steering & Sailing Rules`
    - Context: Audit **Steering & Sailing Rules** at `/rules/colregs`. Start with `src/pages/ColregTheory.tsx`; check the COLREG rule statements, scenarios, vessel responsibilities, diagrams/interactions, completion, and relationship to the Rules of the Road quiz.

16. **Comprehensive Lights & Signals Theory**
    - Route/ID: `/rules/lights/theory` · `lights-theory`
    - Issue title: `Audit functionality and content quality: Comprehensive Lights & Signals Theory`
    - Context: Audit **Comprehensive Lights & Signals Theory** at `/rules/lights/theory`. Start with `src/pages/LightsTheory.tsx`; check Parts C/D content, vessel lights, day shapes, sound/light signals, all visual representations and interactions, completion, and quiz link.

17. **Rules of the Road Quiz**
    - Route/ID: `/quiz/colregs` · `colregs`
    - Issue title: `Audit functionality and content quality: Rules of the Road Quiz`
    - Context: Audit the **Rules of the Road Quiz** at `/quiz/colregs`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/colregs.ts`, and `src/features/quiz/`; verify COLREG coverage, scenario/answer accuracy, explanations, scoring, retry/completion, and persistence.

18. **Lights & Signals Mastery Quiz**
    - Route/ID: `/quiz/lights-signals` · `lights-signals`
    - Issue title: `Audit functionality and content quality: Lights & Signals Mastery Quiz`
    - Context: Audit the **Lights & Signals Mastery Quiz** at `/quiz/lights-signals`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/lightsSignals.ts`, and `src/features/quiz/`; verify Parts C/D coverage, scenario/answer accuracy, explanations, scoring, retry/completion, and persistence.

### Navigation and tides

19. **The Chart**
    - Route/ID: `/navigation/charts` · `charts-theory`
    - Issue title: `Audit functionality and content quality: The Chart`
    - Context: Audit **The Chart** at `/navigation/charts`. Start with `src/pages/ChartsTheory.tsx`, `src/components/navigation/ChartSymbolQuiz.tsx`, `src/components/navigation/VirtualChartPlotter.tsx`, and `src/components/navigation/TidalVisualizer.tsx`; include theory, symbols/visuals, every embedded tool and challenge, and completion.

20. **The Compass**
    - Route/ID: `/navigation/compass` · `compass-theory`
    - Issue title: `Audit functionality and content quality: The Compass`
    - Context: Audit **The Compass** at `/navigation/compass`. Start with `src/pages/CompassTheory.tsx`, `src/components/navigation/CompassConverter.tsx`, and `src/components/navigation/DeviationDrill.tsx`; include True/Magnetic/Compass theory, CADET calculations, every drill path, feedback, and completion.

21. **Position Fixing**
    - Route/ID: `/navigation/position` · `position-theory`
    - Issue title: `Audit functionality and content quality: Position Fixing`
    - Context: Audit **Position Fixing** at `/navigation/position`. Start with `src/pages/PositionFixingTheory.tsx` and `src/components/navigation/FixSimulator.tsx`; include latitude/longitude and fixing theory, plotted examples, simulator behavior/geometry/feedback, visuals, and completion.

22. **Understanding Tides**
    - Route/ID: `/navigation/tides/theory` · `tides-theory`
    - Issue title: `Audit functionality and content quality: Understanding Tides`
    - Context: Audit **Understanding Tides** at `/navigation/tides/theory`. Start with `src/pages/TidalTheory.tsx`; include tide-generation concepts, terminology, diagrams/visuals, examples, interactions, and completion.

23. **Calculating Tidal Heights**
    - Route/ID: `/navigation/tides/heights-theory` · `tides-heights-theory`
    - Issue title: `Audit functionality and content quality: Calculating Tidal Heights`
    - Context: Audit **Calculating Tidal Heights** at `/navigation/tides/heights-theory`. Start with `src/pages/TidalHeightsTheory.tsx`; include tidal curves, Rule of Twelves, worked calculations, units/rounding, visuals, completion, and the calculator handoff.

24. **Tidal Height Calculator**
    - Route/ID: `/navigation/tides/heights-calc` · `tides-heights-calc`
    - Issue title: `Audit functionality and content quality: Tidal Height Calculator`
    - Context: Audit the **Tidal Height Calculator** at `/navigation/tides/heights-calc`. Start with `src/pages/TidalHeightsCalculator.tsx`; exercise all inputs, calculations, units, rounding, validation, generated practice, feedback, edge cases, responsive behavior, and completion.

25. **Course to Steer Theory**
    - Route/ID: `/navigation/tides/streams-theory` · `tides-streams-theory`
    - Issue title: `Audit functionality and content quality: Course to Steer Theory`
    - Context: Audit **Course to Steer Theory** at `/navigation/tides/streams-theory`. Start with `src/pages/TidalStreamsTheory.tsx`; include tidal-stream/vector concepts, worked plots and calculations, terminology, visuals, completion, and the Vector Solution Tool handoff.

26. **Vector Solution Tool**
    - Route/ID: `/navigation/tides/vector-tool` · `tides-vector-tool`
    - Issue title: `Audit functionality and content quality: Vector Solution Tool`
    - Context: Audit the **Vector Solution Tool** at `/navigation/tides/vector-tool`. Start with `src/pages/VectorTriangleTool.tsx` and `src/components/navigation/VectorTriangleVisualizer.tsx`; exercise solver and drill behavior, vector geometry, units, rounding, validation, feedback, touch/mobile interaction, and completion.

### Pilotage

27. **IALA Buoyage**
    - Route/ID: `/pilotage/buoyage` · `pilotage-buoyage`
    - Issue title: `Audit functionality and content quality: IALA Buoyage`
    - Context: Audit **IALA Buoyage** at `/pilotage/buoyage`. Start with `src/pages/BuoyageTheory.tsx`, `src/components/pilotage/BuoyIdentifier.tsx`, and `src/data/ialabuoys.ts`; include Region A theory, every buoy visual/characteristic/topmark/light, identifier interaction, feedback, and completion.

28. **Transits & Leading Lines**
    - Route/ID: `/pilotage/transits` · `pilotage-transits`
    - Issue title: `Audit functionality and content quality: Transits & Leading Lines`
    - Context: Audit **Transits & Leading Lines** at `/pilotage/transits`. Start with `src/pages/TransitsTheory.tsx`, `src/components/pilotage/TransitExercise.tsx`, and `src/components/pilotage/transitScenarios.ts`; include theory, diagrams, drag/alignment geometry, scenarios, touch/mobile behavior, feedback, and completion.

29. **Clearing Bearings**
    - Route/ID: `/pilotage/clearing-bearings` · `pilotage-clearing-bearings`
    - Issue title: `Audit functionality and content quality: Clearing Bearings`
    - Context: Audit **Clearing Bearings** at `/pilotage/clearing-bearings`. Start with `src/pages/ClearingBearingsTheory.tsx` and `src/components/pilotage/ClearingBearingTool.tsx`; include theory, chart/compass conventions, calculations, tool geometry/input/feedback, visuals, and completion.

30. **Pilotage Plan Builder**
    - Route/ID: `/pilotage/plan` · `pilotage-plan`
    - Issue title: `Audit functionality and content quality: Pilotage Plan Builder`
    - Context: Audit the **Pilotage Plan Builder** at `/pilotage/plan`. Start with `src/pages/PilotagePlan.tsx`, `src/components/pilotage/PilotagePlanBuilder.tsx`, and `src/components/pilotage/pilotagePlan.ts`; exercise every field, calculation, validation, add/edit/remove flow, persistence/output, edge state, and completion.

31. **Pilotage Quiz**
    - Route/ID: `/quiz/pilotage` · `pilotage`
    - Issue title: `Audit functionality and content quality: Pilotage Quiz`
    - Context: Audit the **Pilotage Quiz** at `/quiz/pilotage`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/pilotage.ts`, and `src/features/quiz/`; verify coverage of all four Pilotage leaves, answer accuracy, explanations, scoring, retry/completion, and persistence.

### Meteorology

32. **Weather Systems & Fronts**
    - Route/ID: `/weather/systems` · `weather-systems`
    - Issue title: `Audit functionality and content quality: Weather Systems & Fronts`
    - Context: Audit **Weather Systems & Fronts** at `/weather/systems`. Start with `src/pages/WeatherSystemsTheory.tsx`, `src/components/weather/WeatherTheoryLayout.tsx`, and `src/components/weather/SynopticChartReader.tsx`; include pressure/front/wind theory, chart visuals, reader interaction, feedback, and completion.

33. **Beaufort Scale**
    - Route/ID: `/weather/beaufort` · `weather-beaufort`
    - Issue title: `Audit functionality and content quality: Beaufort Scale`
    - Context: Audit **Beaufort Scale** at `/weather/beaufort`. Start with `src/pages/BeaufortTheory.tsx`, `src/components/weather/BeaufortDrill.tsx`, and `src/data/beaufortScale.ts`; verify every force, speed unit/range, sea-state description/visual, drill path, feedback, and completion.

34. **Marine Forecasts**
    - Route/ID: `/weather/forecasts` · `weather-forecasts`
    - Issue title: `Audit functionality and content quality: Marine Forecasts`
    - Context: Audit **Marine Forecasts** at `/weather/forecasts`. Start with `src/pages/WeatherForecastsTheory.tsx`, `src/components/weather/ForecastAreaMap.tsx`, and `src/data/forecastAreas.ts`; include forecast sources/format/interpretation, all area geography/labels, map interaction, feedback, and completion.

35. **Fog & Visibility**
    - Route/ID: `/weather/fog` · `weather-fog`
    - Issue title: `Audit functionality and content quality: Fog & Visibility`
    - Context: Audit **Fog & Visibility** at `/weather/fog`. Start with `src/pages/FogTheory.tsx` and `src/components/weather/WeatherTheoryLayout.tsx`; include fog formation/types, visibility and collision-avoidance actions, examples/visuals, interactions, and completion.

36. **Meteorology Quiz**
    - Route/ID: `/quiz/weather` · `weather`
    - Issue title: `Audit functionality and content quality: Meteorology Quiz`
    - Context: Audit the **Meteorology Quiz** at `/quiz/weather`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/weather.ts`, and `src/features/quiz/`; verify coverage of all four Meteorology leaves, answer accuracy, explanations, scoring, retry/completion, and persistence.

### Passage planning

37. **PREPARE a Passage**
    - Route/ID: `/passage-planning/prepare` · `passage-planning-prepare`
    - Issue title: `Audit functionality and content quality: PREPARE a Passage`
    - Context: Audit **PREPARE a Passage** at `/passage-planning/prepare`. Start with `src/pages/PrepareTheory.tsx` and `src/data/prepareSteps.ts`; verify the mnemonic and each step, considerations/examples/cross-links, completeness as a planning framework, interaction, and completion.

38. **Passage Calculator**
    - Route/ID: `/passage-planning/calculator` · `passage-planning-calculator`
    - Issue title: `Audit functionality and content quality: Passage Calculator`
    - Context: Audit the **Passage Calculator** at `/passage-planning/calculator`. Start with `src/pages/PassageCalculator.tsx`, `src/components/passagePlanning/FuelCalculator.tsx`, and `src/features/passagePlanning/calculations.ts`; exercise time/fuel/reserve/ETA inputs and outputs, formulas, units, rounding, validation, edge cases, and completion.

39. **Passage Plan Builder**
    - Route/ID: `/passage-planning/builder` · `passage-planning-builder`
    - Issue title: `Audit functionality and content quality: Passage Plan Builder`
    - Context: Audit the **Passage Plan Builder** at `/passage-planning/builder`. Start with `src/pages/PassagePlan.tsx`, `src/components/passagePlanning/PassagePlanBuilder.tsx`, and `src/features/passagePlanning/passagePlan.ts`; exercise every field and waypoint/leg operation, calculations, validation, persistence, print/output, edge states, and completion.

40. **Pre-departure Checklist**
    - Route/ID: `/passage-planning/checklist` · `passage-planning-checklist`
    - Issue title: `Audit functionality and content quality: Pre-departure Checklist`
    - Context: Audit the **Pre-departure Checklist** at `/passage-planning/checklist`. Start with `src/pages/PreDepartureChecklist.tsx` and `src/data/preDepartureChecklist.ts`; verify checklist completeness/order/safety guidance, every control/reset/completion path, persistence, responsive use aboard, and edge states.

41. **Passage Planning Quiz**
    - Route/ID: `/quiz/passage-planning` · `passage-planning`
    - Issue title: `Audit functionality and content quality: Passage Planning Quiz`
    - Context: Audit the **Passage Planning Quiz** at `/quiz/passage-planning`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/passagePlanning.ts`, and `src/features/quiz/`; verify coverage of all four Passage Planning leaves, calculations/answers, explanations, scoring, retry/completion, and persistence.

### Safety

42. **Man Overboard (MOB)**
    - Route/ID: `/safety/mob` · `safety-mob`
    - Issue title: `Audit functionality and content quality: Man Overboard (MOB)`
    - Context: Audit **Man Overboard (MOB)** at `/safety/mob`. Start with `src/pages/ManOverboardTheory.tsx` and `src/components/safety/MOBSortingGame.tsx`; include immediate actions, maneuvers, recovery/distress advice, visuals, ordering game and feedback, completion, and quiz link.

43. **Man Overboard Quiz**
    - Route/ID: `/quiz/safety-mob-quiz` · `safety-mob-quiz`
    - Issue title: `Audit functionality and content quality: Man Overboard Quiz`
    - Context: Audit the **Man Overboard Quiz** at `/quiz/safety-mob-quiz`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/safetyMob.ts`, and `src/features/quiz/`; verify procedure/safety coverage, answer accuracy, explanations, scoring, retry/completion, and persistence.

44. **Fire Safety**
    - Route/ID: `/safety/fire` · `safety-fire`
    - Issue title: `Audit functionality and content quality: Fire Safety`
    - Context: Audit **Fire Safety** at `/safety/fire`. Start with `src/pages/FireSafetyTheory.tsx`, `src/components/safety/FireExtinguisherDrill.tsx`, and `src/data/fireExtinguishers.ts`; include fire types/prevention/procedures, extinguisher suitability and visuals, the embedded drill, completion, and quiz link.

45. **Fire Safety Quiz**
    - Route/ID: `/quiz/safety-fire-quiz` · `safety-fire-quiz`
    - Issue title: `Audit functionality and content quality: Fire Safety Quiz`
    - Context: Audit the **Fire Safety Quiz** at `/quiz/safety-fire-quiz`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/safetyFire.ts`, and `src/features/quiz/`; verify fire/extinguisher/procedure coverage, safety accuracy, explanations, scoring, retry/completion, and persistence.

46. **Life Raft & Abandon Ship**
    - Route/ID: `/safety/life-raft` · `safety-life-raft`
    - Issue title: `Audit functionality and content quality: Life Raft & Abandon Ship`
    - Context: Audit **Life Raft & Abandon Ship** at `/safety/life-raft`. Start with `src/pages/LifeRaftTheory.tsx`, `src/components/safety/AbandonShipSortingGame.tsx`, and `src/data/lifeRaftProcedures.ts`; include equipment/deployment/boarding/survival advice, visuals, ordering game, completion, and quiz link.

47. **Life Raft & Abandon Ship Quiz**
    - Route/ID: `/quiz/safety-life-raft-quiz` · `safety-life-raft-quiz`
    - Issue title: `Audit functionality and content quality: Life Raft & Abandon Ship Quiz`
    - Context: Audit the **Life Raft & Abandon Ship Quiz** at `/quiz/safety-life-raft-quiz`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/safetyLifeRaft.ts`, and `src/features/quiz/`; verify procedure/equipment/survival coverage, safety accuracy, explanations, scoring, retry/completion, and persistence.

48. **Flares & Pyrotechnics**
    - Route/ID: `/safety/flares` · `safety-flares`
    - Issue title: `Audit functionality and content quality: Flares & Pyrotechnics`
    - Context: Audit **Flares & Pyrotechnics** at `/safety/flares`. Start with `src/pages/FlaresTheory.tsx`, `src/components/safety/FlareIdentificationDrill.tsx`, and `src/data/flareTypes.ts`; include types, identification, use/handling/disposal advice, every visual, drill behavior/feedback, completion, and quiz link.

49. **Flares & Pyrotechnics Quiz**
    - Route/ID: `/quiz/safety-flares-quiz` · `safety-flares-quiz`
    - Issue title: `Audit functionality and content quality: Flares & Pyrotechnics Quiz`
    - Context: Audit the **Flares & Pyrotechnics Quiz** at `/quiz/safety-flares-quiz`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/safetyFlares.ts`, and `src/features/quiz/`; verify identification/use/safety coverage, answer accuracy, explanations, scoring, retry/completion, and persistence.

50. **Personal Safety Equipment**
    - Route/ID: `/safety/personal` · `safety-personal`
    - Issue title: `Audit functionality and content quality: Personal Safety Equipment`
    - Context: Audit **Personal Safety Equipment** at `/safety/personal`. Start with `src/pages/PersonalSafetyTheory.tsx` and `src/data/personalSafetyEquipment.ts`; include lifejackets, harnesses/tethers/jacklines, kill cords and associated selection/use/maintenance advice, all visuals/interactions, and completion.

51. **Gas Safety**
    - Route/ID: `/safety/gas` · `safety-gas`
    - Issue title: `Audit functionality and content quality: Gas Safety`
    - Context: Audit **Gas Safety** at `/safety/gas`. Start with `src/pages/GasSafetyTheory.tsx` and `src/data/gasSafety.ts`; include LPG/CO properties and hazards, installation/isolation/detection/emergency guidance, all visuals/interactions, and completion.

52. **Comprehensive Safety Quiz**
    - Route/ID: `/quiz/safety` · `safety`
    - Issue title: `Audit functionality and content quality: Comprehensive Safety Quiz`
    - Context: Audit the **Comprehensive Safety Quiz** at `/quiz/safety`. Start with `src/pages/Quiz.tsx`, `src/data/quizzes/index.ts`, `src/data/quizzes/safety.ts`, and `src/features/quiz/`; verify balanced coverage of all six Safety leaves, answer/safety accuracy, explanations, scoring, retry/completion, and persistence.

## Completeness validation

The count is reproducible from three independently useful definitions:

- `src/app/routes.tsx` registers 52 route patterns: 1 dashboard, 1 auth,
  1 not-found route, 9 branch/menu routes, 1 dynamic quiz route, 36 terminal
  non-quiz learning routes, 2 exam routes, and 1 review route. The 36 learning routes include
  `/anchor-minigame`; menu routes are `/nautical-terms`,
  `/rules-of-the-road`, `/rules/lights`, `/navigation`,
  `/navigation/tides`, `/pilotage`, `/weather`, `/passage-planning`, and
  `/safety`.
- `src/data/quizzes/index.ts` declares 16 valid dynamic quiz topic IDs.
  Replacing the single route pattern `/quiz/:topicId` with those 16 actual
  assessment destinations gives **36 + 16 = 52** learning leaves.
- The root dashboard comes from `getRootTopics()` in
  `src/constants/topicRegistry.ts`. Its module menus are defined in the nine
  `src/pages/*Menu.tsx` files listed above. Searching those files for
  `path:` accounts for every nested menu edge, while searches for
  `navigate("/quiz/` in leaf pages account for quizzes linked from within
  theory pages rather than displayed as menu cards.

Commands used for a repeatable check:

```sh
rg -n 'defineRoute\\(\\{ path:' src/app/routes.tsx
rg -n 'path:' src/pages/*Menu.tsx
rg -n 'navigate\\(\"/quiz/' src/pages src/components
sed -n '/export const topicIds = \\[/,/\\] as const;/p' src/data/quizzes/index.ts
```

The 52 inventory entries break down as 36 theory/practice leaves and 16
quiz leaves. The 36 are: 2 Nautical Terms, 6 standalone Seamanship
foundations (including the Anchor Minigame), 2 Rules/Lights theory, 8
Navigation/Tides, 4 Pilotage, 4 Meteorology, 4 Passage Planning, and 6
Safety.

### Deliberate scope boundaries

- Embedded tools/drills are explicitly named in their host issue context and
  are not duplicated as separate leaf issues.
- `/exam`, `/exam/history`, and `/review` are cross-topic study utilities,
  not leaves in the syllabus/module tree. They should receive product-level
  audits separately if issue #84 is expanded beyond module leaves.
- `/auth`, `/`, menu routes, and `*` are application shell, navigation, or
  error states rather than learning leaves.
- `src/constants/topicRegistry.ts` currently omits several real nested
  Tides destinations and models embedded Safety drills as child topic IDs.
  Therefore registry `submoduleIds.length === 0` alone is not a reliable
  leaf count; registered routes, menu edges, quiz catalogue entries, and
  in-page quiz links were cross-checked instead.
