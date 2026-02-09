interface TopicWithSubmodules {
  id: string;
  submoduleIds?: string[];
}

interface UserProgressData {
  completed: boolean;
  score: number;
}

export interface TopicCompletionState {
  isCompleted: boolean;
  score: number;
}

export const deriveTopicCompletionState = (
  topic: TopicWithSubmodules,
  progressMap: Record<string, UserProgressData>
): TopicCompletionState => {
  if (topic.submoduleIds && topic.submoduleIds.length > 0) {
    const isCompleted = topic.submoduleIds.every((submoduleId) => progressMap[submoduleId]?.completed);
    const totalScore = topic.submoduleIds.reduce((sum, submoduleId) => sum + (progressMap[submoduleId]?.score ?? 0), 0);

    return {
      isCompleted,
      score: Math.round(totalScore / topic.submoduleIds.length),
    };
  }

  return {
    isCompleted: progressMap[topic.id]?.completed ?? false,
    score: progressMap[topic.id]?.score ?? 0,
  };
};
