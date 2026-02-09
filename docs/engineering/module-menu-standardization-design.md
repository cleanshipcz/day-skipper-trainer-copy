# Module Menu Standardization Design

## Context
The app has multiple module menu pages with near-identical card-grid behavior and repeated local interfaces:
- `src/pages/NavigationMenu.tsx`
- `src/pages/RulesOfTheRoadMenu.tsx`
- `src/pages/NauticalTermsMenu.tsx`
- `src/pages/LightsSignalsMenu.tsx`
- `src/pages/TidesMenu.tsx`

This duplication increases maintenance cost and introduces consistency drift risk (badge labels, CTA text, card styling, icon treatment, completion badge placement).

## 1) Debt Inventory (severity, impact, refs)

| Debt | Severity | Engineering impact | Evidence |
|---|---:|---|---|
| Repeated `SubModule` type definitions | Medium | Multiple update points for the same contract; risk of divergence | all five files above declare nearly identical `interface SubModule` |
| Repeated card rendering structure | High | Bug fixes/style updates require editing in many files; high regression risk | repeated `<Card>` subtree with gradient strip, icon badge, type badge, completion badge, CTA |
| Repeated type-to-label logic (`learn/quiz/practice`) | Medium | Inconsistent labels/CTAs likely over time | each page hardcodes badge + button text logic |
| Inconsistent semantic naming (`quiz` represented by `User` icon in one page) | Low | UX inconsistency and harder standards enforcement | `NavigationMenu.tsx` imports `User` for quiz badge although not reusable policy |

## 2) Target Standards

### Naming and boundaries
- Shared module menu primitives live in `src/components/module-menu/`.
- Page files own domain copy (title, intro, module dataset), not rendering mechanics.
- Shared type is `ModuleMenuItem`.

### Shared abstraction contract
- `ModuleMenuItem` fields: `id`, `title`, `description`, `icon`, `path`, `type`, `color`.
- Optional overrides for exceptional pages: `badgeLabel`, `buttonLabel`.
- `ModuleType` enum-like union: `"learn" | "quiz" | "practice"`.

### UI behavior standards
- One standard card layout with:
  - top gradient strip
  - icon tile
  - type badge
  - completion badge
  - consistent title/description and CTA location
- Standardized type presentation defaults:
  - learn → badge "Learn", CTA "Start Learning"
  - quiz → badge "Quiz", CTA "Take Quiz"
  - practice → badge "Practice", CTA "Start Practice"

## 3) Reusability Map

### Extract to shared
- `ModuleMenuGrid` component (card grid renderer)
- `moduleMenuMeta` defaults (`type` → badge/CTA)
- `ModuleMenuItem` + `ModuleType` contracts

### Keep in page scope
- Intro content/cards
- Header titles and back navigation destinations
- Module datasets (content-specific)

### Ownership boundary
- Shared behavior owned by UI platform layer (`components/module-menu`).
- Product/domain teams edit only module arrays and intro text in pages.

## 4) Tranche Plan (incremental, test-gated)

### Tranche 1 (highest value, low risk) — THIS PR
1. Add shared module-menu contracts + metadata resolver.
2. Add tests for type metadata defaults/override behavior.
3. Introduce `ModuleMenuGrid` and migrate five module menu pages.
4. Run lint, typecheck, and test suite.

### Tranche 2 (future)
- Add `ModuleMenuPageLayout` for shared header/intro chrome to reduce more duplication.
- Optional content config files for module arrays if editorial velocity increases.

## 5) Acceptance Gates + Rollback Strategy

### Acceptance gates
- All migrated pages compile with no TS errors.
- Tests cover metadata contract (`type` defaults and explicit overrides).
- Existing app routing behavior preserved (paths unchanged).
- Lint + typecheck + tests pass in CI/local.

### Rollback
- If regressions occur, rollback by reverting only `components/module-menu/*` introduction and page migrations.
- No data model/db migration involved; rollback is code-only and low-risk.

## 6) Team-Executable Implementation Guide

1. Create shared types + metadata defaults in `src/components/module-menu/`.
2. Add `moduleMenuMeta.test.ts` to lock expected label/CTA behavior.
3. Implement `ModuleMenuGrid` rendering the existing card pattern.
4. Replace per-page card map logic in all target menu pages with shared grid.
5. Keep all copy and route paths unchanged.
6. Validate with:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- --run`

## Customer / Reliability Value Mapping
- Faster, safer UI consistency fixes across module menus (single place change).
- Lower defect probability from drift in repeated patterns.
- Clearer contribution model for future module additions (data-first page edits).
