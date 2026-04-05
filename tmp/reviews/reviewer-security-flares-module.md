# Security Review: Flares Module (E1-S3)

## Findings

### Medium: Drill score saved under theory topic ID instead of a dedicated drill topic

**File:** `src/pages/FlaresTheory.tsx`, line 52

`handleDrillComplete` saves drill results to `TOPIC_IDS.SAFETY_FLARES` -- the same topic ID used by `handleMarkComplete` for theory completion. This means a drill score of e.g. 60% overwrites the theory's 100% score. The reference module (`FireSafetyTheory.tsx`, line 47) correctly uses a separate `TOPIC_IDS.SAFETY_FIRE_DRILL` for drill results. This is a data integrity issue, not directly exploitable, but it degrades progress accuracy and could allow a user to appear "completed" with a low score or vice versa.

**Remediation:** Register a `SAFETY_FLARES_DRILL` topic ID in the topic registry and use it in `handleDrillComplete`.

### Low: Potential division by zero in score calculation

**File:** `src/pages/FlaresTheory.tsx`, line 49

`result.correctCount / result.totalAnswered` will produce `NaN` if `totalAnswered` is 0. While unlikely under normal flow, a defensive guard is warranted since the value is persisted to the database.

**Remediation:** Guard with `const score = result.totalAnswered > 0 ? Math.round(...) : 0;`

## Summary

No critical or high-severity findings. No hardcoded secrets, no injection vectors, no unsafe user input handling. The data file (`flareTypes.ts`) is static, readonly, and strongly typed with `as const satisfies` -- good practice. The `useProgress` hook correctly gates all writes behind `user` authentication checks and uses the Supabase client (which enforces RLS server-side). The drill component handles user interaction purely through constrained button clicks against a fixed option set -- no free-text injection surface.

The one actionable finding is the shared topic ID between theory and drill progress, which deviates from the established pattern.

## Files Reviewed

- `/home/openclaw/Documents/Projects/day-skipper-trainer-copy/src/pages/FlaresTheory.tsx`
- `/home/openclaw/Documents/Projects/day-skipper-trainer-copy/src/components/safety/FlareIdentificationDrill.tsx`
- `/home/openclaw/Documents/Projects/day-skipper-trainer-copy/src/data/flareTypes.ts`
- `/home/openclaw/Documents/Projects/day-skipper-trainer-copy/src/hooks/useProgress.ts` (reference)
- `/home/openclaw/Documents/Projects/day-skipper-trainer-copy/src/pages/FireSafetyTheory.tsx` (reference)

## Recommendations

1. Register a dedicated `SAFETY_FLARES_DRILL` topic ID and use it for drill progress -- matching the Fire Safety module pattern.
2. Add a division-by-zero guard before persisting drill scores.
