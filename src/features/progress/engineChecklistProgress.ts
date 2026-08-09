import type { MaintenanceCheck } from "@/data/engineChecks";

export const ENGINE_CHECKLIST_PROGRESS_ID = "engine-checklist";
export const ENGINE_CHECKLIST_CATALOGUE_ID = "engine-maintenance-v1";
export const ENGINE_CHECKLIST_PROGRESS_VERSION = 1;
export const ANONYMOUS_ENGINE_CHECKLIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const ANONYMOUS_KEY = "engine-checklist-anonymous-v1";

export type EngineChecklistProgress = { checkedItemIds: string[]; revision: number };
export type EngineChecklistSaveState = "saved" | "queued" | "anonymous" | "conflict" | "failed";

export const engineChecklistSaveState = (result: "remote" | "queued" | "anonymous" | "conflict" | "failed"): EngineChecklistSaveState =>
  result === "remote" ? "saved" : result;

export const mergeEngineChecklistIds = (
  remoteIds: readonly string[], anonymousIds: readonly string[], catalogueOrder: readonly string[],
): string[] => {
  const selected = new Set([...remoteIds, ...anonymousIds]);
  return catalogueOrder.filter((id) => selected.has(id));
};

export const shouldClearAnonymousAfterMigration = (
  result: "remote" | "queued" | "conflict" | "failed",
  ownerAtStart: string,
  currentOwner: string | null,
): boolean => result === "remote" && currentOwner === ownerAtStart;

export const normalizeEngineCatalogue = (value: unknown): MaintenanceCheck[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter((item): item is MaintenanceCheck => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<MaintenanceCheck>;
    if (!candidate.id || !candidate.task || !candidate.description || !candidate.frequency
      || typeof candidate.id !== "string" || typeof candidate.task !== "string"
      || typeof candidate.description !== "string" || typeof candidate.frequency !== "string"
      || seen.has(candidate.id)) return false;
    seen.add(candidate.id);
    return true;
  }).map((item) => ({ ...item, checked: false }));
};

export const parseEngineChecklistProgress = (value: unknown, validIds: ReadonlySet<string>): EngineChecklistProgress | null => {
  if (typeof value === "string") { try { value = JSON.parse(value); } catch { return null; } }
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== ENGINE_CHECKLIST_PROGRESS_VERSION
    || candidate.catalogueId !== ENGINE_CHECKLIST_CATALOGUE_ID
    || !Array.isArray(candidate.checkedItemIds)
    || candidate.checkedItemIds.some((id) => typeof id !== "string")
    || !Number.isSafeInteger(candidate.revision) || (candidate.revision as number) < 0) return null;
  return { checkedItemIds: [...new Set(candidate.checkedItemIds as string[])].filter((id) => validIds.has(id)), revision: candidate.revision as number };
};

export const isEngineChecklistConflict = (error: unknown): boolean => {
  const candidate = error as { code?: string; message?: string };
  return candidate?.code === "40001" && Boolean(candidate.message?.includes("Engine checklist revision conflict"));
};

export const saveAnonymousEngineChecklist = (storage: Storage, checkedItemIds: string[], now = Date.now()): boolean => {
  try {
    storage.setItem(ANONYMOUS_KEY, JSON.stringify({ version: ENGINE_CHECKLIST_PROGRESS_VERSION, catalogueId: ENGINE_CHECKLIST_CATALOGUE_ID, checkedItemIds, revision: 0, expiresAt: now + ANONYMOUS_ENGINE_CHECKLIST_MAX_AGE_MS }));
    return true;
  } catch { return false; }
};

export const restoreAnonymousEngineChecklist = (storage: Storage, validIds: ReadonlySet<string>, now = Date.now()): EngineChecklistProgress | null => {
  let raw: string | null;
  try { raw = storage.getItem(ANONYMOUS_KEY); } catch { return null; }
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as { expiresAt?: unknown };
    if (typeof candidate.expiresAt !== "number" || candidate.expiresAt <= now) { storage.removeItem(ANONYMOUS_KEY); return null; }
    const parsed = parseEngineChecklistProgress(candidate, validIds);
    if (!parsed) storage.removeItem(ANONYMOUS_KEY);
    return parsed;
  } catch { try { storage.removeItem(ANONYMOUS_KEY); } catch { /* unavailable storage */ } return null; }
};

export const clearAnonymousEngineChecklist = (storage: Storage): void => { try { storage.removeItem(ANONYMOUS_KEY); } catch { /* unavailable storage */ } };
