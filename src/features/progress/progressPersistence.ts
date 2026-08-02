import type { SupabaseClient } from "@supabase/supabase-js";
import { VICTUALLING_CHECKLIST_PROGRESS_ID, VICTUALLING_PROGRESS_VERSION } from "./victuallingProgress";

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
  const victuallingPayload = answersHistory as { version?: unknown; checkedItemIds?: unknown; revision?: unknown } | undefined;
  if (topicId === VICTUALLING_CHECKLIST_PROGRESS_ID && (
    completed || pointsEarned !== 0 || victuallingPayload?.version !== VICTUALLING_PROGRESS_VERSION
    || !Array.isArray(victuallingPayload.checkedItemIds)
    || victuallingPayload.checkedItemIds.some((id) => typeof id !== "string")
    || !Number.isSafeInteger(victuallingPayload.revision) || (victuallingPayload.revision as number) < 0
  )) throw new Error("Victualling checklist progress requires a valid revisioned snapshot");
  const { data, error } = topicId === "anchorwork"
    ? await supabaseClient.rpc("save_anchorwork_progress", { p_completed_topic_ids: anchorworkIds as string[] })
    : topicId === "anchorwork-practice"
      ? await supabaseClient.rpc("save_anchorwork_practice_progress", {
        p_completed: completed,
        p_score: score,
        p_answers_history: answersHistory ?? {},
      })
    : topicId === VICTUALLING_CHECKLIST_PROGRESS_ID
      ? await supabaseClient.rpc("save_victualling_checklist_progress", {
        p_expected_revision: victuallingPayload?.revision as number,
        p_checked_item_ids: victuallingPayload?.checkedItemIds as string[],
      })
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
