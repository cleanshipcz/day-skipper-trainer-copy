import type { RigCheck } from "@/data/rigChecks";

export const RIG_PROGRESS_ID = "rig-review";
export const RIG_PROGRESS_VERSION = 1;
export const RIG_CATALOGUE_ID = "rig-review-v1";
export const RIG_ANONYMOUS_KEY = "rig-review-anonymous-v1";

export type RigOutcome = "satisfactory" | "defect" | "unknown-na";
export type RigOutcomes = Record<string, RigOutcome>;

const outcomes = new Set<RigOutcome>(["satisfactory", "defect", "unknown-na"]);

export const normalizeRigCatalogue = (value: readonly RigCheck[]) => {
  const seen = new Set<string>();
  return value.filter((item) => {
    if (!item || !item.id.trim() || !item.area.trim() || !item.item.trim() || !item.lookFor.trim() || !item.boundary.trim() || seen.has(item.id)) return false;
    seen.add(item.id); return true;
  });
};

export const isValidRigCatalogue = (original: readonly RigCheck[], normalized = normalizeRigCatalogue(original)) =>
  original.length > 0 && normalized.length === original.length;

export const parseRigProgress = (value: unknown, validIds: ReadonlySet<string>): RigOutcomes | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== RIG_PROGRESS_VERSION || raw.catalogueId !== RIG_CATALOGUE_ID || !raw.outcomes || typeof raw.outcomes !== "object" || Array.isArray(raw.outcomes)) return null;
  const parsed: RigOutcomes = {};
  for (const [id, outcome] of Object.entries(raw.outcomes as Record<string, unknown>)) {
    if (!validIds.has(id) || !outcomes.has(outcome as RigOutcome)) return null;
    parsed[id] = outcome as RigOutcome;
  }
  return parsed;
};

export const rigProgressPayload = (outcomesById: RigOutcomes) => ({ version: RIG_PROGRESS_VERSION, catalogueId: RIG_CATALOGUE_ID, outcomes: outcomesById });
