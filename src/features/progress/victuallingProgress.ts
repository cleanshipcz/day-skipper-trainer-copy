export const VICTUALLING_PROGRESS_VERSION = 1;
export const VICTUALLING_CHECKLIST_PROGRESS_ID = "victualling-checklist";

export type VictuallingProgress = { checkedItemIds: string[]; revision: number };

export const parseVictuallingProgress = (value: unknown, validIds: ReadonlySet<string>): VictuallingProgress | null => {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  const candidate = value as { version?: unknown; checkedItemIds?: unknown; revision?: unknown };
  if (candidate.version !== VICTUALLING_PROGRESS_VERSION || !Array.isArray(candidate.checkedItemIds)) return null;
  if (candidate.checkedItemIds.some((id) => typeof id !== "string")) return null;
  if (!Number.isSafeInteger(candidate.revision) || (candidate.revision as number) < 0) return null;
  return {
    checkedItemIds: [...new Set(candidate.checkedItemIds)].filter((id) => validIds.has(id)),
    revision: candidate.revision as number,
  };
};
