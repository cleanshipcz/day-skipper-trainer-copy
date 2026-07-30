import { useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteProgressRecord, saveProgressRecord } from "@/features/progress/progressPersistence";
import type { Tables } from "@/integrations/supabase/types";
import { syncEngagementEvent } from "@/features/engagement/engagementService";

type UserProgressRow = Tables<"user_progress">;

export const useProgress = () => {
  const { user } = useAuth();
  const ownerRef = useRef(user?.id ?? null);
  ownerRef.current = user?.id ?? null;

  const loadProgress = useCallback(
    async (topicId: string): Promise<UserProgressRow | null> => {
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

  const saveProgress = useCallback(
    async (
      topicId: string,
      completed: boolean = false,
      score: number = 0,
      pointsEarned: number = 0,
      answersHistory?: Record<string, unknown>
    ) => {
      if (!user) return false;

      try {
        const { pointsAwarded, completionAwarded, awardedPoints } = await saveProgressRecord({
          supabaseClient: supabase,
          userId: user.id,
          topicId,
          completed,
          score,
          pointsEarned,
          answersHistory,
        });

        if (pointsAwarded) {
          toast.success(`+${awardedPoints} points earned!`);
        }

        if (completionAwarded) {
          toast.success("Topic completed! 🎉");
        }
        if (completed) {
          try {
            if (ownerRef.current !== user.id) return true;
            const engagement = await syncEngagementEvent(supabase, user.id, { sourceType: "progress", sourceId: topicId });
            if (ownerRef.current !== user.id) return true;
            engagement.unlockedBadges.forEach((badge) => {
              toast.success(`${badge.icon} Badge unlocked: ${badge.name}`);
            });
          } catch (error) {
            console.error("Error recording learning activity:", error);
          }
        }
        return true;
      } catch (error) {
        console.error("Error saving progress:", error);
        toast.error("Failed to save progress");
        return false;
      }
    },
    [user]
  );

  const resetProgress = useCallback(
    async (topicId: string) => {
      if (!user) return;

      try {
        await deleteProgressRecord({
          supabaseClient: supabase,
          userId: user.id,
          topicId,
        });

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
