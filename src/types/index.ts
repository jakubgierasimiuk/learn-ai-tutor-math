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