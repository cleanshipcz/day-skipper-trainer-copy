import type { Question } from "@/data/quizzes/types";
import { FLARE_QUIZ_PASS_POLICY } from "@/data/quizzes/safetyFlares";
import { quizCompletionOutcome } from "./scoring";

export const FLARE_CRITICAL_QUESTION_IDS = [
  "flare-applied-white-warning-v2",
  "flare-applied-launch-instructions-v2",
  "flare-applied-misfire-v2",
  "flare-applied-labelled-recognition-v2",
  "flare-applied-learning-limit-v2",
] as const;

export const flareQuizCompletionOutcome = (answers: readonly (number | null)[], questions: readonly Pick<Question, "id" | "correctAnswer">[]) => {
  const correctAnswers = answers.reduce((count, answer, index) => count + (answer === questions[index]?.correctAnswer ? 1 : 0), 0);
  const base = quizCompletionOutcome(correctAnswers, questions.length);
  const correctById = new Map(questions.map((question, index) => [question.id, answers[index] === question.correctAnswer]));
  const missedCriticalIds = FLARE_CRITICAL_QUESTION_IDS.filter((id) => correctById.get(id) !== true);
  return { ...base, passed: base.percentage >= FLARE_QUIZ_PASS_POLICY.passingPercentage && missedCriticalIds.length === 0, missedCriticalIds };
};
