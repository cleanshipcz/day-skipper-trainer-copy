export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_activity: {
        Row: {
          activity_date: string
          activity_type: string
          first_activity_at: string
          user_id: string
        }
        Insert: {
          activity_date: string
          activity_type: string
          first_activity_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          first_activity_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          activity_date: string
          consumed_at: string | null
          occurred_at: string
          result: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          activity_date: string
          consumed_at?: string | null
          occurred_at: string
          result?: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          activity_date?: string
          consumed_at?: string | null
          occurred_at?: string
          result?: Json | null
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_completion_awards: {
        Row: {
          awarded_at: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          attempt_id: string
          completed_at: string
          id: string
          pass_mark: number
          passed: boolean
          percentage: number
          score: number
          time_taken_seconds: number
          topic_breakdown: Json
          total_questions: number
          user_id: string
        }
        Insert: {
          attempt_id: string
          completed_at?: string
          id?: string
          pass_mark?: number
          passed: boolean
          percentage: number
          score: number
          time_taken_seconds: number
          topic_breakdown?: Json
          total_questions: number
          user_id: string
        }
        Update: {
          attempt_id?: string
          completed_at?: string
          id?: string
          pass_mark?: number
          passed?: boolean
          percentage?: number
          score?: number
          time_taken_seconds?: number
          topic_breakdown?: Json
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          learning_preferences: Json | null
          points: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          learning_preferences?: Json | null
          points?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          learning_preferences?: Json | null
          points?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      progress_awards: {
        Row: {
          awarded_at: string
          points: number
          topic_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          points: number
          topic_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          points?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
      question_review_receipts: {
        Row: {
          created_at: string
          quality: number
          question_id: string
          result: Json
          review_id: string
          reviewed_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          quality: number
          question_id: string
          result: Json
          review_id: string
          reviewed_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          quality?: number
          question_id?: string
          result?: Json
          review_id?: string
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_review_receipts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "review_question_catalog"
            referencedColumns: ["question_id"]
          },
        ]
      }
      question_reviews: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          question_id: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          question_id: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          question_id?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reviews_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "review_question_catalog"
            referencedColumns: ["question_id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_id: string
          completed_at: string | null
          expected_total: number
          started_at: string
          topic_id: string
          user_id: string
        }
        Insert: {
          attempt_id?: string
          completed_at?: string | null
          expected_total: number
          started_at?: string
          topic_id: string
          user_id: string
        }
        Update: {
          attempt_id?: string
          completed_at?: string | null
          expected_total?: number
          started_at?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_scores: {
        Row: {
          attempt_id: string
          completed_at: string
          id: string
          percentage: number
          score: number
          topic_id: string
          total_questions: number
          user_id: string
        }
        Insert: {
          attempt_id: string
          completed_at?: string
          id?: string
          percentage: number
          score: number
          topic_id: string
          total_questions: number
          user_id: string
        }
        Update: {
          attempt_id?: string
          completed_at?: string
          id?: string
          percentage?: number
          score?: number
          topic_id?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      review_question_catalog: {
        Row: {
          question_id: string
        }
        Insert: {
          question_id: string
        }
        Update: {
          question_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          answers_history: Json | null
          completed: boolean | null
          created_at: string
          id: string
          last_accessed: string | null
          score: number | null
          topic_id: string
          user_id: string
        }
        Insert: {
          answers_history?: Json | null
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          score?: number | null
          topic_id: string
          user_id: string
        }
        Update: {
          answers_history?: Json | null
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          score?: number | null
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_engagement_event: {
        Args: { p_source_id: string; p_source_type: string; p_user_id: string }
        Returns: Json
      }
      increment_user_points: {
        Args: { p_increment: number; p_user_id: string }
        Returns: undefined
      }
      record_learning_activity: {
        Args: { p_activity_type: string }
        Returns: {
          bonus_points: number
          current_streak: number
          unlocked_badge_ids: string[]
        }[]
      }
      record_question_review: {
        Args: {
          p_quality: number
          p_question_id: string
          p_review_id: string
          p_reviewed_at?: string
        }
        Returns: {
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          question_id: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "question_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_anchorwork_practice_progress: {
        Args: { p_answers_history: Json; p_completed: boolean; p_score: number }
        Returns: {
          awarded_points: number
          completion_awarded: boolean
          points_awarded: boolean
        }[]
      }
      save_anchorwork_progress: {
        Args: { p_completed_topic_ids: string[] }
        Returns: {
          awarded_points: number
          completion_awarded: boolean
          points_awarded: boolean
        }[]
      }
      save_topic_progress: {
        Args: {
          p_answers_history?: Json
          p_completed?: boolean
          p_points?: number
          p_score?: number
          p_topic_id: string
        }
        Returns: {
          awarded_points: number
          completion_awarded: boolean
          points_awarded: boolean
        }[]
      }
      seed_question_reviews: {
        Args: { p_question_ids: string[] }
        Returns: undefined
      }
      start_quiz_attempt: {
        Args: { p_topic_id: string }
        Returns: {
          attempt_id: string
          completed_at: string | null
          expected_total: number
          started_at: string
          topic_id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "quiz_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_exam_result: {
        Args: {
          p_attempt_id: string
          p_pass_mark?: number
          p_score: number
          p_time_taken_seconds: number
          p_topic_breakdown: Json
          p_total_questions: number
        }
        Returns: {
          attempt_id: string
          completed_at: string
          id: string
          pass_mark: number
          passed: boolean
          percentage: number
          score: number
          time_taken_seconds: number
          topic_breakdown: Json
          total_questions: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "exam_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_quiz_score: {
        Args: {
          p_attempt_id: string
          p_score: number
          p_topic_id: string
          p_total_questions: number
        }
        Returns: {
          attempt_id: string
          completed_at: string
          id: string
          percentage: number
          score: number
          topic_id: string
          total_questions: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "quiz_scores"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_engagement_event: {
        Args: { p_source_id: string; p_source_type: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
