# Module Menu Intro Card Standardization (PR6)

## Analyzer Findings
- `src/pages/RulesOfTheRoadMenu.tsx`, `NavigationMenu.tsx`, `NauticalTermsMenu.tsx`, and `TidesMenu.tsx` duplicated the same intro card shell (same card frame + icon bubble + heading + description body).
- `src/pages/LightsSignalsMenu.tsx` still bypassed the shared `ModuleMenuPage` shell and rendered equivalent header/main layout manually.

## Staff-Designer Plan
1. Introduce shared `ModuleMenuIntroCard` component under `src/components/module-menu/`.
2. Add contract tests for default structure and class override hooks.
3. Migrate all duplicated intro cards to the shared component.
4. Migrate `LightsSignalsMenu` to `ModuleMenuPage` while preserving unique 2-column intro + key-topics card.

## Acceptance Gates
- Zero functional route/path changes.
- Intro card visual contract remains consistent for existing module pages.
- `LightsSignalsMenu` uses shared page shell APIs (`ModuleMenuPage`) only.
- `npm run lint`, `npm run typecheck`, `npm test -- --run` pass.

## Risk + Mitigation
- **Risk:** CSS regressions in page-specific color variants.
  - **Mitigation:** expose `className`, `iconContainerClassName`, `iconClassName` for controlled overrides and cover by tests.
