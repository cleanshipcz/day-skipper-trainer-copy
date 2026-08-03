import type { SupabaseClient } from "@supabase/supabase-js";

interface SaveProgressRecordArgs {
  supabaseClient: SupabaseClient;
  userId: string;
  topicId: string;
  completed?: boolean;
  score?: number;
  pointsEarned?: number;
  answersHistory?: Record<string, unknown>;
}

interface DeleteProgressRecordArgs {
  supabaseClient: SupabaseClient;
  userId: string;
  topicId: string;
}

export const saveProgressRecord = async ({
  supabaseClient,
  userId,
  topicId,
  completed = false,
  score = 0,
  pointsEarned = 0,
  answersHistory,
}: SaveProgressRecordArgs): Promise<{ pointsAwarded: boolean; completionAwarded: boolean; awardedPoints: number }> => {
  // Authentication is enforced inside the RPC with auth.uid(). `userId` is
  // deliberately not sent to the database function and remains here only for
  // the separate RLS-scoped delete operation/API compatibility.
  void userId;
  const anchorworkIds = topicId === "anchorwork"
    ? (answersHistory as { completedTopicIds?: unknown } | undefined)?.completedTopicIds
    : null;
  if (topicId === "anchorwork" && (!Array.isArray(anchorworkIds) || anchorworkIds.some((id) => typeof id !== "string"))) {
    throw new Error("Anchorwork progress requires canonical completed topic IDs");
  }
  const { data, error } = topicId === "anchorwork"
    ? await supabaseClient.rpc("save_anchorwork_progress", { p_completed_topic_ids: anchorworkIds as string[] })
    : await supabaseClient.rpc("save_topic_progress", {
      p_topic_id: topicId,
      p_completed: completed,
      p_score: score,
      p_points: pointsEarned,
      p_answers_history: answersHistory ?? null,
    });
  if (error) throw error;
  const outcome = Array.isArray(data) ? data[0] : data;
  if (!outcome) throw new Error("Progress RPC returned no outcome");
  if (
    typeof outcome.points_awarded !== "boolean"
    || typeof outcome.completion_awarded !== "boolean"
    || typeof outcome.awarded_points !== "number"
    || !Number.isFinite(outcome.awarded_points)
  ) {
    throw new Error("Progress RPC returned an invalid outcome");
  }

  return {
    pointsAwarded: outcome.points_awarded,
    completionAwarded: outcome.completion_awarded,
    awardedPoints: outcome.awarded_points,
  };
};

export const deleteProgressRecord = async ({ supabaseClient, userId, topicId }: DeleteProgressRecordArgs) => {
  const { error } = await supabaseClient.from("user_progress").delete().eq("user_id", userId).eq("topic_id", topicId);

  if (error) throw error;
};
