import type { AnchorScenarioFamily } from "@/pages/anchor-minigame/state";

export const ANCHOR_MINIGAME_PROGRESS_VERSION = 1;
export const ANCHOR_MINIGAME_TOPIC_ID = "anchorwork-practice";
export const ANCHOR_SCENARIO_FAMILIES: AnchorScenarioFamily[] = ["sheltered", "harbour", "exposed", "tidal"];

export interface AnchorMinigameProgress {
  version: 1;
  completedFamilies: AnchorScenarioFamily[];
  attempts: number;
  failedChecks: number;
  scenarioSeed: number;
  sequenceIndex: number;
  scenarioIdentity: string;
}

export const parseAnchorMinigameProgress = (value: unknown): AnchorMinigameProgress | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<AnchorMinigameProgress>;
  if (candidate.version !== ANCHOR_MINIGAME_PROGRESS_VERSION
    || !Array.isArray(candidate.completedFamilies)
    || candidate.completedFamilies.some((family) => !ANCHOR_SCENARIO_FAMILIES.includes(family))
    || new Set(candidate.completedFamilies).size !== candidate.completedFamilies.length
    || !Number.isSafeInteger(candidate.attempts) || (candidate.attempts ?? -1) < 0
    || !Number.isSafeInteger(candidate.failedChecks) || (candidate.failedChecks ?? -1) < 0
    || (candidate.failedChecks ?? 0) > (candidate.attempts ?? 0)
    || !Number.isSafeInteger(candidate.scenarioSeed) || (candidate.scenarioSeed ?? -1) < 0
    || !Number.isSafeInteger(candidate.sequenceIndex) || (candidate.sequenceIndex ?? -1) < 0
    || typeof candidate.scenarioIdentity !== "string") return null;
  return candidate as AnchorMinigameProgress;
};
