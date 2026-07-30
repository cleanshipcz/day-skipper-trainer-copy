import { badgeById, type BadgeDefinition } from "@/data/badges";

export type EngagementSource = "progress" | "quiz" | "review";
export interface EngagementEvidence {
  readonly sourceType: EngagementSource;
  readonly sourceId: string;
}
interface RpcClient {
  rpc(name: "sync_engagement_event", args: { p_source_type: EngagementSource; p_source_id: string }): PromiseLike<{
    data: EngagementOutcome | null;
    error: unknown;
  }>;
}
interface EngagementOutcome {
  readonly current_streak: number;
  readonly bonus_points: number;
  readonly unlocked_badge_ids: readonly string[];
}
export interface EngagementResult {
  readonly streak: number;
  readonly bonusPoints: number;
  readonly unlockedBadges: readonly BadgeDefinition[];
}

const outboxKey = (owner: string) => `engagement-outbox:${owner}`;
const readOutbox = (owner: string): readonly EngagementEvidence[] => {
  try {
    const value = JSON.parse(localStorage.getItem(outboxKey(owner)) ?? "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is EngagementEvidence =>
      Boolean(item && typeof item === "object" && "sourceType" in item && "sourceId" in item)) : [];
  } catch { return []; }
};
const writeOutbox = (owner: string, items: readonly EngagementEvidence[]) => {
  if (items.length === 0) localStorage.removeItem(outboxKey(owner));
  else localStorage.setItem(outboxKey(owner), JSON.stringify(items.slice(-100)));
};
const evidenceKey = ({ sourceType, sourceId }: EngagementEvidence) => `${sourceType}:${sourceId}`;
const ownerLocks = new Map<string, Promise<void>>();
const withOwnerLock = async <T>(owner: string, operation: () => Promise<T>): Promise<T> => {
  const previous = ownerLocks.get(owner) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  ownerLocks.set(owner, queued);
  await previous;
  try { return await operation(); }
  finally {
    release();
    if (ownerLocks.get(owner) === queued) ownerLocks.delete(owner);
  }
};

export const syncEngagementEvent = async (
  client: RpcClient, owner: string, evidence: EngagementEvidence,
): Promise<EngagementResult> => withOwnerLock(owner, async () => {
  const before = new Map(readOutbox(owner).map((item) => [evidenceKey(item), item]));
  before.set(evidenceKey(evidence), evidence);
  writeOutbox(owner, [...before.values()]);
  const { data, error } = await client.rpc("sync_engagement_event", {
    p_source_type: evidence.sourceType, p_source_id: evidence.sourceId,
  });
  if (error) throw error;
  if (!data) throw new Error("Engagement evidence returned no outcome");
  // Re-read after the await so a newer writer can never be erased by a stale snapshot.
  const after = new Map(readOutbox(owner).map((item) => [evidenceKey(item), item]));
  after.delete(evidenceKey(evidence));
  writeOutbox(owner, [...after.values()]);
  return { streak: data.current_streak, bonusPoints: data.bonus_points,
    unlockedBadges: data.unlocked_badge_ids.map((id) => badgeById.get(id))
      .filter((badge): badge is BadgeDefinition => Boolean(badge)) };
});

export const retryEngagementOutbox = async (
  client: RpcClient, owner: string,
): Promise<readonly EngagementResult[]> => {
  const results: EngagementResult[] = [];
  for (const evidence of readOutbox(owner)) results.push(await syncEngagementEvent(client, owner, evidence));
  return results;
};
