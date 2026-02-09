import { canonicalQuizProgressKey } from "./progressKeys";
import type { Json } from "@/integrations/supabase/types";

export type QuizSessionProgress = {
  answers: Array<number | null>;
  currentQuestion: number;
};

interface PersistQuizSessionProgressArgs {
  isAuthenticated: boolean;
  topicKey: string;
  saveProgress: (
    topicId: string,
    completed?: boolean,
    score?: number,
    pointsEarned?: number,
    answersHistory?: Record<string, unknown>
  ) => Promise<void> | void;
  progress: QuizSessionProgress;
}

export const buildQuizSessionProgress = (
  answers: Array<number | null>,
  currentQuestion: number
): QuizSessionProgress => ({
  answers,
  currentQuestion,
});

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export const parseSavedQuizSession = (raw: Json | undefined, questionCount: number): QuizSessionProgress | null => {
  if (!raw || typeof raw !== "object") return null;

  const maybeAnswers = "answers" in raw ? raw.answers : undefined;
  if (!Array.isArray(maybeAnswers)) return null;

  const normalizedAnswers = new Array(questionCount).fill(null).map((_, idx) => {
    const candidate = maybeAnswers[idx];
    return isFiniteNumber(candidate) ? candidate : null;
  });

  const maxQuestionIndex = Math.max(0, questionCount - 1);
  const maybeCurrentQuestion = "currentQuestion" in raw ? raw.currentQuestion : 0;
  const currentQuestion = isFiniteNumber(maybeCurrentQuestion)
    ? Math.min(Math.max(Math.floor(maybeCurrentQuestion), 0), maxQuestionIndex)
    : 0;

  return {
    answers: normalizedAnswers,
    currentQuestion,
  };
};

export const persistQuizSessionProgress = async ({
  isAuthenticated,
  topicKey,
  saveProgress,
  progress,
}: PersistQuizSessionProgressArgs) => {
  if (!isAuthenticated) return;

  await saveProgress(canonicalQuizProgressKey(topicKey), false, 0, 0, buildQuizSessionProgress(progress.answers, progress.currentQuestion));
};
