import { SAFETY_QUIZ_CRITICAL_IDS, SAFETY_LEAF_ROUTES, type SafetyLeaf } from "@/data/quizzes/safety";
import type { Question } from "@/data/quizzes/types";
import { percentageScore } from "./scoring";

export const SAFETY_QUIZ_PASS_POLICY = {
  minimumCorrectPerLeaf: 3,
  objectivesPerLeaf: 4,
  claim: "This written result demonstrates the required objectives in each Safety leaf; it is not practical competence or vessel readiness.",
  remediation: "Review every missed objective in its linked lesson, check vessel and manufacturer instructions, then retry. Stop and seek competent or emergency help where the lesson requires escalation.",
} as const;

export const safetyQuizCompletionOutcome = (answers: Array<number | null>, questions: readonly Question[]) => {
  const correctAnswers = questions.filter((question, index) => answers[index] === question.correctAnswer).length;
  const leafCorrect = Object.fromEntries(Object.keys(SAFETY_LEAF_ROUTES).map((leaf) => [leaf, 0])) as Record<SafetyLeaf, number>;
  questions.forEach((question, index) => { if (answers[index] === question.correctAnswer) leafCorrect[question.leaf as SafetyLeaf] += 1; });
  const missedCriticalIds = SAFETY_QUIZ_CRITICAL_IDS.filter((id) => {
    const index = questions.findIndex((question) => question.id === id);
    return index < 0 || answers[index] !== questions[index].correctAnswer;
  });
  const failedLeaves = (Object.keys(leafCorrect) as SafetyLeaf[]).filter((leaf) => leafCorrect[leaf] < SAFETY_QUIZ_PASS_POLICY.minimumCorrectPerLeaf);
  return { percentage: percentageScore(correctAnswers, questions.length), passed: failedLeaves.length === 0 && missedCriticalIds.length === 0, pointsEarned: 0, leafCorrect, failedLeaves, missedCriticalIds };
};
