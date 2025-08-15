export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      app_error_logs: {
        Row: {
          created_at: string
          id: string
          location: string | null
          message: string
          payload: Json | null
          source: string
          stack: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          message: string
          payload?: Json | null
          source?: string
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          message?: string
          payload?: Json | null
          source?: string
          stack?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_event_logs: {
        Row: {
          created_at: string
          device: string | null
          event_type: string
          id: string
          payload: Json | null
          platform: string | null
          route: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          platform?: string | null
          route?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          platform?: string | null
          route?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenged_score: number | null
          challenged_user: string
          challenger_score: number | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string
          difficulty_level: number
          expires_at: string
          id: number
          status: string
          title: string
          topic_id: number
        }
        Insert: {
          challenged_score?: number | null
          challenged_user: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description: string
          difficulty_level?: number
          expires_at: string
          id?: number
          status?: string
          title: string
          topic_id: number
        }
        Update: {
          challenged_score?: number | null
          challenged_user?: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string
          difficulty_level?: number
          expires_at?: string
          id?: number
          status?: string
          title?: string
          topic_id?: number
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
      diagnostic_item_attempts: {
        Row: {
          answer: Json | null
          confidence: number | null
          created_at: string
          hint_level: number | null
          id: string
          is_correct: boolean | null
          item_id: string | null
          meta: Json | null
          phase: number | null
          question_code: string | null
          response_time_ms: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          answer?: Json | null
          confidence?: number | null
          created_at?: string
          hint_level?: number | null
          id?: string
          is_correct?: boolean | null
          item_id?: string | null
          meta?: Json | null
          phase?: number | null
          question_code?: string | null
          response_time_ms?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          answer?: Json | null
          confidence?: number | null
          created_at?: string
          hint_level?: number | null
          id?: string
          is_correct?: boolean | null
          item_id?: string | null
          meta?: Json | null
          phase?: number | null
          question_code?: string | null
          response_time_ms?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_item_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_items: {
        Row: {
          choices: Json
          class_levels: number[] | null
          correct_key: string
          created_at: string
          difficulty: number
          id: string
          is_active: boolean
          prompt: string
          question_code: string
          tags: string[]
          topic: string
          track: string | null
          type: string
          updated_at: string
        }
        Insert: {
          choices: Json
          class_levels?: number[] | null
          correct_key: string
          created_at?: string
          difficulty?: number
          id?: string
          is_active?: boolean
          prompt: string
          question_code: string
          tags?: string[]
          topic: string
          track?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          choices?: Json
          class_levels?: number[] | null
          correct_key?: string
          created_at?: string
          difficulty?: number
          id?: string
          is_active?: boolean
          prompt?: string
          question_code?: string
          tags?: string[]
          topic?: string
          track?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnostic_sessions: {
        Row: {
          class_level: number | null
          completed_at: string | null
          created_at: string
          current_phase: number
          id: string
          meta: Json | null
          self_ratings: Json | null
          status: string
          summary: Json | null
          track: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class_level?: number | null
          completed_at?: string | null
          created_at?: string
          current_phase?: number
          id?: string
          meta?: Json | null
          self_ratings?: Json | null
          status?: string
          summary?: Json | null
          track?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class_level?: number | null
          completed_at?: string | null
          created_at?: string
          current_phase?: number
          id?: string
          meta?: Json | null
          self_ratings?: Json | null
          status?: string
          summary?: Json | null
          track?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_tests: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          estimated_mastery_level: number | null
          final_score: number | null
          id: string
          questions_data: Json
          skill_id: string
          test_type: string
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          estimated_mastery_level?: number | null
          final_score?: number | null
          id?: string
          questions_data: Json
          skill_id: string
          test_type?: string
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          estimated_mastery_level?: number | null
          final_score?: number | null
          id?: string
          questions_data?: Json
          skill_id?: string
          test_type?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_tests_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_reminders: {
        Row: {
          active: boolean
          created_at: string
          days_of_week: number[]
          goal_id: number
          id: string
          notify_channel: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          days_of_week?: number[]
          goal_id: number
          id?: string
          notify_channel?: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          days_of_week?: number[]
          goal_id?: number
          id?: string
          notify_channel?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_reminders_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "learning_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      group_study_sessions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number
          group_id: number
          id: number
          scheduled_at: string
          status: string
          title: string
          topic_id: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number
          group_id: number
          id?: number
          scheduled_at: string
          status?: string
          title: string
          topic_id: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number
          group_id?: number
          id?: number
          scheduled_at?: string
          status?: string
          title?: string
          topic_id?: number
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          challenges_won: number
          created_at: string
          id: number
          lessons_completed: number
          period_start: string
          period_type: string
          position: number | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenges_won?: number
          created_at?: string
          id?: number
          lessons_completed?: number
          period_start: string
          period_type: string
          position?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenges_won?: number
          created_at?: string
          id?: number
          lessons_completed?: number
          period_start?: string
          period_type?: string
          position?: number | null
          total_points?: number
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
          reminder_days_before: number
          reminder_enabled: boolean
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
          reminder_days_before?: number
          reminder_enabled?: boolean
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
          reminder_days_before?: number
          reminder_enabled?: boolean
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
      lesson_steps: {
        Row: {
          ai_prompt: string | null
          ai_response: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          response_time_ms: number | null
          session_id: string
          step_number: number
          step_type: string
          tokens_used: number | null
          user_input: string | null
        }
        Insert: {
          ai_prompt?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          response_time_ms?: number | null
          session_id: string
          step_number: number
          step_type: string
          tokens_used?: number | null
          user_input?: string | null
        }
        Update: {
          ai_prompt?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          response_time_ms?: number | null
          session_id?: string
          step_number?: number
          step_type?: string
          tokens_used?: number | null
          user_input?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_steps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
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
      math_validation_cache: {
        Row: {
          cached_at: string
          error_message: string | null
          expression_hash: string
          id: string
          input_expression: string
          is_correct: boolean | null
          validation_result: Json | null
        }
        Insert: {
          cached_at?: string
          error_message?: string | null
          expression_hash: string
          id?: string
          input_expression: string
          is_correct?: boolean | null
          validation_result?: Json | null
        }
        Update: {
          cached_at?: string
          error_message?: string | null
          expression_hash?: string
          id?: string
          input_expression?: string
          is_correct?: boolean | null
          validation_result?: Json | null
        }
        Relationships: []
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          created_at: string
          id: string
          referral_id: string
          reward_type: string
          user_id: string
        }
        Insert: {
          amount?: number
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_id: string
          reward_type: string
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_id?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status: string
          subscription_activated_at: string | null
          trial_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status?: string
          subscription_activated_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
          subscription_activated_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          claimed_at: string
          delivery_info: Json | null
          fulfilled_at: string | null
          id: string
          points_spent: number
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          delivery_info?: Json | null
          fulfilled_at?: string | null
          id?: string
          points_spent: number
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          delivery_info?: Json | null
          fulfilled_at?: string | null
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_catalog: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_required: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_required: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_required?: number
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
      session_participants: {
        Row: {
          id: number
          joined_at: string | null
          participation_score: number | null
          session_id: number
          user_id: string
        }
        Insert: {
          id?: number
          joined_at?: string | null
          participation_score?: number | null
          session_id: number
          user_id: string
        }
        Update: {
          id?: number
          joined_at?: string | null
          participation_score?: number | null
          session_id?: number
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
      skill_progress: {
        Row: {
          consecutive_correct: number | null
          correct_attempts: number | null
          created_at: string
          difficulty_multiplier: number | null
          id: string
          is_mastered: boolean | null
          last_reviewed_at: string | null
          mastery_level: number | null
          next_review_at: string | null
          skill_id: string
          total_attempts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_correct?: number | null
          correct_attempts?: number | null
          created_at?: string
          difficulty_multiplier?: number | null
          id?: string
          is_mastered?: boolean | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_at?: string | null
          skill_id: string
          total_attempts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_correct?: number | null
          correct_attempts?: number | null
          created_at?: string
          difficulty_multiplier?: number | null
          id?: string
          is_mastered?: boolean | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_at?: string | null
          skill_id?: string
          total_attempts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_progress_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          class_level: number
          created_at: string
          department: string
          description: string | null
          difficulty_rating: number | null
          estimated_time_minutes: number | null
          id: string
          is_active: boolean | null
          level: string
          men_code: string | null
          name: string
          prerequisites: string[] | null
          updated_at: string
        }
        Insert: {
          class_level?: number
          created_at?: string
          department: string
          description?: string | null
          difficulty_rating?: number | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          level?: string
          men_code?: string | null
          name: string
          prerequisites?: string[] | null
          updated_at?: string
        }
        Update: {
          class_level?: number
          created_at?: string
          department?: string
          description?: string | null
          difficulty_rating?: number | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          level?: string
          men_code?: string | null
          name?: string
          prerequisites?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      social_achievements: {
        Row: {
          achievement_type: string
          created_at: string
          description: string
          icon: string
          id: number
          is_active: boolean | null
          name: string
          points_reward: number
          requirement_value: number
        }
        Insert: {
          achievement_type: string
          created_at?: string
          description: string
          icon: string
          id?: number
          is_active?: boolean | null
          name: string
          points_reward?: number
          requirement_value: number
        }
        Update: {
          achievement_type?: string
          created_at?: string
          description?: string
          icon?: string
          id?: number
          is_active?: boolean | null
          name?: string
          points_reward?: number
          requirement_value?: number
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: number
          id: number
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: number
          id?: number
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: number
          id?: number
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      study_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: number
          is_public: boolean
          join_code: string
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: number
          is_public?: boolean
          join_code: string
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: number
          is_public?: boolean
          join_code?: string
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          ai_model_used: string | null
          average_response_time_ms: number | null
          completed_at: string | null
          completed_steps: number | null
          created_at: string
          current_equation: string | null
          early_reveals: number | null
          hints_used: number | null
          id: string
          initialized: boolean | null
          mastery_score: number | null
          pseudo_activity_strikes: number | null
          session_type: string
          skill_id: string
          started_at: string
          status: string
          total_steps: number | null
          total_tokens_used: number | null
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          average_response_time_ms?: number | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          current_equation?: string | null
          early_reveals?: number | null
          hints_used?: number | null
          id?: string
          initialized?: boolean | null
          mastery_score?: number | null
          pseudo_activity_strikes?: number | null
          session_type?: string
          skill_id: string
          started_at?: string
          status?: string
          total_steps?: number | null
          total_tokens_used?: number | null
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          average_response_time_ms?: number | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          current_equation?: string | null
          early_reveals?: number | null
          hints_used?: number | null
          id?: string
          initialized?: boolean | null
          mastery_score?: number | null
          pseudo_activity_strikes?: number | null
          session_type?: string
          skill_id?: string
          started_at?: string
          status?: string
          total_steps?: number | null
          total_tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
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
      user_daily_limits: {
        Row: {
          created_at: string
          date: string
          hard_limit: number | null
          id: string
          sessions_count: number | null
          soft_limit: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          hard_limit?: number | null
          id?: string
          sessions_count?: number | null
          soft_limit?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hard_limit?: number | null
          id?: string
          sessions_count?: number | null
          soft_limit?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
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
      user_referral_stats: {
        Row: {
          available_points: number
          created_at: string
          current_tier: string
          free_months_earned: number
          id: string
          successful_referrals: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_points?: number
          created_at?: string
          current_tier?: string
          free_months_earned?: number
          id?: string
          successful_referrals?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_points?: number
          created_at?: string
          current_tier?: string
          free_months_earned?: number
          id?: string
          successful_referrals?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      weekly_summaries: {
        Row: {
          created_at: string
          id: string
          summary: Json
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          summary?: Json
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          summary?: Json
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
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
      check_social_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      generate_join_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_random_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_weekly_benchmarks: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_leaderboard: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      update_referral_stats: {
        Args: { p_user_id: string }
        Returns: undefined
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
