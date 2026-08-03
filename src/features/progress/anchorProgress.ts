type AnchorTopicIdentity = { readonly id: string };
type AnchorTopicCatalogueItem = AnchorTopicIdentity & { readonly tips: readonly string[] };

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

export const isValidAnchorCatalogue = (catalogue: readonly AnchorTopicCatalogueItem[]): boolean => {
  if (catalogue.length === 0) return false;
  const ids = catalogue.map((topic) => topic.id);
  return ids.every((id) => typeof id === "string" && id.trim().length > 0)
    && new Set(ids).size === ids.length
    && catalogue.every((topic) =>
      Array.isArray(topic.tips)
      && topic.tips.length > 0
      && topic.tips.every((tip) => typeof tip === "string" && tip.trim().length > 0));
};
