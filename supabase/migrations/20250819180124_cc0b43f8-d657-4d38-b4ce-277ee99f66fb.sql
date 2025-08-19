-- Fix security issues identified by linter

-- Fix 1: Drop and recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS public.learning_analytics;

CREATE VIEW public.learning_analytics AS
SELECT 
  uls.user_id,
  uls.session_type,
  uls.department,
  uls.difficulty_level,
  uls.tasks_completed,
  uls.correct_answers,
  CASE 
    WHEN uls.tasks_completed > 0 
    THEN uls.correct_answers::NUMERIC / uls.tasks_completed 
    ELSE 0 
  END as accuracy_rate,
  uls.engagement_score,
  uls.learning_momentum,
  uls.total_tokens_used,
  uls.started_at,
  uls.completed_at,
  EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at))/60 as session_duration_minutes,
  ulp.learning_velocity,
  ulp.difficulty_multiplier,
  ulp.preferred_explanation_style
FROM public.unified_learning_sessions uls
LEFT JOIN public.universal_learner_profiles ulp ON ulp.user_id = uls.user_id
WHERE uls.completed_at IS NOT NULL;

-- Add RLS to the view
ALTER VIEW public.learning_analytics SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view their own learning analytics" 
ON public.learning_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix 2: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_learner_profile_from_session()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update total learning time and session count
  UPDATE public.universal_learner_profiles 
  SET 
    total_learning_time_minutes = total_learning_time_minutes + 
      COALESCE(EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60, 0),
    sessions_completed = sessions_completed + 1,
    concepts_mastered = concepts_mastered + 
      COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
    last_interaction_summary = jsonb_build_object(
      'session_type', NEW.session_type,
      'performance', NEW.engagement_score,
      'concepts_learned', COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
      'duration_minutes', EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60
    ),
    current_learning_context = jsonb_build_object(
      'last_skill', NEW.skill_focus,
      'last_department', NEW.department,
      'current_difficulty', NEW.difficulty_level,
      'momentum', NEW.learning_momentum
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Fix 3: Update existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_learner_profile_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.learner_profile = jsonb_set(
    COALESCE(NEW.learner_profile, '{}'::jsonb),
    '{last_updated}',
    to_jsonb(NOW()::text)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_referral_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  successful_count INTEGER;
  total_points INTEGER;
  available_points INTEGER;
  free_months INTEGER;
  tier TEXT;
BEGIN
  -- Count successful referrals
  SELECT COUNT(*) INTO successful_count
  FROM referrals
  WHERE referrer_id = p_user_id AND status = 'completed';
  
  -- Calculate free months based on referrals
  IF successful_count >= 10 THEN
    free_months := 5;
  ELSIF successful_count >= 5 THEN
    free_months := 2;
  ELSIF successful_count >= 2 THEN
    free_months := 1;
  ELSE
    free_months := 0;
  END IF;
  
  -- Calculate points (1 point per referral above 10)
  IF successful_count > 10 THEN
    total_points := successful_count - 10;
  ELSE
    total_points := 0;
  END IF;
  
  -- Calculate available points (subtract spent points)
  SELECT COALESCE(total_points - COALESCE(SUM(points_spent), 0), total_points) 
  INTO available_points
  FROM reward_claims
  WHERE user_id = p_user_id AND status != 'cancelled';
  
  -- Determine tier
  IF successful_count >= 20 THEN
    tier := 'legend';
  ELSIF successful_count >= 10 THEN
    tier := 'ambassador';
  ELSIF successful_count >= 5 THEN
    tier := 'promoter';
  ELSIF successful_count >= 2 THEN
    tier := 'advocate';
  ELSE
    tier := 'beginner';
  END IF;
  
  -- Upsert stats
  INSERT INTO user_referral_stats (
    user_id, successful_referrals, total_points, available_points, 
    free_months_earned, current_tier, updated_at
  )
  VALUES (
    p_user_id, successful_count, total_points, available_points,
    free_months, tier, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    successful_referrals = EXCLUDED.successful_referrals,
    total_points = EXCLUDED.total_points,
    available_points = EXCLUDED.available_points,
    free_months_earned = EXCLUDED.free_months_earned,
    current_tier = EXCLUDED.current_tier,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_record RECORD;
  user_stats RECORD;
  avg_score NUMERIC;
  current_streak INTEGER;
BEGIN
  -- Get user statistics
  SELECT 
    COALESCE(p.total_points, 0) as total_points,
    COUNT(DISTINCT ulp.lesson_id) as lessons_completed,
    COUNT(DISTINCT ulp.topic_id) as topics_with_lessons
  INTO user_stats
  FROM profiles p
  LEFT JOIN user_lesson_progress ulp ON ulp.user_id = p.user_id AND ulp.status = 'completed'
  WHERE p.user_id = p_user_id
  GROUP BY p.total_points;

  -- Get average score from recent lessons
  SELECT AVG(score) INTO avg_score
  FROM user_lesson_progress
  WHERE user_id = p_user_id 
    AND status = 'completed' 
    AND score IS NOT NULL
    AND completed_at >= NOW() - INTERVAL '30 days'
  LIMIT 3;

  -- Get current streak
  SELECT COALESCE(current_streak, 0) INTO current_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Check each achievement
  FOR achievement_record IN 
    SELECT a.* FROM achievements a
    WHERE a.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Check if user meets achievement conditions
    IF (achievement_record.condition_type = 'points' AND user_stats.total_points >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'lessons_completed' AND user_stats.lessons_completed >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'score_average' AND avg_score >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'streak' AND current_streak >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'topics_mastered' AND user_stats.topics_with_lessons >= achievement_record.condition_value)
    THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (p_user_id, achievement_record.id);
      
      -- Award bonus points
      UPDATE profiles 
      SET total_points = total_points + achievement_record.points_reward
      WHERE user_id = p_user_id;
      
      -- Log points
      INSERT INTO points_history (user_id, points, reason)
      VALUES (p_user_id, achievement_record.points_reward, 'Osiągnięcie: ' || achievement_record.name);
    END IF;
  END LOOP;
END;
$$;