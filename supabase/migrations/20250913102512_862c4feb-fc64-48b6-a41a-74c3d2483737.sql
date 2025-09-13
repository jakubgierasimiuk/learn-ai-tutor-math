-- Fix remaining functions that don't have search_path set

CREATE OR REPLACE FUNCTION public.update_learning_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.resume_lesson_summary(p_skill_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  interaction_count INTEGER;
  summary_data JSONB;
BEGIN
  -- Get interaction count for this skill
  SELECT COUNT(*) INTO interaction_count
  FROM learning_interactions li
  JOIN study_sessions ss ON li.session_id = ss.id
  WHERE ss.skill_id = p_skill_id 
    AND ss.user_id = p_user_id;
    
  -- Return basic summary structure
  summary_data := jsonb_build_object(
    'interaction_count', interaction_count,
    'skill_id', p_skill_id,
    'user_id', p_user_id,
    'needs_ai_summary', CASE WHEN interaction_count >= 5 THEN true ELSE false END
  );
  
  RETURN summary_data;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_due_cards_for_user(target_user_id uuid)
RETURNS TABLE(card_id uuid, skill_node_id uuid, next_review_at timestamp with time zone, mastery_level numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        src.id,
        src.skill_node_id,
        src.next_review_at,
        src.mastery_level
    FROM spaced_repetition_cards src
    WHERE src.user_id = target_user_id 
    AND src.next_review_at <= NOW();
$$;

CREATE OR REPLACE FUNCTION public.get_weekly_benchmarks()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  WITH last7 AS (
    SELECT total_time_minutes, lessons_completed, average_accuracy
    FROM daily_stats
    WHERE date >= CURRENT_DATE - INTERVAL '6 days'
  ), agg AS (
    SELECT 
      COALESCE(AVG(total_time_minutes),0) AS avg_time,
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_time_minutes),0) AS median_time,
      COALESCE(AVG(lessons_completed),0) AS avg_lessons,
      COALESCE(AVG(average_accuracy),0) AS avg_accuracy
    FROM last7
  )
  SELECT json_build_object(
    'avg_time', avg_time,
    'median_time', median_time,
    'avg_lessons', avg_lessons,
    'avg_accuracy', avg_accuracy
  ) INTO result FROM agg;
  RETURN result;
END;
$$;