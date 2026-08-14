import type { Question } from "@/data/quizzes/types";
import { quizCompletionOutcome } from "./scoring";

export const MOB_CRITICAL_QUESTION_IDS = [
  "mob-applied-distress-v2",
  "mob-applied-propeller-v2",
  "mob-applied-cold-recovery-v2",
] as const;

export const mobQuizCompletionOutcome = (
  answers: readonly (number | null)[],
  questions: readonly Pick<Question, "id" | "correctAnswer">[],
) => {
  const correctAnswers = answers.reduce(
    (count, answer, index) => count + (answer === questions[index]?.correctAnswer ? 1 : 0),
    0,
  );
  const base = quizCompletionOutcome(correctAnswers, questions.length);
  const correctById = new Map(questions.map((question, index) => [question.id, answers[index] === question.correctAnswer]));
  const missedCriticalIds = MOB_CRITICAL_QUESTION_IDS.filter((id) => correctById.get(id) !== true);
  return { ...base, passed: base.passed && missedCriticalIds.length === 0, missedCriticalIds };
};
