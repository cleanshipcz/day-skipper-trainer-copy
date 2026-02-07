import { useProgress } from "@/hooks/useProgress";

export const useCompletion = () => {
  const { saveProgress } = useProgress();

  const completeTopic = (topicId: string) => {
    // Mark as completed, 100% score, 10 points
    saveProgress(topicId, true, 100, 10);
  };

  return { completeTopic };
};
