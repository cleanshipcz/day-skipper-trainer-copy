import { canonicalQuizProgressKey } from "./progressKeys";
import type { Json } from "@/integrations/supabase/types";
import type { Question } from "@/data/quizzes/types";

const QUIZ_SESSION_SCHEMA_VERSION = 2;

export type RestoredQuizSession = {
  answers: Array<number | null>;
  currentQuestion: number;
};

export type QuizSessionProgress = {
  version: typeof QUIZ_SESSION_SCHEMA_VERSION;
  catalogueVersion: string;
  answers: Array<{ questionId: string; optionId: string | null }>;
  currentQuestionId: string;
};

export const createEmptyQuizAnswers = (questionCount: number): Array<number | null> => Array(questionCount).fill(null);

interface PersistQuizSessionProgressArgs {
  isAuthenticated: boolean;
  topicKey: string;
  saveProgress: (
    topicId: string,
    completed?: boolean,
    score?: number,
    pointsEarned?: number,
    answersHistory?: Record<string, unknown>
  ) => Promise<unknown> | unknown;
  progress: QuizSessionProgress;
}

const validCatalogue = (questions: readonly Question[]) => {
  if (!questions.length) return false;
  const ids = new Set<string>();
  for (const question of questions) {
    if (!question.id || ids.has(question.id) || !Number.isInteger(question.correctAnswer)
      || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) return false;
    ids.add(question.id);
    if (!question.options.length || question.options.some((option) => typeof option !== "string")
      || new Set(question.options).size !== question.options.length) return false;
  }
  return true;
};

export const quizCatalogueVersion = (questions: readonly Question[]): string =>
  JSON.stringify([...questions]
    .map(({ id, options }) => [id, [...options].sort()] as const)
    .sort(([left], [right]) => left.localeCompare(right)));

export const buildQuizSessionProgress = (
  answers: Array<number | null>,
  currentQuestion: number,
  questions: readonly Question[],
): QuizSessionProgress => {
  if (!validCatalogue(questions) || answers.length !== questions.length || !Number.isInteger(currentQuestion)
    || currentQuestion < 0 || currentQuestion >= questions.length) throw new Error("Cannot persist an invalid quiz session.");
  return {
    version: QUIZ_SESSION_SCHEMA_VERSION,
    catalogueVersion: quizCatalogueVersion(questions),
    answers: questions.map((question, index) => {
      const answer = answers[index];
      if (answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length)) {
        throw new Error("Cannot persist an invalid quiz answer.");
      }
      return { questionId: question.id, optionId: answer === null ? null : question.options[answer] };
    }),
    currentQuestionId: questions[currentQuestion].id,
  };
};

const parseIdentitySession = (raw: Record<string, unknown>, questions: readonly Question[]): RestoredQuizSession | null => {
  if (raw.version !== QUIZ_SESSION_SCHEMA_VERSION || typeof raw.catalogueVersion !== "string"
    || !Array.isArray(raw.answers) || typeof raw.currentQuestionId !== "string") return null;
  const answerByQuestion = new Map<string, string | null>();
  for (const value of raw.answers) {
    if (!value || typeof value !== "object") return null;
    const entry = value as Record<string, unknown>;
    if (typeof entry.questionId !== "string" || (entry.optionId !== null && typeof entry.optionId !== "string")
      || answerByQuestion.has(entry.questionId)) return null;
    answerByQuestion.set(entry.questionId, entry.optionId as string | null);
  }
  const answers = questions.map((question) => {
    const optionId = answerByQuestion.get(question.id);
    if (optionId === undefined || optionId === null) return null;
    const optionIndex = question.options.indexOf(optionId);
    return optionIndex >= 0 ? optionIndex : null;
  });
  const savedCurrentIndex = questions.findIndex(({ id }) => id === raw.currentQuestionId);
  const currentQuestion = savedCurrentIndex >= 0 ? savedCurrentIndex : Math.max(0, answers.findIndex((answer) => answer === null));
  return { answers, currentQuestion };
};

const parseSafeLegacySession = (raw: Record<string, unknown>, questions: readonly Question[]): RestoredQuizSession | null => {
  if (!Array.isArray(raw.answers) || raw.answers.length !== questions.length || !Number.isInteger(raw.currentQuestion)
    || (raw.currentQuestion as number) < 0 || (raw.currentQuestion as number) >= questions.length) return null;
  // Legacy answers have no question or option identity. Only an unanswered
  // session can be migrated without risking attribution after catalogue edits.
  if (raw.answers.some((answer) => answer !== null)) return null;
  return { answers: createEmptyQuizAnswers(questions.length), currentQuestion: raw.currentQuestion as number };
};

export const parseSavedQuizSession = (
  raw: Json | undefined,
  questions: readonly Question[],
  isRecordCompleted = false,
): RestoredQuizSession | null => {
  if (isRecordCompleted || !validCatalogue(questions) || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if ("completed" in raw && raw.completed === true) return null;
  const record = raw as Record<string, unknown>;
  return "version" in record ? parseIdentitySession(record, questions) : parseSafeLegacySession(record, questions);
};

export const persistQuizSessionProgress = async ({
  isAuthenticated,
  topicKey,
  saveProgress,
  progress,
}: PersistQuizSessionProgressArgs) => {
  if (!isAuthenticated) return;
  await saveProgress(canonicalQuizProgressKey(topicKey), false, 0, 0, progress);
};
