export const GAS_SAFETY_MASTERY_REVISION = "gas-safety-practice-v1" as const;
export const GAS_SAFETY_CRITICAL_SCENARIOS = ["lpg-leak", "co-alarm"] as const;
export type GasSafetyScenarioId = (typeof GAS_SAFETY_CRITICAL_SCENARIOS)[number];
/** Ephemeral evidence contract for later persistence/completion work. */
export type GasSafetyMastery = { revision: typeof GAS_SAFETY_MASTERY_REVISION; masteredScenarioIds: readonly GasSafetyScenarioId[] };
