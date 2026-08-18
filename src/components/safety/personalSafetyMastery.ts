export const PERSONAL_SAFETY_CHECK_REVISION = "personal-safety-practical-v2" as const;
export const PERSONAL_SAFETY_SCENARIO_IDS = ["pfd", "fit", "tether", "kill-cord", "beacon"] as const;

export type PersonalSafetyMastery = {
  revision: typeof PERSONAL_SAFETY_CHECK_REVISION;
  masteredScenarioIds: string[];
};

export function isCurrentPersonalSafetyMastery(value: unknown): value is PersonalSafetyMastery {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { revision?: unknown; masteredScenarioIds?: unknown };
  return candidate.revision === PERSONAL_SAFETY_CHECK_REVISION
    && Array.isArray(candidate.masteredScenarioIds)
    && candidate.masteredScenarioIds.length === PERSONAL_SAFETY_SCENARIO_IDS.length
    && PERSONAL_SAFETY_SCENARIO_IDS.every((id) => candidate.masteredScenarioIds?.includes(id));
}
