export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: number
          is_active: boolean | null
          name: string
          points_reward: number
        }
        Insert: {
          category?: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon: string
          id?: number
          is_active?: boolean | null
          name: string
          points_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: number
          is_active?: boolean | null
          name?: string
          points_reward?: number
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          id: number
          message: string
          role: string
          session_id: number
          timestamp: string
        }
        Insert: {
          id?: number
          message: string
          role: string
          session_id: number
          timestamp?: string
        }
        Update: {
          id?: number
          message?: string
          role?: string
          session_id?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lesson_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats: {
        Row: {
          average_accuracy: number | null
          created_at: string
          date: string
          id: number
          lessons_completed: number | null
          points_earned: number | null
          topics_practiced: number | null
          total_time_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_accuracy?: number | null
          created_at?: string
          date: string
          id?: number
          lessons_completed?: number | null
          points_earned?: number | null
          topics_practiced?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_accuracy?: number | null
          created_at?: string
          date?: string
          id?: number
          lessons_completed?: number | null
          points_earned?: number | null
          topics_practiced?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          created_at: string
          current_value: number | null
          deadline: string | null
          goal_type: string
          id: number
          status: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          goal_type: string
          id?: number
          status?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          goal_type?: string
          id?: number
          status?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_sessions: {
        Row: {
          completed_at: string | null
          had_confusion: boolean
          id: number
          points_earned: number | null
          started_at: string
          status: string
          topic_id: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          had_confusion?: boolean
          id?: number
          points_earned?: number | null
          started_at?: string
          status?: string
          topic_id: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          had_confusion?: boolean
          id?: number
          points_earned?: number | null
          started_at?: string
          status?: string
          topic_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          description: string | null
          difficulty_level: number
          estimated_time_minutes: number | null
          id: number
          is_active: boolean | null
          lesson_order: number
          title: string
          topic_id: number
          updated_at: string
        }
        Insert: {
          content_data?: Json
          content_type?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_time_minutes?: number | null
          id?: number
          is_active?: boolean | null
          lesson_order?: number
          title: string
          topic_id: number
          updated_at?: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_time_minutes?: number | null
          id?: number
          is_active?: boolean | null
          lesson_order?: number
          title?: string
          topic_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          id: number
          points: number
          reason: string
          session_id: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: number
          points: number
          reason: string
          session_id?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: number
          points?: number
          reason?: string
          session_id?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lesson_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          diagnosis_completed: boolean
          email: string
          id: string
          level: number
          name: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis_completed?: boolean
          email: string
          id?: string
          level?: number
          name?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis_completed?: boolean
          email?: string
          id?: string
          level?: number
          name?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_analytics: {
        Row: {
          completion_rate: number | null
          correct_answers: number | null
          created_at: string
          duration_minutes: number | null
          engagement_score: number | null
          hints_used: number | null
          id: number
          mistakes_made: number | null
          questions_answered: number | null
          session_id: number
          topic_id: number
          user_id: string
        }
        Insert: {
          completion_rate?: number | null
          correct_answers?: number | null
          created_at?: string
          duration_minutes?: number | null
          engagement_score?: number | null
          hints_used?: number | null
          id?: number
          mistakes_made?: number | null
          questions_answered?: number | null
          session_id: number
          topic_id: number
          user_id: string
        }
        Update: {
          completion_rate?: number | null
          correct_answers?: number | null
          created_at?: string
          duration_minutes?: number | null
          engagement_score?: number | null
          hints_used?: number | null
          id?: number
          mistakes_made?: number | null
          questions_answered?: number | null
          session_id?: number
          topic_id?: number
          user_id?: string
        }
        Relationships: []
      }
      skill_mastery: {
        Row: {
          created_at: string
          id: number
          mastery_percentage: number
          topic_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          mastery_percentage?: number
          topic_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          mastery_percentage?: number
          topic_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_mastery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      topic_progress_history: {
        Row: {
          id: number
          mastery_percentage: number
          recorded_at: string
          session_id: number | null
          topic_id: number
          user_id: string
        }
        Insert: {
          id?: number
          mastery_percentage: number
          recorded_at?: string
          session_id?: number | null
          topic_id: number
          user_id: string
        }
        Update: {
          id?: number
          mastery_percentage?: number
          recorded_at?: string
          session_id?: number | null
          topic_id?: number
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: number
          estimated_time_minutes: number | null
          id: number
          is_active: boolean | null
          learning_objectives: string[]
          name: string
          prerequisites: string[] | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_time_minutes?: number | null
          id?: number
          is_active?: boolean | null
          learning_objectives?: string[]
          name: string
          prerequisites?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_time_minutes?: number | null
          id?: number
          is_active?: boolean | null
          learning_objectives?: string[]
          name?: string
          prerequisites?: string[] | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: number
          created_at: string
          id: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          created_at?: string
          id?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          created_at?: string
          id?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: number
          last_accessed_at: string | null
          lesson_id: number
          score: number | null
          started_at: string | null
          status: string
          time_spent_minutes: number | null
          topic_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: number
          last_accessed_at?: string | null
          lesson_id: number
          score?: number | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          topic_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: number
          last_accessed_at?: string | null
          lesson_id?: number
          score?: number | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          topic_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: number
          last_activity_date: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: number
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: number
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      generate_random_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_user_streak: {
        Args: { p_user_id: string }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
