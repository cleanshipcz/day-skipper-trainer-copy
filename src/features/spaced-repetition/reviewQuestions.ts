import type { Question } from "@/data/quizzes";

export interface ReviewQuestion {
  readonly topicId: string;
  readonly question: Question;
}

export interface ReviewRecord {
  readonly question_id: string;
  readonly next_review_at: string;
}

export interface DueReview<T extends ReviewRecord = ReviewRecord> extends ReviewQuestion {
  readonly review: T;
}

export const buildReviewQuestionRegistry = (
  quizzes: Readonly<Record<string, readonly Question[]>>,
): ReadonlyMap<string, ReviewQuestion> => {
  const registry = new Map<string, ReviewQuestion>();
  Object.entries(quizzes).forEach(([topicId, questions]) => {
    questions.forEach((question) => {
      if (registry.has(question.id)) {
        throw new Error(`Duplicate quiz question id: ${question.id}`);
      }
      registry.set(question.id, { topicId, question });
    });
  });
  return registry;
};

export const selectDueReviews = <T extends ReviewRecord>(
  records: readonly T[],
  questions: ReadonlyMap<string, ReviewQuestion>,
  now: Date,
): readonly DueReview<T>[] =>
  records
    .filter((record) => Date.parse(record.next_review_at) <= now.getTime())
    .sort((left, right) => Date.parse(left.next_review_at) - Date.parse(right.next_review_at))
    .flatMap((review) => {
      const resolved = questions.get(review.question_id);
      return resolved ? [{ ...resolved, review }] : [];
    });
