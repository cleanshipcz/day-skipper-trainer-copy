import { describe, expectTypeOf, it } from "vitest";
import type { Database, Json } from "./types";

type Functions = Database["public"]["Functions"];

describe("generated Supabase service contracts", () => {
  it("covers progress RPC arguments and result", () => {
    expectTypeOf<Functions["save_topic_progress"]["Args"]>().toEqualTypeOf<{
      p_answers_history?: Json | null;
      p_completed?: boolean;
      p_points?: number;
      p_score?: number;
      p_topic_id: string;
    }>();
    expectTypeOf<Functions["save_topic_progress"]["Returns"]>().toEqualTypeOf<
      { awarded_points: number; completion_awarded: boolean; points_awarded: boolean }[]
    >();
  });

  it("covers exam RPC arguments", () => {
    expectTypeOf<Functions["submit_exam_result"]["Args"]>().toEqualTypeOf<{
      p_attempt_id: string;
      p_score: number;
      p_time_taken_seconds: number;
      p_topic_breakdown: Json;
      p_total_questions: number;
      p_pass_mark?: number;
    }>();
  });

  it("covers engagement RPC arguments and result", () => {
    expectTypeOf<Functions["sync_engagement_event"]["Args"]>().toEqualTypeOf<{
      p_source_id: string;
      p_source_type: string;
    }>();
    expectTypeOf<Functions["sync_engagement_event"]["Returns"]>().toEqualTypeOf<{
      bonus_points: number;
      current_streak: number;
      unlocked_badge_ids: string[];
    }>();
  });

  it("covers review RPC arguments", () => {
    expectTypeOf<Functions["seed_question_reviews"]["Args"]>().toEqualTypeOf<{
      p_question_ids: string[];
    }>();
    expectTypeOf<Functions["record_question_review"]["Args"]>().toEqualTypeOf<{
      p_question_id: string;
      p_quality: number;
      p_review_id: string;
      p_reviewed_at?: string;
    }>();
  });
});
