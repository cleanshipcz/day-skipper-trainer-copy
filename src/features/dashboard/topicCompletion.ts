interface TopicWithSubmodules {
  id: string;
  submoduleIds?: readonly string[];
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
  // Victualling's checklist is reversible planning state. Only the canonical
  // quiz record is durable evidence that the learning topic was passed.
  if (topic.id === "victualling" || topic.id === "engine") {
    const quizId = `quiz-${topic.id}`;
    return {
      isCompleted: progressMap[quizId]?.completed ?? false,
      score: progressMap[quizId]?.score ?? 0,
    };
  }
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
