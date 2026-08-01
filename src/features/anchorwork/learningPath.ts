export const anchorPracticeSkills = [
  "Calculate scope from total bow-to-seabed depth",
  "Lay out rode while moving astern",
  "Verify the anchor is ahead of the bow with enough scope",
] as const;

export const anchorPracticePrerequisites = ["scope", "procedure"] as const;

const quizRemediationByQuestion: Readonly<Record<string, string>> = {
  a1: "scope",
  a2: "procedure",
  a3: "scope",
  a4: "swinging-room",
  a5: "types",
  a6: "weighing",
  a7: "types",
  a8: "procedure",
  a9: "scope",
  a10: "procedure",
  a11: "types",
  a12: "procedure",
};

export const anchorQuizRemediationTopic = (
  questionIds: readonly string[],
  answers: readonly (number | null)[],
  correctAnswers: readonly number[],
): string => {
  const firstMissed = questionIds.find((_, index) => answers[index] !== correctAnswers[index]);
  return (firstMissed && quizRemediationByQuestion[firstMissed]) || "scope";
};

export const anchorTheoryRoute = (topic: string, source: "practice" | "quiz") =>
  `/anchorwork?topic=${encodeURIComponent(topic)}&from=${source}`;
