export type CompletionState = "not_started" | "in_progress" | "completed";

export interface CompletionGateSnapshot {
  visitedSectionIds: string[];
  requiredSectionIds: string[];
  scrollPercent?: number;
}

export interface CompletionGateDecision {
  state: CompletionState;
  score: number;
  canComplete: boolean;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const visitedRequiredCount = ({ visitedSectionIds, requiredSectionIds }: CompletionGateSnapshot) =>
  requiredSectionIds.filter((id) => visitedSectionIds.includes(id)).length;

export const deriveCompletionGateDecision = (snapshot: CompletionGateSnapshot): CompletionGateDecision => {
  const requiredCount = snapshot.requiredSectionIds.length;
  const visitedCount = visitedRequiredCount(snapshot);
  const sectionCoverage = requiredCount === 0 ? 0 : (visitedCount / requiredCount) * 100;
  const scrollCoverage = snapshot.scrollPercent ?? 0;
  const score = clampPercent(Math.max(sectionCoverage, scrollCoverage));

  if (score >= 100 && visitedCount === requiredCount && requiredCount > 0) {
    return {
      state: "completed",
      score: 100,
      canComplete: true,
    };
  }

  if (visitedCount > 0 || scrollCoverage > 0) {
    return {
      state: "in_progress",
      score,
      canComplete: visitedCount === requiredCount && requiredCount > 0,
    };
  }

  return {
    state: "not_started",
    score: 0,
    canComplete: false,
  };
};
