import { badgeById, type BadgeDefinition } from "@/data/badges";

export type LearningActivity = "theory_completion" | "quiz_completion" | "review";

interface RpcClient {
  rpc(name: "record_learning_activity", args: { p_activity_type: LearningActivity }): PromiseLike<{
    data: readonly EngagementOutcome[] | EngagementOutcome | null;
    error: unknown;
  }>;
}

export interface EngagementOutcome {
  readonly current_streak: number;
  readonly bonus_points: number;
  readonly unlocked_badge_ids: readonly string[];
}

export const recordLearningActivity = async (
  client: RpcClient,
  activityType: LearningActivity,
): Promise<{ readonly streak: number; readonly bonusPoints: number; readonly unlockedBadges: readonly BadgeDefinition[] }> => {
  const { data, error } = await client.rpc("record_learning_activity", { p_activity_type: activityType });
  if (error) throw error;
  const outcome = Array.isArray(data) ? data[0] : data;
  if (!outcome) throw new Error("Engagement RPC returned no outcome");
  return {
    streak: outcome.current_streak,
    bonusPoints: outcome.bonus_points,
    unlockedBadges: outcome.unlocked_badge_ids
      .map((id) => badgeById.get(id))
      .filter((badge): badge is BadgeDefinition => Boolean(badge)),
  };
};
