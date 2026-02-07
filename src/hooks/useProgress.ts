import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProgress = () => {
  const { user } = useAuth();

  const loadProgress = useCallback(
    async (topicId: string) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("topic_id", topicId)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error loading progress:", error);
        return null;
      }
    },
    [user]
  );

  interface ProgressData {
    user_id: string;
    topic_id: string;
    completed: boolean;
    score: number;
    last_accessed: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answers_history?: any;
  }

  const saveProgress = useCallback(
    async (
      topicId: string,
      completed: boolean = false,
      score: number = 0,
      pointsEarned: number = 0,
      answersHistory?: Record<string, unknown>
    ) => {
      if (!user) return;

      try {
        // Use upsert to handle both insert and update
        const progressData: ProgressData = {
          user_id: user.id,
          topic_id: topicId,
          completed,
          score,
          last_accessed: new Date().toISOString(),
        };

        if (answersHistory !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          progressData.answers_history = answersHistory as any;
        }

        await supabase.from("user_progress").upsert(progressData, {
          onConflict: "user_id,topic_id",
        });

        // Update user points if earned
        if (pointsEarned > 0) {
          const { data: profile } = await supabase.from("profiles").select("points").eq("user_id", user.id).single();

          if (profile) {
            await supabase
              .from("profiles")
              .update({ points: (profile.points || 0) + pointsEarned })
              .eq("user_id", user.id);

            toast.success(`+${pointsEarned} points earned!`);
          }
        }

        if (completed) {
          toast.success("Topic completed! 🎉");
        }
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    },
    [user]
  );

  const resetProgress = useCallback(
    async (topicId: string) => {
      if (!user) return;

      try {
        await supabase.from("user_progress").delete().eq("user_id", user.id).eq("topic_id", topicId);

        toast.success("Progress reset successfully");
      } catch (error) {
        console.error("Error resetting progress:", error);
        toast.error("Failed to reset progress");
      }
    },
    [user]
  );

  return { loadProgress, saveProgress, resetProgress };
};
