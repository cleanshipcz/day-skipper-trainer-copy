export const WITHDRAWN_VICTUALLING_QUESTION_IDS = ["v6", "v12"] as const;

export const victuallingObjectiveByQuestion: Readonly<Record<string, string>> = {
  v1: "victualling-planner", v2: "victualling-planner", v3: "victualling-stowage",
  v4: "victualling-waste", v5: "victualling-shelf-life", v17: "victualling-traceability",
  v7: "victualling-menus", v8: "victualling-menus", v9: "victualling-crew-needs",
  v10: "victualling-galley", v11: "victualling-galley", v18: "victualling-galley",
  v13: "victualling-crew-needs", v14: "victualling-stowage", v15: "victualling-water-hygiene",
  v16: "victualling-waste",
};

export const victuallingTheoryRoute = (questionId?: string): string =>
  `/victualling#${(questionId && victuallingObjectiveByQuestion[questionId]) || "victualling-learning"}`;

export const victuallingQuizRemediationRoute = (
  questionIds: readonly string[], answers: readonly (number | null)[], correctAnswers: readonly number[],
): string => {
  const firstMissed = questionIds.find((_, index) => answers[index] !== correctAnswers[index]);
  return victuallingTheoryRoute(firstMissed);
};
