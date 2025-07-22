-- Napraw krytyczne problemy bezpieczeństwa RLS

-- Włącz RLS na wszystkich tabelach w public schema
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Napraw funkcje bezpieczeństwa - dodaj security definer i search_path
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  streak_record RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, today_date);
  ELSE
    -- Update existing streak
    IF streak_record.last_activity_date = today_date THEN
      -- Already counted today, do nothing
      RETURN;
    ELSIF streak_record.last_activity_date = today_date - 1 THEN
      -- Consecutive day, increment streak
      UPDATE user_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = today_date
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE user_streaks
      SET current_streak = 1,
          last_activity_date = today_date
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, trunc(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_leaderboard(p_user_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    current_week DATE;
    current_month DATE;
BEGIN
    current_week := date_trunc('week', CURRENT_DATE)::DATE;
    current_month := date_trunc('month', CURRENT_DATE)::DATE;
    
    -- Update weekly leaderboard
    INSERT INTO leaderboards (user_id, period_type, period_start, total_points)
    VALUES (p_user_id, 'weekly', current_week, p_points)
    ON CONFLICT (user_id, period_type, period_start)
    DO UPDATE SET 
        total_points = leaderboards.total_points + p_points,
        updated_at = now();
    
    -- Update monthly leaderboard
    INSERT INTO leaderboards (user_id, period_type, period_start, total_points)
    VALUES (p_user_id, 'monthly', current_month, p_points)
    ON CONFLICT (user_id, period_type, period_start)
    DO UPDATE SET 
        total_points = leaderboards.total_points + p_points,
        updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_social_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
BEGIN
    -- Get user social statistics
    SELECT 
        COUNT(DISTINCT c1.id) as challenges_sent,
        COUNT(DISTINCT c2.id) as challenges_won,
        COUNT(DISTINCT sgm.group_id) as groups_joined,
        COUNT(DISTINCT sp.session_id) as group_sessions
    INTO user_stats
    FROM profiles p
    LEFT JOIN challenges c1 ON c1.created_by = p.user_id
    LEFT JOIN challenges c2 ON c2.challenged_user = p.user_id AND c2.status = 'completed' AND c2.challenged_score > c2.challenger_score
    LEFT JOIN study_group_members sgm ON sgm.user_id = p.user_id
    LEFT JOIN session_participants sp ON sp.user_id = p.user_id
    WHERE p.user_id = p_user_id
    GROUP BY p.user_id;

    -- Check each social achievement
    FOR achievement_record IN 
        SELECT sa.* FROM social_achievements sa
        WHERE sa.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = sa.id
        )
    LOOP
        -- Check if user meets achievement conditions
        IF (achievement_record.achievement_type = 'challenges_sent' AND user_stats.challenges_sent >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'challenges_won' AND user_stats.challenges_won >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'groups_joined' AND user_stats.groups_joined >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'group_sessions' AND user_stats.group_sessions >= achievement_record.requirement_value)
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
            VALUES (p_user_id, achievement_record.points_reward, 'Osiągnięcie społecznościowe: ' || achievement_record.name);
            
            -- Update leaderboard
            PERFORM update_leaderboard(p_user_id, achievement_record.points_reward);
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_random_id()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN FLOOR(RANDOM() * 2147483647)::INTEGER;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', ''));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;