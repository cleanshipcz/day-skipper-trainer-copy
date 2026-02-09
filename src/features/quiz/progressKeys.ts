type ProgressRow = { topic_id: string } | null;

export const canonicalQuizProgressKey = (topicKey: string) => `quiz-${topicKey}`;

export const resolveQuizProgressForLoad = (
  topicKey: string,
  canonicalRecord: ProgressRow,
  legacyRecord: ProgressRow
) => {
  if (canonicalRecord) {
    return { record: canonicalRecord, shouldMigrateFromLegacy: false };
  }

  if (legacyRecord && legacyRecord.topic_id === topicKey) {
    return { record: legacyRecord, shouldMigrateFromLegacy: true };
  }

  return { record: null, shouldMigrateFromLegacy: false };
};
