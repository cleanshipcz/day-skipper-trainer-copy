import type { Json, Tables } from "@/integrations/supabase/types";

export type QuizAnswersHistory = {
  answers?: number[];
  currentQuestion?: number;
  [key: string]: Json | undefined;
};

export type QuizProgressRow = Pick<Tables<"user_progress">, "topic_id" | "answers_history" | "completed" | "score">;

type LoadResolution = {
  record: QuizProgressRow | null;
  shouldMigrateFromLegacy: boolean;
};

export const canonicalQuizProgressKey = (topicKey: string) => `quiz-${topicKey}`;

export const resolveQuizProgressForLoad = (
  topicKey: string,
  canonicalRecord: QuizProgressRow | null,
  legacyRecord: QuizProgressRow | null
): LoadResolution => {
  if (canonicalRecord) {
    return { record: canonicalRecord, shouldMigrateFromLegacy: false };
  }

  if (legacyRecord && legacyRecord.topic_id === topicKey) {
    return { record: legacyRecord, shouldMigrateFromLegacy: true };
  }

  return { record: null, shouldMigrateFromLegacy: false };
};
