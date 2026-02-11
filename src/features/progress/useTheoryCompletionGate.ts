import { useCallback, useMemo, useRef, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { deriveCompletionGateDecision, type CompletionState } from "./completionGates";

interface UseTheoryCompletionGateArgs {
  topicId: string;
  requiredSectionIds: string[];
  pointsOnComplete?: number;
}

export const useTheoryCompletionGate = ({
  topicId,
  requiredSectionIds,
  pointsOnComplete = 10,
}: UseTheoryCompletionGateArgs) => {
  const { saveProgress } = useProgress();
  const [visitedSectionIds, setVisitedSectionIds] = useState<string[]>([]);
  const inProgressPersistedRef = useRef(false);

  const decision = useMemo(
    () => deriveCompletionGateDecision({ visitedSectionIds, requiredSectionIds }),
    [requiredSectionIds, visitedSectionIds]
  );

  const persistInProgressIfNeeded = useCallback(
    async (state: CompletionState, score: number, nextVisitedSectionIds: string[]) => {
      if (state !== "in_progress" || inProgressPersistedRef.current) return;

      inProgressPersistedRef.current = true;
      await saveProgress(topicId, false, score, 0, {
        completionState: "in_progress",
        visitedSectionIds: nextVisitedSectionIds,
      });
    },
    [saveProgress, topicId]
  );

  const markSectionVisited = useCallback(
    async (sectionId: string) => {
      if (!sectionId) return;

      const nextVisitedSectionIds = Array.from(new Set([...visitedSectionIds, sectionId]));
      setVisitedSectionIds(nextVisitedSectionIds);

      const nextDecision = deriveCompletionGateDecision({ visitedSectionIds: nextVisitedSectionIds, requiredSectionIds });
      await persistInProgressIfNeeded(nextDecision.state, nextDecision.score, nextVisitedSectionIds);
    },
    [persistInProgressIfNeeded, requiredSectionIds, visitedSectionIds]
  );

  const markCompleted = useCallback(async () => {
    if (!decision.canComplete) return false;

    await saveProgress(topicId, true, 100, pointsOnComplete, {
      completionState: "completed",
      visitedSectionIds,
    });

    return true;
  }, [decision.canComplete, pointsOnComplete, saveProgress, topicId, visitedSectionIds]);

  return {
    completionState: decision.state,
    score: decision.score,
    canComplete: decision.canComplete,
    visitedSectionIds,
    markSectionVisited,
    markCompleted,
  };
};
