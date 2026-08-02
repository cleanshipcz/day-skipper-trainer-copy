export const VICTUALLING_PROGRESS_VERSION = 1;

export const parseVictuallingProgress = (value: unknown, validIds: ReadonlySet<string>): string[] | null => {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  const candidate = value as { version?: unknown; checkedItemIds?: unknown };
  if (candidate.version !== VICTUALLING_PROGRESS_VERSION || !Array.isArray(candidate.checkedItemIds)) return null;
  if (candidate.checkedItemIds.some((id) => typeof id !== "string")) return null;
  return [...new Set(candidate.checkedItemIds)].filter((id) => validIds.has(id));
};
