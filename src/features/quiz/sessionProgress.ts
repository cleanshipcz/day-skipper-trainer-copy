import { canonicalQuizProgressKey } from "./progressKeys";
import type { Json } from "@/integrations/supabase/types";
import type { Question } from "@/data/quizzes/types";
import { ownerStorageKey, readStored, removeStored, writeStored, type StorageWriteResult } from "@/features/persistence/browserStorage";

const QUIZ_SESSION_SCHEMA_VERSION = 3;
const ANONYMOUS_QUIZ_SESSION_VERSION = 1;
export const ANONYMOUS_QUIZ_SESSION_MAX_AGE_MS = 30 * 60 * 1000;

export type RestoredQuizSession = {
  answers: Array<number | null>;
  currentQuestion: number;
  tentativeAnswer?: number;
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

/**
 * Proves that a completed progress row belongs to the exact current question
 * and option catalogue without turning its answers back into an active attempt.
 */
export const isCurrentCompletedQuizCatalogue = (
  raw: Json | undefined,
  questions: readonly Question[],
): boolean => {
  if (!validCatalogue(questions) || !raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const record = raw as Record<string, unknown>;
  return (record.version === 2 || record.version === QUIZ_SESSION_SCHEMA_VERSION)
    && record.catalogueVersion === quizCatalogueVersion(questions);
};

export const anonymousQuizSessionKey = (topicKey: string) =>
  ownerStorageKey("quiz-anonymous-session-v1", topicKey);

interface AnonymousQuizSessionEnvelope {
  readonly version: typeof ANONYMOUS_QUIZ_SESSION_VERSION;
  readonly expiresAt: number;
  readonly progress: QuizSessionProgress;
}

export type AnonymousQuizRestore = {
  readonly session: RestoredQuizSession | null;
  readonly status: "missing" | "restored" | "expired" | "invalid" | "stale";
};

export const saveAnonymousQuizSession = (
  storage: Storage | undefined,
  topicKey: string,
  progress: QuizSessionProgress,
  now = Date.now(),
): StorageWriteResult => writeStored(storage, anonymousQuizSessionKey(topicKey), {
  version: ANONYMOUS_QUIZ_SESSION_VERSION,
  expiresAt: now + ANONYMOUS_QUIZ_SESSION_MAX_AGE_MS,
  progress,
} satisfies AnonymousQuizSessionEnvelope);

export const clearAnonymousQuizSession = (storage: Storage | undefined, topicKey: string) =>
  removeStored(storage, anonymousQuizSessionKey(topicKey));

export const clearAllAnonymousQuizSessions = (storage: Storage | undefined): void => {
  if (!storage) return;
  const prefix = "quiz-anonymous-session-v1:";
  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith(prefix)) storage.removeItem(key);
    }
  } catch {
    // Identity-boundary cleanup is best effort when browser storage is denied;
    // denied storage cannot be read to resume an anonymous attempt either.
  }
};

export const restoreAnonymousQuizSession = (
  storage: Storage | undefined,
  topicKey: string,
  questions: readonly Question[],
  now = Date.now(),
): AnonymousQuizRestore => {
  const key = anonymousQuizSessionKey(topicKey);
  let stored: string | null;
  try {
    stored = storage?.getItem(key) ?? null;
  } catch {
    return { session: null, status: "missing" };
  }
  if (stored === null) return { session: null, status: "missing" };
  const raw = readStored(storage, key, { decode: (value) => value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null });
  if (!raw) {
    removeStored(storage, key);
    return { session: null, status: "invalid" };
  }
  const progress = raw.progress;
  if (raw.version !== ANONYMOUS_QUIZ_SESSION_VERSION || !Number.isFinite(raw.expiresAt)
    || !progress || typeof progress !== "object" || Array.isArray(progress)) {
    removeStored(storage, key);
    return { session: null, status: "invalid" };
  }
  if ((raw.expiresAt as number) <= now) {
    removeStored(storage, key);
    return { session: null, status: "expired" };
  }
  if ((progress as Record<string, unknown>).catalogueVersion !== quizCatalogueVersion(questions)) {
    removeStored(storage, key);
    return { session: null, status: "stale" };
  }
  const session = parseSavedQuizSession(progress as Json, questions);
  if (!session) {
    removeStored(storage, key);
    return { session: null, status: "invalid" };
  }
  return { session, status: "restored" };
};

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
  if ((raw.version !== 2 && raw.version !== QUIZ_SESSION_SCHEMA_VERSION) || typeof raw.catalogueVersion !== "string"
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
  // Version 2 persisted radio changes before Submit, so its current answer is
  // necessarily ambiguous. Restore it as a tentative selection without
  // scoring it or revealing feedback. Version 3 contains assessed answers only.
  if (raw.version === 2 && answers[currentQuestion] !== null) {
    const tentativeAnswer = answers[currentQuestion] as number;
    answers[currentQuestion] = null;
    return { answers, currentQuestion, tentativeAnswer };
  }
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

/** Restores immutable answer evidence for a completed attempt without resuming it as an active quiz. */
export const parseCompletedQuizSession = (
  raw: Json | undefined,
  questions: readonly Question[],
): RestoredQuizSession | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.completed !== true) return null;
  const evidence = { ...raw } as Record<string, unknown>;
  delete evidence.completed;
  return parseSavedQuizSession(evidence as Json, questions);
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
