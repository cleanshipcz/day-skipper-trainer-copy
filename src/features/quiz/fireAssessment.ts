import type { Question } from "@/data/quizzes/types";
import { FIRE_QUIZ_PASS_POLICY } from "@/data/quizzes/safetyFire";
import { quizCompletionOutcome } from "./scoring";

export const FIRE_CRITICAL_QUESTION_IDS = [
  "fire-applied-offshore-alarm-v2",
  "fire-applied-distress-v2",
  "fire-applied-engine-space-v2",
  "fire-applied-gas-isolation-v2",
  "fire-applied-smoke-boundary-v2",
  "fire-applied-withdraw-v2",
] as const;

export const fireQuizCompletionOutcome = (answers: readonly (number | null)[], questions: readonly Pick<Question, "id" | "correctAnswer">[]) => {
  const correctAnswers = answers.reduce((count, answer, index) => count + (answer === questions[index]?.correctAnswer ? 1 : 0), 0);
  const base = quizCompletionOutcome(correctAnswers, questions.length);
  const correctById = new Map(questions.map((question, index) => [question.id, answers[index] === question.correctAnswer]));
  const missedCriticalIds = FIRE_CRITICAL_QUESTION_IDS.filter((id) => correctById.get(id) !== true);
  return { ...base, passed: base.percentage >= FIRE_QUIZ_PASS_POLICY.passingPercentage && missedCriticalIds.length === 0, missedCriticalIds };
};
