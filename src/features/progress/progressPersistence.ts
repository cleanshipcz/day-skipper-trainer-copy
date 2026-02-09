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

export const saveProgressRecord = async ({
  supabaseClient,
  userId,
  topicId,
  completed = false,
  score = 0,
  pointsEarned = 0,
  answersHistory,
}: SaveProgressRecordArgs) => {
  const progressData: {
    user_id: string;
    topic_id: string;
    completed: boolean;
    score: number;
    last_accessed: string;
    answers_history?: Record<string, unknown>;
  } = {
    user_id: userId,
    topic_id: topicId,
    completed,
    score,
    last_accessed: new Date().toISOString(),
  };

  if (answersHistory !== undefined) {
    progressData.answers_history = answersHistory;
  }

  const { error: progressError } = await supabaseClient.from("user_progress").upsert(progressData, {
    onConflict: "user_id,topic_id",
  });

  if (progressError) throw progressError;

  if (pointsEarned > 0) {
    const { error: pointsError } = await supabaseClient.rpc("increment_user_points", {
      p_user_id: userId,
      p_increment: pointsEarned,
    });

    if (pointsError) throw pointsError;
  }
};
