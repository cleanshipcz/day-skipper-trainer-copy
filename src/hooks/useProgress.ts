import { useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthHooks";
import { toast } from "sonner";
import { deleteProgressRecord, saveProgressRecord } from "@/features/progress/progressPersistence";
import type { Tables } from "@/integrations/supabase/types";
import { syncEngagementEvent } from "@/features/engagement/engagementService";
import { isRetryableProgressError, queueProgress } from "@/features/offline/progressQueue";
import { loadProgressClient } from "@/features/progress/progressClient";
import { isVictuallingChecklistConflict, VICTUALLING_CHECKLIST_PROGRESS_ID } from "@/features/progress/victuallingProgress";
import { ENGINE_CHECKLIST_PROGRESS_ID, isEngineChecklistConflict } from "@/features/progress/engineChecklistProgress";

type UserProgressRow = Tables<"user_progress">;

export type ProgressSaveResult = "anonymous" | "remote" | "queued" | "conflict" | "failed";
export type ProgressLoadResult =
  | { status: "remote"; record: UserProgressRow }
  | { status: "missing" | "anonymous" | "failed"; record: null };

export const useProgress = () => {
  const { user } = useAuth();
  const ownerRef = useRef(user?.id ?? null);
  ownerRef.current = user?.id ?? null;

  const loadProgressDetailed = useCallback(
    async (topicId: string): Promise<ProgressLoadResult> => {
      if (!user) return { status: "anonymous", record: null };

      try {
        const supabase = await loadProgressClient();
        if (ownerRef.current !== user.id) return { status: "failed", record: null };
        if (topicId === "passage-planning-checklist") {
          const { error: cleanupError } = await supabase.rpc("expire_readiness_record_progress");
          if (cleanupError) throw cleanupError;
        }
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("topic_id", topicId)
          .maybeSingle();

        if (ownerRef.current !== user.id) return { status: "failed", record: null };
        if (error) throw error;
        return data ? { status: "remote", record: data } : { status: "missing", record: null };
      } catch (error) {
        if (ownerRef.current !== user.id) return { status: "failed", record: null };
        console.error("Error loading progress:", error);
        return { status: "failed", record: null };
      }
    },
    [user]
  );

  const loadProgress = useCallback(
    async (topicId: string): Promise<UserProgressRow | null> => {
      const result = await loadProgressDetailed(topicId);
      return result.record;
    },
    [loadProgressDetailed]
  );

  const saveProgressDetailed = useCallback(
    async (
      topicId: string,
      completed: boolean = false,
      score: number = 0,
      pointsEarned: number = 0,
      answersHistory?: Record<string, unknown>
    ) => {
      if (!user) return "anonymous" as const;
      if (ownerRef.current !== user.id) return "failed" as const;

      try {
        const supabase = await loadProgressClient();
        if (ownerRef.current !== user.id) return "failed" as const;
        const { pointsAwarded, completionAwarded, awardedPoints } = await saveProgressRecord({
          supabaseClient: supabase,
          userId: user.id,
          topicId,
          completed,
          score,
          pointsEarned,
          answersHistory,
        });
        if (ownerRef.current !== user.id) return "failed" as const;

        if (pointsAwarded) {
          toast.success(`+${awardedPoints} points earned!`);
        }

        if (completionAwarded) {
          toast.success("Topic completed! 🎉");
        }
        if (completed) {
          try {
            if (ownerRef.current !== user.id) return "remote" as const;
            const engagement = await syncEngagementEvent(supabase, user.id, { sourceType: "progress", sourceId: topicId });
            if (ownerRef.current !== user.id) return "remote" as const;
            engagement.unlockedBadges.forEach((badge) => {
              toast.success(`${badge.icon} Badge unlocked: ${badge.name}`);
            });
          } catch (error) {
            console.error("Error recording learning activity:", error);
          }
        }
        return "remote" as const;
      } catch (error) {
        if (ownerRef.current !== user.id) return "failed" as const;
        console.error("Error saving progress:", error);
        if (
          topicId === VICTUALLING_CHECKLIST_PROGRESS_ID
          && isVictuallingChecklistConflict(error)
        ) return "conflict" as const;
        if (topicId === ENGINE_CHECKLIST_PROGRESS_ID && isEngineChecklistConflict(error)) return "conflict" as const;
        if (topicId === "passage-planning-builder") {
          const candidate=error as {code?:string;message?:string};
          if(candidate?.code==="40001"&&candidate.message?.includes("Passage plan revision conflict"))return "conflict" as const;
        }
        if (!isRetryableProgressError(error)) {
          toast.error("Failed to save progress");
          return "failed" as const;
        }
        try {
          if (ownerRef.current !== user.id) return "failed" as const;
          await queueProgress({ userId: user.id, topicId, completed, score, pointsEarned, answersHistory });
          if (ownerRef.current !== user.id) return "failed" as const;
          toast.info("Progress saved offline and will sync when you reconnect.");
          return "queued" as const;
        } catch (queueError) {
          if (ownerRef.current !== user.id) return "failed" as const;
          console.error("Error queueing progress:", queueError);
          toast.error("Failed to save progress");
          return "failed" as const;
        }
      }
    },
    [user]
  );

  // Keep the long-standing boolean contract for existing consumers while
  // allowing leaves that expose durable state to distinguish queueing from a
  // confirmed server write.
  const saveProgress = useCallback(
    async (...args: Parameters<typeof saveProgressDetailed>) => {
      const result = await saveProgressDetailed(...args);
      return result === "remote" || result === "queued";
    },
    [saveProgressDetailed]
  );

  const resetProgress = useCallback(
    async (topicId: string) => {
      if (!user) return;

      try {
        const supabase = await loadProgressClient();
        if (ownerRef.current !== user.id) return;
        await deleteProgressRecord({
          supabaseClient: supabase,
          userId: user.id,
          topicId,
        });

        if (ownerRef.current === user.id) toast.success("Progress reset successfully");
      } catch (error) {
        if (ownerRef.current !== user.id) return;
        console.error("Error resetting progress:", error);
        toast.error("Failed to reset progress");
      }
    },
    [user]
  );

  return { ownerId: user?.id ?? null, loadProgress, loadProgressDetailed, saveProgress, saveProgressDetailed, resetProgress };
};
