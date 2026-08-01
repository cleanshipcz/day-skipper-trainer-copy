type AnchorTopicIdentity = { readonly id: string };

export const ANCHOR_PROGRESS_VERSION = 1;

type AnchorProgress = {
  version: typeof ANCHOR_PROGRESS_VERSION;
  completedTopicIds: string[];
};

export const parseAnchorProgress = (
  value: unknown,
  catalogue: readonly AnchorTopicIdentity[],
): string[] | null => {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== "object" || catalogue.length === 0) return null;
  const ids = catalogue.map((topic) => topic.id);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) return null;
  const payload = value as Partial<AnchorProgress>;
  if (payload.version !== ANCHOR_PROGRESS_VERSION || !Array.isArray(payload.completedTopicIds)) return null;
  const validIds = new Set(ids);
  if (payload.completedTopicIds.some((id) => typeof id !== "string" || !validIds.has(id))) return null;
  return [...new Set(payload.completedTopicIds)];
};
