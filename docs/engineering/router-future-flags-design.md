# Staff Designer — Router Future Flags Consistency

## Analyzer evidence
- Test runs emitted React Router v7 migration warnings from `tests/ChartsTheory.test.tsx` due to `BrowserRouter` without `future` flags.
- Runtime `src/App.tsx` also used `BrowserRouter` without centralized future config.

## Debt topic
Error-handling/tooling hygiene + architecture consistency:
- Repeated router config drift risk between app runtime and tests.
- Warning noise obscures genuine failures in CI output.

## Design
1. Add single source of truth: `src/app/routerFuture.ts` exporting `ROUTER_FUTURE`.
2. Apply in app shell: `<BrowserRouter future={ROUTER_FUTURE}>`.
3. Add `tests/TestRouter.tsx` wrapper to standardize test routing config.
4. Migrate direct `BrowserRouter` test usage to `TestRouter`.

## Risks
- React Router type compatibility for `FutureConfig`.
- Potential test behavior differences (none expected; same router type).

## Acceptance gates
- Lint/typecheck/tests pass.
- No direct `BrowserRouter` usage without future config in `src/` or `tests/`.
- Prior warning no longer appears in `ChartsTheory` test run.
