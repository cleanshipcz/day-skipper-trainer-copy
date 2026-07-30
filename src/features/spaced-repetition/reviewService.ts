import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { quizRegistry } from "@/data/quizzes";
import { buildReviewQuestionRegistry, selectDueReviews, type DueReview } from "./reviewQuestions";

export type QuestionReview = Database["public"]["Tables"]["question_reviews"]["Row"];

const questionRegistry = buildReviewQuestionRegistry(quizRegistry);

export const fetchDueQuestions = async (
  client: SupabaseClient<Database>,
  userId: string,
  now = new Date(),
): Promise<readonly DueReview<QuestionReview>[]> => {
  const { data, error } = await client
    .from("question_reviews")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", now.toISOString())
    .order("next_review_at");
  if (error) throw error;
  return selectDueReviews(data ?? [], questionRegistry, now);
};

export const fetchDueCount = async (
  client: SupabaseClient<Database>,
  userId: string,
  now = new Date(),
): Promise<number> => {
  const { count, error } = await client
    .from("question_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_at", now.toISOString());
  if (error) throw error;
  return count ?? 0;
};

export const seedQuizQuestions = async (
  client: SupabaseClient<Database>,
  topicId: string,
  questionIds: readonly string[],
): Promise<void> => {
  const validIds = new Set(quizRegistry[topicId]?.map(({ id }) => id) ?? []);
  const sanitized = [...new Set(questionIds)].filter((id) => validIds.has(id));
  if (sanitized.length === 0) return;
  const { error } = await client.rpc("seed_question_reviews", { p_question_ids: sanitized });
  if (error) throw error;
};

export const recordReview = async (
  client: SupabaseClient<Database>,
  questionId: string,
  quality: number,
  reviewId: string,
  reviewedAt: Date,
): Promise<QuestionReview> => {
  if (!questionRegistry.has(questionId)) throw new Error("Unknown review question");
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new RangeError("quality must be an integer from 0 to 5");
  }
  const { data, error } = await client.rpc("record_question_review", {
    p_question_id: questionId,
    p_quality: quality,
    p_review_id: reviewId,
    p_reviewed_at: reviewedAt.toISOString(),
  });
  if (error) throw error;
  if (!data) throw new Error("Review save returned no row");
  return data;
};
