export const GAS_SAFETY_MASTERY_REVISION = "gas-safety-practice-v1" as const;
export const GAS_SAFETY_CRITICAL_SCENARIOS = ["lpg-leak", "co-alarm"] as const;
export type GasSafetyScenarioId = (typeof GAS_SAFETY_CRITICAL_SCENARIOS)[number];
/** Versioned evidence contract shared by the practice and lesson completion. */
export type GasSafetyMastery = { revision: typeof GAS_SAFETY_MASTERY_REVISION; masteredScenarioIds: readonly GasSafetyScenarioId[] };

export function isCurrentGasSafetyMastery(value: unknown): value is GasSafetyMastery {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { revision?: unknown; masteredScenarioIds?: unknown };
  return candidate.revision === GAS_SAFETY_MASTERY_REVISION
    && Array.isArray(candidate.masteredScenarioIds)
    && candidate.masteredScenarioIds.length === GAS_SAFETY_CRITICAL_SCENARIOS.length
    && GAS_SAFETY_CRITICAL_SCENARIOS.every((id) => candidate.masteredScenarioIds?.includes(id));
}
