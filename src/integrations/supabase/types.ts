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
    PostgrestVersion: "13.0.5"
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
      admin_actions_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          created_at: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          created_at?: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          created_at?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      ai_conversation_log: {
        Row: {
          ai_response: string
          created_at: string
          endpoint: string | null
          full_prompt: string
          function_name: string
          id: string
          model_used: string | null
          parameters: Json | null
          processing_time_ms: number | null
          sequence_number: number
          session_id: string | null
          timestamp: string
          tokens_used: number | null
          user_id: string | null
          user_input: string | null
        }
        Insert: {
          ai_response: string
          created_at?: string
          endpoint?: string | null
          full_prompt: string
          function_name: string
          id?: string
          model_used?: string | null
          parameters?: Json | null
          processing_time_ms?: number | null
          sequence_number?: number
          session_id?: string | null
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
          user_input?: string | null
        }
        Update: {
          ai_response?: string
          created_at?: string
          endpoint?: string | null
          full_prompt?: string
          function_name?: string
          id?: string
          model_used?: string | null
          parameters?: Json | null
          processing_time_ms?: number | null
          sequence_number?: number
          session_id?: string | null
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
          user_input?: string | null
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          cache_data: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
        }
        Insert: {
          cache_data: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
        }
        Update: {
          cache_data?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      app_error_logs: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          location: string | null
          message: string
          payload: Json | null
          reproduction_steps: string | null
          session_context: Json | null
          severity: string | null
          source: string
          stack: string | null
          status: string | null
          user_description: string | null
          user_id: string | null
          user_journey: Json | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message: string
          payload?: Json | null
          reproduction_steps?: string | null
          session_context?: Json | null
          severity?: string | null
          source?: string
          stack?: string | null
          status?: string | null
          user_description?: string | null
          user_id?: string | null
          user_journey?: Json | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          location?: string | null
          message?: string
          payload?: Json | null
          reproduction_steps?: string | null
          session_context?: Json | null
          severity?: string | null
          source?: string
          stack?: string | null
          status?: string | null
          user_description?: string | null
          user_id?: string | null
          user_journey?: Json | null
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
      app_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: Database["public"]["Enums"]["app_role"]
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: Database["public"]["Enums"]["app_role"]
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: Database["public"]["Enums"]["app_role"]
          permissions?: Json | null
          updated_at?: string
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
      cognitive_load_profiles: {
        Row: {
          break_timing_preferences: Json | null
          created_at: string | null
          current_load_estimate: number | null
          effective_load_reducers: Json | null
          extraneous_load_sensitivity: number | null
          germane_load_optimization: number | null
          id: string
          intrinsic_load_capacity: number | null
          language_complexity_threshold: number | null
          last_calibrated: string | null
          optimal_load_range: Json | null
          overload_warning_threshold: number | null
          preferred_complexity_ramps: Json | null
          step_chunking_preference: number | null
          user_id: string
          visual_information_limit: number | null
        }
        Insert: {
          break_timing_preferences?: Json | null
          created_at?: string | null
          current_load_estimate?: number | null
          effective_load_reducers?: Json | null
          extraneous_load_sensitivity?: number | null
          germane_load_optimization?: number | null
          id?: string
          intrinsic_load_capacity?: number | null
          language_complexity_threshold?: number | null
          last_calibrated?: string | null
          optimal_load_range?: Json | null
          overload_warning_threshold?: number | null
          preferred_complexity_ramps?: Json | null
          step_chunking_preference?: number | null
          user_id: string
          visual_information_limit?: number | null
        }
        Update: {
          break_timing_preferences?: Json | null
          created_at?: string | null
          current_load_estimate?: number | null
          effective_load_reducers?: Json | null
          extraneous_load_sensitivity?: number | null
          germane_load_optimization?: number | null
          id?: string
          intrinsic_load_capacity?: number | null
          language_complexity_threshold?: number | null
          last_calibrated?: string | null
          optimal_load_range?: Json | null
          overload_warning_threshold?: number | null
          preferred_complexity_ramps?: Json | null
          step_chunking_preference?: number | null
          user_id?: string
          visual_information_limit?: number | null
        }
        Relationships: []
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
      devices: {
        Row: {
          created_at: string
          device_hash: string
          first_ip: unknown
          first_seen: string
          id: string
          last_seen: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_hash: string
          first_ip: unknown
          first_seen?: string
          id?: string
          last_seen?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_hash?: string
          first_ip?: unknown
          first_seen?: string
          id?: string
          last_seen?: string
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
      emotional_learning_states: {
        Row: {
          baseline_return_time: number | null
          content_adaptation_needed: Json | null
          detected_at: string | null
          detected_emotion: string | null
          effective_feedback_style: Json | null
          emotion_duration_seconds: number | null
          emotion_intensity: number | null
          emotion_transition_triggers: Json | null
          emotional_resilience_score: number | null
          id: string
          interaction_id: string | null
          learning_effectiveness_during_emotion: number | null
          motivation_sustainability: number | null
          optimal_interventions: Json | null
          regulation_strategies_needed: Json | null
          resolved_at: string | null
          user_id: string
        }
        Insert: {
          baseline_return_time?: number | null
          content_adaptation_needed?: Json | null
          detected_at?: string | null
          detected_emotion?: string | null
          effective_feedback_style?: Json | null
          emotion_duration_seconds?: number | null
          emotion_intensity?: number | null
          emotion_transition_triggers?: Json | null
          emotional_resilience_score?: number | null
          id?: string
          interaction_id?: string | null
          learning_effectiveness_during_emotion?: number | null
          motivation_sustainability?: number | null
          optimal_interventions?: Json | null
          regulation_strategies_needed?: Json | null
          resolved_at?: string | null
          user_id: string
        }
        Update: {
          baseline_return_time?: number | null
          content_adaptation_needed?: Json | null
          detected_at?: string | null
          detected_emotion?: string | null
          effective_feedback_style?: Json | null
          emotion_duration_seconds?: number | null
          emotion_intensity?: number | null
          emotion_transition_triggers?: Json | null
          emotional_resilience_score?: number | null
          id?: string
          interaction_id?: string | null
          learning_effectiveness_during_emotion?: number | null
          motivation_sustainability?: number | null
          optimal_interventions?: Json | null
          regulation_strategies_needed?: Json | null
          resolved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotional_learning_states_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "learning_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_state_analytics: {
        Row: {
          anxiety_level: number | null
          boredom_level: number | null
          clear_goals_present: boolean | null
          cognitive_overload: boolean | null
          created_at: string | null
          distraction_count: number | null
          effective_feedback_timing: Json | null
          ended_at: string | null
          enjoyment_rating: number | null
          flow_depth_score: number | null
          flow_duration_seconds: number | null
          flow_probability: number | null
          id: string
          immediate_feedback_available: boolean | null
          learning_efficiency_during_flow: number | null
          optimal_difficulty_range: Json | null
          preferred_interaction_pace: number | null
          retention_boost_from_flow: number | null
          self_consciousness_level: number | null
          session_id: string
          skill_challenge_ratio: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          boredom_level?: number | null
          clear_goals_present?: boolean | null
          cognitive_overload?: boolean | null
          created_at?: string | null
          distraction_count?: number | null
          effective_feedback_timing?: Json | null
          ended_at?: string | null
          enjoyment_rating?: number | null
          flow_depth_score?: number | null
          flow_duration_seconds?: number | null
          flow_probability?: number | null
          id?: string
          immediate_feedback_available?: boolean | null
          learning_efficiency_during_flow?: number | null
          optimal_difficulty_range?: Json | null
          preferred_interaction_pace?: number | null
          retention_boost_from_flow?: number | null
          self_consciousness_level?: number | null
          session_id: string
          skill_challenge_ratio?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          boredom_level?: number | null
          clear_goals_present?: boolean | null
          cognitive_overload?: boolean | null
          created_at?: string | null
          distraction_count?: number | null
          effective_feedback_timing?: Json | null
          ended_at?: string | null
          enjoyment_rating?: number | null
          flow_depth_score?: number | null
          flow_duration_seconds?: number | null
          flow_probability?: number | null
          id?: string
          immediate_feedback_available?: boolean | null
          learning_efficiency_during_flow?: number | null
          optimal_difficulty_range?: Json | null
          preferred_interaction_pace?: number | null
          retention_boost_from_flow?: number | null
          self_consciousness_level?: number | null
          session_id?: string
          skill_challenge_ratio?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      founding_members: {
        Row: {
          bonus_days_earned: number | null
          created_at: string
          device_info: Json | null
          email: string
          founding_position: number | null
          id: string
          name: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          registration_ip: unknown | null
          registration_source: string | null
          status: string | null
          updated_at: string
          user_id: string
          utm_params: Json | null
        }
        Insert: {
          bonus_days_earned?: number | null
          created_at?: string
          device_info?: Json | null
          email: string
          founding_position?: number | null
          id?: string
          name?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          registration_ip?: unknown | null
          registration_source?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          utm_params?: Json | null
        }
        Update: {
          bonus_days_earned?: number | null
          created_at?: string
          device_info?: Json | null
          email?: string
          founding_position?: number | null
          id?: string
          name?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          registration_ip?: unknown | null
          registration_source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          utm_params?: Json | null
        }
        Relationships: []
      }
      founding_scarcity_state: {
        Row: {
          accumulated_decrease: number | null
          created_at: string
          cycle_start_date: string | null
          daily_consumed_spots: number | null
          daily_target_decrease: number | null
          hourly_decrease_rate: number
          id: string
          last_update: string
          peak_hours_config: Json
          updated_at: string
          virtual_spots_taken: number
        }
        Insert: {
          accumulated_decrease?: number | null
          created_at?: string
          cycle_start_date?: string | null
          daily_consumed_spots?: number | null
          daily_target_decrease?: number | null
          hourly_decrease_rate?: number
          id?: string
          last_update?: string
          peak_hours_config?: Json
          updated_at?: string
          virtual_spots_taken?: number
        }
        Update: {
          accumulated_decrease?: number | null
          created_at?: string
          cycle_start_date?: string | null
          daily_consumed_spots?: number | null
          daily_target_decrease?: number | null
          hourly_decrease_rate?: number
          id?: string
          last_update?: string
          peak_hours_config?: Json
          updated_at?: string
          virtual_spots_taken?: number
        }
        Relationships: []
      }
      fraud_signals: {
        Row: {
          created_at: string
          id: string
          score_delta: number
          signal_type: string
          signal_value: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score_delta?: number
          signal_type: string
          signal_value: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score_delta?: number
          signal_type?: string
          signal_value?: string
          user_id?: string
        }
        Relationships: []
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
      knowledge_nodes: {
        Row: {
          bloom_taxonomy_level: number | null
          cognitive_load_estimate: number | null
          created_at: string | null
          department: string
          difficulty_level: number
          estimated_mastery_time_hours: number | null
          id: string
          misconception_patterns: Json | null
          prerequisite_knowledge_required: string[] | null
          real_world_applications: string[] | null
          skill_code: string
          skill_name: string
        }
        Insert: {
          bloom_taxonomy_level?: number | null
          cognitive_load_estimate?: number | null
          created_at?: string | null
          department?: string
          difficulty_level: number
          estimated_mastery_time_hours?: number | null
          id?: string
          misconception_patterns?: Json | null
          prerequisite_knowledge_required?: string[] | null
          real_world_applications?: string[] | null
          skill_code: string
          skill_name: string
        }
        Update: {
          bloom_taxonomy_level?: number | null
          cognitive_load_estimate?: number | null
          created_at?: string | null
          department?: string
          difficulty_level?: number
          estimated_mastery_time_hours?: number | null
          id?: string
          misconception_patterns?: Json | null
          prerequisite_knowledge_required?: string[] | null
          real_world_applications?: string[] | null
          skill_code?: string
          skill_name?: string
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
      learner_intelligence: {
        Row: {
          attention_span_minutes: number | null
          breakthrough_probability: number | null
          cognitive_load_capacity: number | null
          created_at: string | null
          dropout_risk_score: number | null
          emotional_state: Json | null
          frustration_patterns: Json | null
          id: string
          learning_strategies: Json | null
          learning_velocity: Json | null
          mastery_acquisition_rate: number | null
          metacognitive_skills: Json | null
          motivation_drivers: Json | null
          plateau_risk_score: number | null
          processing_speed_percentile: number | null
          retention_half_life: Json | null
          self_regulation_score: number | null
          updated_at: string | null
          user_id: string
          working_memory_span: number | null
        }
        Insert: {
          attention_span_minutes?: number | null
          breakthrough_probability?: number | null
          cognitive_load_capacity?: number | null
          created_at?: string | null
          dropout_risk_score?: number | null
          emotional_state?: Json | null
          frustration_patterns?: Json | null
          id?: string
          learning_strategies?: Json | null
          learning_velocity?: Json | null
          mastery_acquisition_rate?: number | null
          metacognitive_skills?: Json | null
          motivation_drivers?: Json | null
          plateau_risk_score?: number | null
          processing_speed_percentile?: number | null
          retention_half_life?: Json | null
          self_regulation_score?: number | null
          updated_at?: string | null
          user_id: string
          working_memory_span?: number | null
        }
        Update: {
          attention_span_minutes?: number | null
          breakthrough_probability?: number | null
          cognitive_load_capacity?: number | null
          created_at?: string | null
          dropout_risk_score?: number | null
          emotional_state?: Json | null
          frustration_patterns?: Json | null
          id?: string
          learning_strategies?: Json | null
          learning_velocity?: Json | null
          mastery_acquisition_rate?: number | null
          metacognitive_skills?: Json | null
          motivation_drivers?: Json | null
          plateau_risk_score?: number | null
          processing_speed_percentile?: number | null
          retention_half_life?: Json | null
          self_regulation_score?: number | null
          updated_at?: string | null
          user_id?: string
          working_memory_span?: number | null
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
          motivation_message: string | null
          reminder_days_before: number
          reminder_enabled: boolean
          status: string
          target_topic: string | null
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
          motivation_message?: string | null
          reminder_days_before?: number
          reminder_enabled?: boolean
          status?: string
          target_topic?: string | null
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
          motivation_message?: string | null
          reminder_days_before?: number
          reminder_enabled?: boolean
          status?: string
          target_topic?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_interactions: {
        Row: {
          ai_response: string | null
          assistant_flags: Json | null
          cognitive_load_estimate: number | null
          cognitive_strategies_used: Json | null
          completion_tokens: number | null
          confidence_level: number | null
          content_id: string | null
          correctness_level: number | null
          difficulty_level: number | null
          engagement_score: number | null
          flow_state_probability: number | null
          frustration_indicators: Json | null
          id: string
          interaction_timestamp: string | null
          interaction_type: string
          keystroke_dynamics: Json | null
          microsecond_timing: number | null
          misconceptions_activated: Json | null
          mouse_movement_patterns: Json | null
          pause_locations: Json | null
          prompt_tokens: number | null
          response_time_ms: number | null
          sequence_number: number | null
          session_id: string
          skills_demonstrated: Json | null
          tokens_estimate: number | null
          total_tokens: number | null
          user_id: string
          user_input: string | null
        }
        Insert: {
          ai_response?: string | null
          assistant_flags?: Json | null
          cognitive_load_estimate?: number | null
          cognitive_strategies_used?: Json | null
          completion_tokens?: number | null
          confidence_level?: number | null
          content_id?: string | null
          correctness_level?: number | null
          difficulty_level?: number | null
          engagement_score?: number | null
          flow_state_probability?: number | null
          frustration_indicators?: Json | null
          id?: string
          interaction_timestamp?: string | null
          interaction_type: string
          keystroke_dynamics?: Json | null
          microsecond_timing?: number | null
          misconceptions_activated?: Json | null
          mouse_movement_patterns?: Json | null
          pause_locations?: Json | null
          prompt_tokens?: number | null
          response_time_ms?: number | null
          sequence_number?: number | null
          session_id: string
          skills_demonstrated?: Json | null
          tokens_estimate?: number | null
          total_tokens?: number | null
          user_id: string
          user_input?: string | null
        }
        Update: {
          ai_response?: string | null
          assistant_flags?: Json | null
          cognitive_load_estimate?: number | null
          cognitive_strategies_used?: Json | null
          completion_tokens?: number | null
          confidence_level?: number | null
          content_id?: string | null
          correctness_level?: number | null
          difficulty_level?: number | null
          engagement_score?: number | null
          flow_state_probability?: number | null
          frustration_indicators?: Json | null
          id?: string
          interaction_timestamp?: string | null
          interaction_type?: string
          keystroke_dynamics?: Json | null
          microsecond_timing?: number | null
          misconceptions_activated?: Json | null
          mouse_movement_patterns?: Json | null
          pause_locations?: Json | null
          prompt_tokens?: number | null
          response_time_ms?: number | null
          sequence_number?: number | null
          session_id?: string
          skills_demonstrated?: Json | null
          tokens_estimate?: number | null
          total_tokens?: number | null
          user_id?: string
          user_input?: string | null
        }
        Relationships: []
      }
      learning_phase_progress: {
        Row: {
          attempts_count: number | null
          completed_at: string | null
          correct_attempts: number | null
          created_at: string | null
          id: string
          last_attempt_at: string | null
          phase_number: number
          progress_percentage: number | null
          skill_id: string
          status: string
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts_count?: number | null
          completed_at?: string | null
          correct_attempts?: number | null
          created_at?: string | null
          id?: string
          last_attempt_at?: string | null
          phase_number: number
          progress_percentage?: number | null
          skill_id: string
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts_count?: number | null
          completed_at?: string | null
          correct_attempts?: number | null
          created_at?: string | null
          id?: string
          last_attempt_at?: string | null
          phase_number?: number
          progress_percentage?: number | null
          skill_id?: string
          status?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_phase_progress_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_predictions: {
        Row: {
          actual_outcome: Json | null
          confidence_level: number | null
          created_at: string | null
          early_warning_signals: Json | null
          id: string
          model_version: string | null
          predicted_event: Json | null
          predicted_for: string
          prediction_accuracy: number | null
          prediction_horizon_hours: number | null
          prediction_type: string
          preventive_interventions: Json | null
          resolved_at: string | null
          risk_factors: Json | null
          user_id: string
        }
        Insert: {
          actual_outcome?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          early_warning_signals?: Json | null
          id?: string
          model_version?: string | null
          predicted_event?: Json | null
          predicted_for: string
          prediction_accuracy?: number | null
          prediction_horizon_hours?: number | null
          prediction_type: string
          preventive_interventions?: Json | null
          resolved_at?: string | null
          risk_factors?: Json | null
          user_id: string
        }
        Update: {
          actual_outcome?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          early_warning_signals?: Json | null
          id?: string
          model_version?: string | null
          predicted_event?: Json | null
          predicted_for?: string
          prediction_accuracy?: number | null
          prediction_horizon_hours?: number | null
          prediction_type?: string
          preventive_interventions?: Json | null
          resolved_at?: string | null
          risk_factors?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      learning_profiles: {
        Row: {
          attention_span_minutes: number | null
          cognitive_load_threshold: number | null
          confidence_level: number | null
          created_at: string | null
          current_energy_level: number | null
          ease_factor: number | null
          frustration_level: number | null
          id: string
          initial_interval_hours: number | null
          intrinsic_vs_extrinsic: number | null
          optimal_challenge_level: number | null
          optimal_session_length_minutes: number | null
          processing_speed_percentile: number | null
          sequential_vs_global_preference: number | null
          updated_at: string | null
          user_id: string
          visual_vs_verbal_preference: number | null
          working_memory_span: number | null
        }
        Insert: {
          attention_span_minutes?: number | null
          cognitive_load_threshold?: number | null
          confidence_level?: number | null
          created_at?: string | null
          current_energy_level?: number | null
          ease_factor?: number | null
          frustration_level?: number | null
          id?: string
          initial_interval_hours?: number | null
          intrinsic_vs_extrinsic?: number | null
          optimal_challenge_level?: number | null
          optimal_session_length_minutes?: number | null
          processing_speed_percentile?: number | null
          sequential_vs_global_preference?: number | null
          updated_at?: string | null
          user_id: string
          visual_vs_verbal_preference?: number | null
          working_memory_span?: number | null
        }
        Update: {
          attention_span_minutes?: number | null
          cognitive_load_threshold?: number | null
          confidence_level?: number | null
          created_at?: string | null
          current_energy_level?: number | null
          ease_factor?: number | null
          frustration_level?: number | null
          id?: string
          initial_interval_hours?: number | null
          intrinsic_vs_extrinsic?: number | null
          optimal_challenge_level?: number | null
          optimal_session_length_minutes?: number | null
          processing_speed_percentile?: number | null
          sequential_vs_global_preference?: number | null
          updated_at?: string | null
          user_id?: string
          visual_vs_verbal_preference?: number | null
          working_memory_span?: number | null
        }
        Relationships: []
      }
      marketing_consent_rewards: {
        Row: {
          bonus_days: number | null
          bonus_tokens: number | null
          clawback_eligible_until: string | null
          created_at: string | null
          device_fingerprint: string | null
          id: string
          marketing_consent_revoked_at: string | null
          reward_granted: boolean | null
          reward_granted_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_days?: number | null
          bonus_tokens?: number | null
          clawback_eligible_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          marketing_consent_revoked_at?: string | null
          reward_granted?: boolean | null
          reward_granted_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_days?: number | null
          bonus_tokens?: number | null
          clawback_eligible_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          marketing_consent_revoked_at?: string | null
          reward_granted?: boolean | null
          reward_granted_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_consent_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      marketing_consents: {
        Row: {
          consent_type: string
          consent_version: string | null
          created_at: string | null
          device_fingerprint: string | null
          granted_at: string | null
          id: string
          ip_address: unknown | null
          is_granted: boolean | null
          metadata: Json | null
          revoked_at: string | null
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_granted?: boolean | null
          metadata?: Json | null
          revoked_at?: string | null
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_granted?: boolean | null
          metadata?: Json | null
          revoked_at?: string | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      marketing_rewards_history: {
        Row: {
          amount: number
          claimed_at: string | null
          clawback_reason: string | null
          clawed_back_at: string | null
          created_at: string | null
          description: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          reward_type: string
          source: string
          status: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          claimed_at?: string | null
          clawback_reason?: string | null
          clawed_back_at?: string | null
          created_at?: string | null
          description?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          reward_type: string
          source: string
          status?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          clawback_reason?: string | null
          clawed_back_at?: string | null
          created_at?: string | null
          description?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          reward_type?: string
          source?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_rewards_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      math_symbol_patterns: {
        Row: {
          confidence: number
          created_at: string
          id: string
          keywords: string[]
          symbols: Json
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          keywords: string[]
          symbols?: Json
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          keywords?: string[]
          symbols?: Json
        }
        Relationships: []
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
      metacognitive_development: {
        Row: {
          created_at: string | null
          development_trajectory: Json | null
          effective_prompts: Json | null
          evaluation_skills: Json | null
          help_seeking_appropriateness: number | null
          id: string
          impulse_control_score: number | null
          last_assessed: string | null
          monitoring_skills: Json | null
          persistence_score: number | null
          planning_skills: Json | null
          reflection_preferences: Json | null
          scaffolding_level_needed: number | null
          strategy_effectiveness: Json | null
          strategy_repertoire: Json | null
          strategy_selection_accuracy: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          development_trajectory?: Json | null
          effective_prompts?: Json | null
          evaluation_skills?: Json | null
          help_seeking_appropriateness?: number | null
          id?: string
          impulse_control_score?: number | null
          last_assessed?: string | null
          monitoring_skills?: Json | null
          persistence_score?: number | null
          planning_skills?: Json | null
          reflection_preferences?: Json | null
          scaffolding_level_needed?: number | null
          strategy_effectiveness?: Json | null
          strategy_repertoire?: Json | null
          strategy_selection_accuracy?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          development_trajectory?: Json | null
          effective_prompts?: Json | null
          evaluation_skills?: Json | null
          help_seeking_appropriateness?: number | null
          id?: string
          impulse_control_score?: number | null
          last_assessed?: string | null
          monitoring_skills?: Json | null
          persistence_score?: number | null
          planning_skills?: Json | null
          reflection_preferences?: Json | null
          scaffolding_level_needed?: number | null
          strategy_effectiveness?: Json | null
          strategy_repertoire?: Json | null
          strategy_selection_accuracy?: number | null
          user_id?: string
        }
        Relationships: []
      }
      misconception_database: {
        Row: {
          created_at: string | null
          description: string
          detection_accuracy: number | null
          id: string
          intervention_strategy: string
          misconception_code: string
          name: string
          skill_node_id: string | null
          trigger_patterns: Json
        }
        Insert: {
          created_at?: string | null
          description: string
          detection_accuracy?: number | null
          id?: string
          intervention_strategy: string
          misconception_code: string
          name: string
          skill_node_id?: string | null
          trigger_patterns: Json
        }
        Update: {
          created_at?: string | null
          description?: string
          detection_accuracy?: number | null
          id?: string
          intervention_strategy?: string
          misconception_code?: string
          name?: string
          skill_node_id?: string | null
          trigger_patterns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "misconception_database_skill_node_id_fkey"
            columns: ["skill_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      misconception_networks: {
        Row: {
          connected_misconceptions: string[] | null
          context_triggers: Json | null
          correction_attempts: Json | null
          created_at: string | null
          downstream_impacts: string[] | null
          evolution_pattern: Json | null
          id: string
          initial_manifestation: Json | null
          interfering_knowledge: Json | null
          intervention_history: Json | null
          last_manifested: string | null
          misconception_cluster_id: string
          persistence: number | null
          prerequisite_gaps: string[] | null
          recommended_approach: Json | null
          strength: number | null
          successful_corrections: Json | null
          user_id: string
        }
        Insert: {
          connected_misconceptions?: string[] | null
          context_triggers?: Json | null
          correction_attempts?: Json | null
          created_at?: string | null
          downstream_impacts?: string[] | null
          evolution_pattern?: Json | null
          id?: string
          initial_manifestation?: Json | null
          interfering_knowledge?: Json | null
          intervention_history?: Json | null
          last_manifested?: string | null
          misconception_cluster_id: string
          persistence?: number | null
          prerequisite_gaps?: string[] | null
          recommended_approach?: Json | null
          strength?: number | null
          successful_corrections?: Json | null
          user_id: string
        }
        Update: {
          connected_misconceptions?: string[] | null
          context_triggers?: Json | null
          correction_attempts?: Json | null
          created_at?: string | null
          downstream_impacts?: string[] | null
          evolution_pattern?: Json | null
          id?: string
          initial_manifestation?: Json | null
          interfering_knowledge?: Json | null
          intervention_history?: Json | null
          last_manifested?: string | null
          misconception_cluster_id?: string
          persistence?: number | null
          prerequisite_gaps?: string[] | null
          recommended_approach?: Json | null
          strength?: number | null
          successful_corrections?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      misconception_patterns: {
        Row: {
          correction_strategy: string | null
          created_at: string | null
          department: string
          description: string
          difficulty_adjustment: number | null
          feedback_template: string
          id: string
          is_active: boolean | null
          micro_skill: string
          misconception_id: string
        }
        Insert: {
          correction_strategy?: string | null
          created_at?: string | null
          department: string
          description: string
          difficulty_adjustment?: number | null
          feedback_template: string
          id?: string
          is_active?: boolean | null
          micro_skill: string
          misconception_id: string
        }
        Update: {
          correction_strategy?: string | null
          created_at?: string | null
          department?: string
          description?: string
          difficulty_adjustment?: number | null
          feedback_template?: string
          id?: string
          is_active?: boolean | null
          micro_skill?: string
          misconception_id?: string
        }
        Relationships: []
      }
      neural_repetition_schedule: {
        Row: {
          concept_id: string
          consolidation_stage: string | null
          context_variation_needed: boolean | null
          created_at: string | null
          difficulty_progression: Json | null
          forgetting_curve_params: Json | null
          id: string
          interference_susceptibility: number | null
          interval_history: Json | null
          last_exposure: string | null
          mastery_achieved: boolean | null
          memory_strength: number | null
          next_optimal_exposure: string | null
          repetition_count: number | null
          sleep_quality_impact: number | null
          stress_vulnerability: number | null
          updated_at: string | null
          urgency_score: number | null
          user_id: string
        }
        Insert: {
          concept_id: string
          consolidation_stage?: string | null
          context_variation_needed?: boolean | null
          created_at?: string | null
          difficulty_progression?: Json | null
          forgetting_curve_params?: Json | null
          id?: string
          interference_susceptibility?: number | null
          interval_history?: Json | null
          last_exposure?: string | null
          mastery_achieved?: boolean | null
          memory_strength?: number | null
          next_optimal_exposure?: string | null
          repetition_count?: number | null
          sleep_quality_impact?: number | null
          stress_vulnerability?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          user_id: string
        }
        Update: {
          concept_id?: string
          consolidation_stage?: string | null
          context_variation_needed?: boolean | null
          created_at?: string | null
          difficulty_progression?: Json | null
          forgetting_curve_params?: Json | null
          id?: string
          interference_susceptibility?: number | null
          interval_history?: Json | null
          last_exposure?: string | null
          mastery_achieved?: boolean | null
          memory_strength?: number | null
          next_optimal_exposure?: string | null
          repetition_count?: number | null
          sleep_quality_impact?: number | null
          stress_vulnerability?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          average_load_time_ms: number | null
          average_session_duration_minutes: number | null
          bounce_count: number
          bounce_rate: number | null
          created_at: string
          date: string
          device_stats: Json | null
          exit_count: number
          id: string
          platform_stats: Json | null
          route: string
          total_page_views: number
          total_session_duration_minutes: number
          unique_page_views: number
          updated_at: string
        }
        Insert: {
          average_load_time_ms?: number | null
          average_session_duration_minutes?: number | null
          bounce_count?: number
          bounce_rate?: number | null
          created_at?: string
          date: string
          device_stats?: Json | null
          exit_count?: number
          id?: string
          platform_stats?: Json | null
          route: string
          total_page_views?: number
          total_session_duration_minutes?: number
          unique_page_views?: number
          updated_at?: string
        }
        Update: {
          average_load_time_ms?: number | null
          average_session_duration_minutes?: number | null
          bounce_count?: number
          bounce_rate?: number | null
          created_at?: string
          date?: string
          device_stats?: Json | null
          exit_count?: number
          id?: string
          platform_stats?: Json | null
          route?: string
          total_page_views?: number
          total_session_duration_minutes?: number
          unique_page_views?: number
          updated_at?: string
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
          ai_tutorial_completed: boolean | null
          created_at: string
          current_level: number | null
          diagnosis_completed: boolean
          email: string
          first_lesson_completed: boolean | null
          id: string
          initial_level: string | null
          is_founding_member: boolean | null
          learner_profile: Json | null
          learning_goal: string | null
          level: number
          marketing_consent: boolean | null
          marketing_consent_at: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone_e164: string | null
          phone_verified_at: string | null
          referral_code: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_tutorial_completed?: boolean | null
          created_at?: string
          current_level?: number | null
          diagnosis_completed?: boolean
          email: string
          first_lesson_completed?: boolean | null
          id?: string
          initial_level?: string | null
          is_founding_member?: boolean | null
          learner_profile?: Json | null
          learning_goal?: string | null
          level?: number
          marketing_consent?: boolean | null
          marketing_consent_at?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone_e164?: string | null
          phone_verified_at?: string | null
          referral_code?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_tutorial_completed?: boolean | null
          created_at?: string
          current_level?: number | null
          diagnosis_completed?: boolean
          email?: string
          first_lesson_completed?: boolean | null
          id?: string
          initial_level?: string | null
          is_founding_member?: boolean | null
          learner_profile?: Json | null
          learning_goal?: string | null
          level?: number
          marketing_consent?: boolean | null
          marketing_consent_at?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone_e164?: string | null
          phone_verified_at?: string | null
          referral_code?: string | null
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
      referral_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          referral_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          referral_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
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
          activated_at: string | null
          converted_at: string | null
          created_at: string
          device_hash: string | null
          id: string
          ip: unknown | null
          notes: Json | null
          phone_hash: string | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          risk_score: number | null
          stage: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          converted_at?: string | null
          created_at?: string
          device_hash?: string | null
          id?: string
          ip?: unknown | null
          notes?: Json | null
          phone_hash?: string | null
          referral_code: string
          referred_user_id: string
          referrer_id: string
          risk_score?: number | null
          stage?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          converted_at?: string | null
          created_at?: string
          device_hash?: string | null
          id?: string
          ip?: unknown | null
          notes?: Json | null
          phone_hash?: string | null
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          risk_score?: number | null
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward_catalog: {
        Row: {
          active: boolean
          cost_points: number
          created_at: string
          id: string
          slug: string
          title: string
        }
        Insert: {
          active?: boolean
          cost_points?: number
          created_at?: string
          id?: string
          slug: string
          title: string
        }
        Update: {
          active?: boolean
          cost_points?: number
          created_at?: string
          id?: string
          slug?: string
          title?: string
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
      rewards: {
        Row: {
          amount: number
          consumed_at: string | null
          created_at: string
          id: string
          kind: string
          meta: Json | null
          released_at: string | null
          source: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          consumed_at?: string | null
          created_at?: string
          id?: string
          kind: string
          meta?: Json | null
          released_at?: string | null
          source: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          consumed_at?: string | null
          created_at?: string
          id?: string
          kind?: string
          meta?: Json | null
          released_at?: string | null
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
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
            foreignKeyName: "skill_mastery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      skill_math_symbols: {
        Row: {
          created_at: string
          id: string
          panel_symbols: Json
          quick_symbols: Json
          skill_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          panel_symbols?: Json
          quick_symbols?: Json
          skill_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          panel_symbols?: Json
          quick_symbols?: Json
          skill_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_misconception_patterns: {
        Row: {
          created_at: string
          description: string
          difficulty_adjustment: number | null
          example_error: string
          frequency_weight: number | null
          id: string
          intervention_strategy: string
          is_active: boolean
          pattern_code: string
          skill_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_adjustment?: number | null
          example_error: string
          frequency_weight?: number | null
          id?: string
          intervention_strategy: string
          is_active?: boolean
          pattern_code: string
          skill_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_adjustment?: number | null
          example_error?: string
          frequency_weight?: number | null
          id?: string
          intervention_strategy?: string
          is_active?: boolean
          pattern_code?: string
          skill_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_prerequisites: {
        Row: {
          created_at: string | null
          id: string
          is_hard_requirement: boolean | null
          prerequisite_skill_id: string
          required_mastery_level: number | null
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_hard_requirement?: boolean | null
          prerequisite_skill_id: string
          required_mastery_level?: number | null
          skill_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_hard_requirement?: boolean | null
          prerequisite_skill_id?: string
          required_mastery_level?: number | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_prerequisites_prerequisite_skill_id_fkey"
            columns: ["prerequisite_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_prerequisites_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
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
      skill_real_world_applications: {
        Row: {
          age_group: string
          connection_explanation: string
          context: string
          created_at: string
          difficulty_level: number
          id: string
          is_active: boolean
          problem_description: string
          skill_id: string
          updated_at: string
        }
        Insert: {
          age_group: string
          connection_explanation: string
          context: string
          created_at?: string
          difficulty_level?: number
          id?: string
          is_active?: boolean
          problem_description: string
          skill_id: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          connection_explanation?: string
          context?: string
          created_at?: string
          difficulty_level?: number
          id?: string
          is_active?: boolean
          problem_description?: string
          skill_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          chapter_tag: string | null
          class_level: number
          class_level_text: string | null
          created_at: string
          department: string
          description: string | null
          difficulty_rating: number | null
          estimated_time_minutes: number | null
          generator_params: Json | null
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          learning_objectives: Json | null
          level: string
          men_code: string | null
          name: string
          phases: Json | null
          prerequisites: string[] | null
          school_type: string | null
          teaching_flow: Json | null
          updated_at: string
        }
        Insert: {
          chapter_tag?: string | null
          class_level?: number
          class_level_text?: string | null
          created_at?: string
          department: string
          description?: string | null
          difficulty_rating?: number | null
          estimated_time_minutes?: number | null
          generator_params?: Json | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          learning_objectives?: Json | null
          level?: string
          men_code?: string | null
          name: string
          phases?: Json | null
          prerequisites?: string[] | null
          school_type?: string | null
          teaching_flow?: Json | null
          updated_at?: string
        }
        Update: {
          chapter_tag?: string | null
          class_level?: number
          class_level_text?: string | null
          created_at?: string
          department?: string
          description?: string | null
          difficulty_rating?: number | null
          estimated_time_minutes?: number | null
          generator_params?: Json | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          learning_objectives?: Json | null
          level?: string
          men_code?: string | null
          name?: string
          phases?: Json | null
          prerequisites?: string[] | null
          school_type?: string | null
          teaching_flow?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_verifications: {
        Row: {
          attempts: number | null
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          max_attempts: number | null
          phone_e164: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          max_attempts?: number | null
          phone_e164: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number | null
          phone_e164?: string
          user_id?: string
          verified_at?: string | null
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
      spaced_repetition_cards: {
        Row: {
          created_at: string | null
          ease_factor: number | null
          id: string
          interval_days: number | null
          last_reviewed_at: string | null
          mastery_level: number | null
          next_review_at: string
          predicted_retention: number | null
          repetition_count: number | null
          review_history: Json | null
          skill_node_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_at: string
          predicted_retention?: number | null
          repetition_count?: number | null
          review_history?: Json | null
          skill_node_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_at?: string
          predicted_retention?: number | null
          repetition_count?: number | null
          review_history?: Json | null
          skill_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_cards_skill_node_id_fkey"
            columns: ["skill_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
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
          duration_minutes: number | null
          early_reveals: number | null
          hints_used: number | null
          id: string
          initialized: boolean | null
          last_summarized_sequence: number | null
          mastery_score: number | null
          pseudo_activity_strikes: number | null
          session_type: string
          skill_id: string | null
          started_at: string
          status: string
          summary_compact: string | null
          summary_state: Json | null
          summary_updated_at: string | null
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
          duration_minutes?: number | null
          early_reveals?: number | null
          hints_used?: number | null
          id?: string
          initialized?: boolean | null
          last_summarized_sequence?: number | null
          mastery_score?: number | null
          pseudo_activity_strikes?: number | null
          session_type?: string
          skill_id?: string | null
          started_at?: string
          status?: string
          summary_compact?: string | null
          summary_state?: Json | null
          summary_updated_at?: string | null
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
          duration_minutes?: number | null
          early_reveals?: number | null
          hints_used?: number | null
          id?: string
          initialized?: boolean | null
          last_summarized_sequence?: number | null
          mastery_score?: number | null
          pseudo_activity_strikes?: number | null
          session_type?: string
          skill_id?: string | null
          started_at?: string
          status?: string
          summary_compact?: string | null
          summary_state?: Json | null
          summary_updated_at?: string | null
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
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          monthly_price_cents: number
          plan_type: string
          token_limit_hard: number
          token_limit_soft: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price_cents?: number
          plan_type: string
          token_limit_hard: number
          token_limit_soft: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price_cents?: number
          plan_type?: string
          token_limit_hard?: number
          token_limit_soft?: number
          updated_at?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          question_text: string | null
          response_text: string | null
          response_value: Json | null
          sentiment_score: number | null
          survey_id: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          question_text?: string | null
          response_text?: string | null
          response_value?: Json | null
          sentiment_score?: number | null
          survey_id: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          question_text?: string | null
          response_text?: string | null
          response_value?: Json | null
          sentiment_score?: number | null
          survey_id?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "user_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "survey_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_templates: {
        Row: {
          created_at: string
          description: string | null
          display_rules: Json | null
          id: string
          is_active: boolean
          max_frequency_days: number | null
          name: string
          priority: number | null
          questions: Json
          survey_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_rules?: Json | null
          id?: string
          is_active?: boolean
          max_frequency_days?: number | null
          name: string
          priority?: number | null
          questions?: Json
          survey_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_rules?: Json | null
          id?: string
          is_active?: boolean
          max_frequency_days?: number | null
          name?: string
          priority?: number | null
          questions?: Json
          survey_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_definitions: {
        Row: {
          created_at: string
          department: string
          difficulty: number
          expected_answer: string
          id: string
          is_active: boolean
          latex_content: string
          micro_skill: string
          misconception_map: Json
          skill_id: string | null
          skill_name: string
          source_type: string
        }
        Insert: {
          created_at?: string
          department: string
          difficulty: number
          expected_answer: string
          id?: string
          is_active?: boolean
          latex_content: string
          micro_skill: string
          misconception_map?: Json
          skill_id?: string | null
          skill_name: string
          source_type?: string
        }
        Update: {
          created_at?: string
          department?: string
          difficulty?: number
          expected_answer?: string
          id?: string
          is_active?: boolean
          latex_content?: string
          micro_skill?: string
          misconception_map?: Json
          skill_id?: string | null
          skill_name?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_definitions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      token_limit_exceeded_logs: {
        Row: {
          account_limit: number | null
          attempted_tokens: number | null
          context_size: number | null
          conversation_length: number | null
          created_at: string
          enriched_context_enabled: boolean | null
          id: string
          session_id: string | null
          skill_id: string | null
          subscription_type: string | null
          timestamp: string
          tokens_used_total: number | null
          user_id: string | null
          user_message: string | null
        }
        Insert: {
          account_limit?: number | null
          attempted_tokens?: number | null
          context_size?: number | null
          conversation_length?: number | null
          created_at?: string
          enriched_context_enabled?: boolean | null
          id?: string
          session_id?: string | null
          skill_id?: string | null
          subscription_type?: string | null
          timestamp?: string
          tokens_used_total?: number | null
          user_id?: string | null
          user_message?: string | null
        }
        Update: {
          account_limit?: number | null
          attempted_tokens?: number | null
          context_size?: number | null
          conversation_length?: number | null
          created_at?: string
          enriched_context_enabled?: boolean | null
          id?: string
          session_id?: string | null
          skill_id?: string | null
          subscription_type?: string | null
          timestamp?: string
          tokens_used_total?: number | null
          user_id?: string | null
          user_message?: string | null
        }
        Relationships: []
      }
      unified_learning_sessions: {
        Row: {
          ai_model_used: string | null
          completed_at: string | null
          concepts_learned: Json | null
          context_switches: number | null
          correct_answers: number | null
          created_at: string
          department: string | null
          difficulty_adjustments: Json | null
          difficulty_level: number | null
          engagement_score: number | null
          explanation_style_used: string | null
          frustration_incidents: number | null
          hints_used: number | null
          id: string
          learning_momentum: number | null
          learning_path: Json | null
          misconceptions_addressed: Json | null
          next_session_recommendations: Json | null
          profile_id: string
          session_type: string
          skill_focus: string | null
          started_at: string
          tasks_completed: number | null
          total_response_time_ms: number | null
          total_tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          completed_at?: string | null
          concepts_learned?: Json | null
          context_switches?: number | null
          correct_answers?: number | null
          created_at?: string
          department?: string | null
          difficulty_adjustments?: Json | null
          difficulty_level?: number | null
          engagement_score?: number | null
          explanation_style_used?: string | null
          frustration_incidents?: number | null
          hints_used?: number | null
          id?: string
          learning_momentum?: number | null
          learning_path?: Json | null
          misconceptions_addressed?: Json | null
          next_session_recommendations?: Json | null
          profile_id: string
          session_type?: string
          skill_focus?: string | null
          started_at?: string
          tasks_completed?: number | null
          total_response_time_ms?: number | null
          total_tokens_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          completed_at?: string | null
          concepts_learned?: Json | null
          context_switches?: number | null
          correct_answers?: number | null
          created_at?: string
          department?: string | null
          difficulty_adjustments?: Json | null
          difficulty_level?: number | null
          engagement_score?: number | null
          explanation_style_used?: string | null
          frustration_incidents?: number | null
          hints_used?: number | null
          id?: string
          learning_momentum?: number | null
          learning_path?: Json | null
          misconceptions_addressed?: Json | null
          next_session_recommendations?: Json | null
          profile_id?: string
          session_type?: string
          skill_focus?: string | null
          started_at?: string
          tasks_completed?: number | null
          total_response_time_ms?: number | null
          total_tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_learning_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "universal_learner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_skill_content: {
        Row: {
          content_data: Json
          created_at: string
          id: string
          is_complete: boolean
          metadata: Json
          skill_id: string
          updated_at: string
          version: number
        }
        Insert: {
          content_data?: Json
          created_at?: string
          id?: string
          is_complete?: boolean
          metadata?: Json
          skill_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          content_data?: Json
          created_at?: string
          id?: string
          is_complete?: boolean
          metadata?: Json
          skill_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      universal_learner_profiles: {
        Row: {
          class_level: number | null
          concepts_mastered: number | null
          created_at: string
          current_learning_context: Json | null
          diagnostic_summary: Json | null
          difficulty_multiplier: number | null
          engagement_triggers: Json | null
          error_patterns: Json | null
          frustration_threshold: number | null
          id: string
          last_diagnostic_at: string | null
          last_interaction_summary: Json | null
          learning_style: Json | null
          learning_velocity: number | null
          micro_skill_strengths: Json | null
          next_recommended_action: Json | null
          optimal_difficulty_range: Json | null
          preferred_explanation_style: string | null
          prerequisite_gaps: Json | null
          response_patterns: Json | null
          retention_rate: number | null
          sessions_completed: number | null
          skill_mastery_map: Json | null
          total_learning_time_minutes: number | null
          track: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class_level?: number | null
          concepts_mastered?: number | null
          created_at?: string
          current_learning_context?: Json | null
          diagnostic_summary?: Json | null
          difficulty_multiplier?: number | null
          engagement_triggers?: Json | null
          error_patterns?: Json | null
          frustration_threshold?: number | null
          id?: string
          last_diagnostic_at?: string | null
          last_interaction_summary?: Json | null
          learning_style?: Json | null
          learning_velocity?: number | null
          micro_skill_strengths?: Json | null
          next_recommended_action?: Json | null
          optimal_difficulty_range?: Json | null
          preferred_explanation_style?: string | null
          prerequisite_gaps?: Json | null
          response_patterns?: Json | null
          retention_rate?: number | null
          sessions_completed?: number | null
          skill_mastery_map?: Json | null
          total_learning_time_minutes?: number | null
          track?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class_level?: number | null
          concepts_mastered?: number | null
          created_at?: string
          current_learning_context?: Json | null
          diagnostic_summary?: Json | null
          difficulty_multiplier?: number | null
          engagement_triggers?: Json | null
          error_patterns?: Json | null
          frustration_threshold?: number | null
          id?: string
          last_diagnostic_at?: string | null
          last_interaction_summary?: Json | null
          learning_style?: Json | null
          learning_velocity?: number | null
          micro_skill_strengths?: Json | null
          next_recommended_action?: Json | null
          optimal_difficulty_range?: Json | null
          preferred_explanation_style?: string | null
          prerequisite_gaps?: Json | null
          response_patterns?: Json | null
          retention_rate?: number | null
          sessions_completed?: number | null
          skill_mastery_map?: Json | null
          total_learning_time_minutes?: number | null
          track?: string | null
          updated_at?: string
          user_id?: string
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
      user_referral_stats: {
        Row: {
          available_points: number
          created_at: string
          current_tier: string
          free_months_earned: number
          id: string
          milestone_rewards_claimed: number[] | null
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
          milestone_rewards_claimed?: number[] | null
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
          milestone_rewards_claimed?: number[] | null
          successful_referrals?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_session_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          duration_minutes: number | null
          ended_at: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          is_bounce: boolean | null
          pages_visited: number
          referrer: string | null
          session_id: string
          started_at: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_bounce?: boolean | null
          pages_visited?: number
          referrer?: string | null
          session_id: string
          started_at: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_bounce?: boolean | null
          pages_visited?: number
          referrer?: string | null
          session_id?: string
          started_at?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
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
      user_subscriptions: {
        Row: {
          billing_cycle_start: string | null
          created_at: string
          id: string
          monthly_tokens_used: number | null
          status: string
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_type: string
          token_limit_hard: number
          token_limit_soft: number
          tokens_used_total: number
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle_start?: string | null
          created_at?: string
          id?: string
          monthly_tokens_used?: number | null
          status?: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_type?: string
          token_limit_hard?: number
          token_limit_soft?: number
          tokens_used_total?: number
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle_start?: string | null
          created_at?: string
          id?: string
          monthly_tokens_used?: number | null
          status?: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_type?: string
          token_limit_hard?: number
          token_limit_soft?: number
          tokens_used_total?: number
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_surveys: {
        Row: {
          completed_at: string | null
          context: Json | null
          created_at: string
          dismissed_at: string | null
          displayed_at: string | null
          id: string
          metadata: Json | null
          scheduled_for: string | null
          status: string
          survey_type: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          dismissed_at?: string | null
          displayed_at?: string | null
          id?: string
          metadata?: Json | null
          scheduled_for?: string | null
          status?: string
          survey_type: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          dismissed_at?: string | null
          displayed_at?: string | null
          id?: string
          metadata?: Json | null
          scheduled_for?: string | null
          status?: string
          survey_type?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      validation_logs: {
        Row: {
          confidence: number
          created_at: string
          detected_misconception: string | null
          hints_used: number | null
          id: string
          is_correct: boolean
          response_time: number | null
          session_id: string | null
          session_type: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          detected_misconception?: string | null
          hints_used?: number | null
          id?: string
          is_correct: boolean
          response_time?: number | null
          session_id?: string | null
          session_type: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          detected_misconception?: string | null
          hints_used?: number | null
          id?: string
          is_correct?: boolean
          response_time?: number | null
          session_id?: string | null
          session_type?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "unified_learning_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_definitions"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_risk_score: {
        Args: {
          p_device_is_duplicate?: boolean
          p_ip_is_vpn?: boolean
          p_learning_time_minutes?: number
          p_onboarding_completed?: boolean
          p_phone_is_voip?: boolean
          p_phone_verified?: boolean
          p_user_id: string
        }
        Returns: number
      }
      check_admin_rate_limit: {
        Args: {
          p_action_type: string
          p_max_attempts?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_security_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_social_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      cleanup_analytics_cache: {
        Args: Record<PropertyKey, never>
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
      get_due_cards_for_user: {
        Args: { target_user_id: string }
        Returns: {
          card_id: string
          mastery_level: number
          next_review_at: string
          skill_node_id: string
        }[]
      }
      get_due_surveys_for_user: {
        Args: { target_user_id: string }
        Returns: {
          context: Json
          description: string
          questions: Json
          survey_id: string
          survey_type: string
          title: string
        }[]
      }
      get_founding_members_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_learning_analytics: {
        Args: { target_user_id?: string }
        Returns: {
          accuracy_rate: number
          completed_at: string
          correct_answers: number
          department: string
          difficulty_level: number
          difficulty_multiplier: number
          engagement_score: number
          learning_momentum: number
          learning_velocity: number
          preferred_explanation_style: string
          session_duration_minutes: number
          session_type: string
          started_at: string
          tasks_completed: number
          total_tokens_used: number
          user_id: string
        }[]
      }
      get_user_learning_profile: {
        Args: { target_user_id: string }
        Returns: {
          attention_span_minutes: number
          cognitive_load_threshold: number
          current_energy_level: number
          optimal_session_length_minutes: number
          processing_speed_percentile: number
          user_id: string
          working_memory_span: number
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_subscription_limits: {
        Args: { target_user_id: string }
        Returns: {
          status: string
          subscription_type: string
          token_limit_hard: number
          token_limit_soft: number
          tokens_used_total: number
        }[]
      }
      get_user_total_token_usage: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_virtual_spots_left: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_weekly_benchmarks: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: number; _user_id: string }
        Returns: boolean
      }
      migrate_existing_marketing_consents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resume_lesson_summary: {
        Args: { p_skill_id: string; p_user_id: string }
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
      update_referral_stats_v2: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
