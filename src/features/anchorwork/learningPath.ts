export const anchorPracticeSkills = [
  "Calculate scope from total bow-to-seabed depth",
  "Lay out rode while moving astern",
  "Apply a controlled set, verify holding, and keep the planned swing within safe room",
] as const;

export const anchorPracticePrerequisites = ["scope", "procedure"] as const;

export const anchorQuizRemediationByQuestion: Readonly<Record<string, string>> = {
  a1: "scope",
  a2: "procedure",
  a3: "scope",
  a4: "swinging-room",
  a5: "types",
  a6: "weighing",
  a7: "scope",
  a8: "procedure",
  a9: "swinging-room",
  a10: "procedure",
  a11: "types",
  a12: "weighing",
};

export const anchorQuizRemediationTopic = (
  questionIds: readonly string[],
  answers: readonly (number | null)[],
  correctAnswers: readonly number[],
): string => {
  const firstMissed = questionIds.find((_, index) => answers[index] !== correctAnswers[index]);
  return (firstMissed && anchorQuizRemediationByQuestion[firstMissed]) || "scope";
};

export const anchorTheoryRoute = (topic: string, source: "practice" | "quiz") =>
  `/anchorwork?topic=${encodeURIComponent(topic)}&from=${source}`;
