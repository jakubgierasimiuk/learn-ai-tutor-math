// Referral system types
export interface ReferralStats {
  successful_referrals: number;
  total_points: number;
  available_points: number;
  free_months_earned: number;
  current_tier: TierType;
  updated_at?: string;
  created_at?: string;
}

export type TierType = 'beginner' | 'advocate' | 'promoter' | 'ambassador' | 'legend';

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: string;
  image_url?: string;
  is_active: boolean;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  status: 'pending' | 'trial' | 'completed' | 'expired';
  trial_started_at?: string;
  subscription_activated_at?: string;
  created_at: string;
  updated_at: string;
}

// User and Profile types
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  level: number;
  total_points: number;
  diagnosis_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_points: number;
  lessons_completed: number;
  current_streak: number;
  level: number;
}

// Learning types
export interface Topic {
  id: number;
  name: string;
  description?: string;
  category: string;
  difficulty_level: number;
  estimated_time_minutes?: number;
  learning_objectives: string[];
  prerequisites?: string[];
  is_active: boolean;
  created_at: string;
}

export interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  description?: string;
  content_type: 'theory' | 'practice' | 'quiz' | 'video';
  content_data: Record<string, any>;
  lesson_order: number;
  estimated_time_minutes?: number;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: number;
  user_id: string;
  lesson_id: number;
  topic_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  score?: number;
  time_spent_minutes: number;
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

// Gamification types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
  points_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

// Social types
export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  join_code: string;
  is_public: boolean;
  max_members?: number;
  created_by: string;
  member_count?: number;
  is_member?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  created_by: string;
  challenged_user: string;
  topic_id: number;
  difficulty_level: number;
  status: 'pending' | 'completed' | 'expired';
  challenger_score?: number;
  challenged_score?: number;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Extended fields for UI
  challenger_name?: string;
  challenged_name?: string;
  topic_name?: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly';
  period_start: string;
  total_points: number;
  lessons_completed: number;
  challenges_won: number;
  position?: number;
  name?: string;
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  lessons_completed: number;
  points_earned: number;
  total_time_minutes: number;
  topics_practiced: number;
  average_accuracy?: number;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  id: string;
  user_id: string;
  session_id: number;
  topic_id: number;
  duration_minutes: number;
  questions_answered: number;
  correct_answers: number;
  hints_used: number;
  mistakes_made: number;
  completion_rate: number;
  engagement_score: number;
  created_at: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  session_id: number;
  timestamp: string;
}

export interface LessonSession {
  id: number;
  user_id: string;
  topic_id: number;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  points_earned?: number;
  had_confusion: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  total_pages: number;
}

// Form types
export interface AuthFormData {
  email: string;
  password?: string;
}

export interface CreateGroupForm {
  name: string;
  description: string;
  is_public: boolean;
}

export interface CreateChallengeForm {
  title: string;
  description: string;
  challenged_user: string;
  topic_id: string;
  difficulty_level: number;
}

export interface RewardClaimForm {
  rewardId: string;
  deliveryInfo: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
  };
}

// Study & Learn Module Types
export interface Skill {
  id: string;
  name: string;
  description?: string;
  department: string; // 'algebra', 'geometry', 'trigonometry', etc.
  level: 'basic' | 'extended';
  class_level: number; // 1-4 (liceum)
  prerequisites?: string[]; // array of skill UUIDs
  estimated_time_minutes: number;
  difficulty_rating: number; // 1-5
  men_code?: string; // official MEN curriculum code
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillProgress {
  id: string;
  user_id: string;
  skill_id: string;
  mastery_level: number; // 0-5 (Leitner boxes)
  last_reviewed_at?: string;
  next_review_at?: string;
  total_attempts: number;
  correct_attempts: number;
  consecutive_correct: number;
  difficulty_multiplier: number;
  is_mastered: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  skill_id: string;
  session_type: 'lesson' | 'diagnostic' | 'review' | 'quiz';
  status: 'in_progress' | 'completed' | 'abandoned';
  total_steps: number;
  completed_steps: number;
  hints_used: number;
  early_reveals: number; // "Pokaż rozwiązanie" clicks
  pseudo_activity_strikes: number;
  average_response_time_ms?: number;
  mastery_score?: number; // final assessment 0-100
  ai_model_used: string;
  total_tokens_used: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface LessonStep {
  id: string;
  session_id: string;
  step_number: number;
  step_type: 'question' | 'explanation' | 'hint' | 'solution';
  ai_prompt?: string;
  ai_response?: string;
  user_input?: string;
  is_correct?: boolean;
  response_time_ms?: number;
  tokens_used: number;
  created_at: string;
}

export interface DiagnosticTest {
  id: string;
  user_id: string;
  skill_id: string;
  test_type: 'pre_lesson' | 'recheck';
  questions_data: any; // JSONB array of questions and answers
  total_questions: number;
  correct_answers: number;
  final_score?: number; // 0-100
  estimated_mastery_level?: number; // 0-5 for Leitner
  completed_at?: string;
  created_at: string;
}

export interface UserDailyLimit {
  id: string;
  user_id: string;
  date: string;
  tokens_used: number;
  soft_limit: number;
  hard_limit: number;
  sessions_count: number;
  created_at: string;
}

export interface MathValidationCache {
  id: string;
  expression_hash: string;
  input_expression: string;
  validation_result?: any;
  is_correct?: boolean;
  error_message?: string;
  cached_at: string;
}

// Study Dashboard Types
export interface DepartmentProgress {
  department: string;
  total_skills: number;
  mastered_skills: number;
  in_progress_skills: number;
  mastery_percentage: number;
}

export interface StudyReport {
  skill_id: string;
  skill_name: string;
  status: 'mastered' | 'in_progress' | 'to_review';
  mastery_level: number;
  last_reviewed?: string;
  next_review?: string;
}