-- Fix the security definer view issue
-- Instead of creating a view, let's create a secure function to query learning analytics

-- Drop the potentially insecure view
DROP VIEW IF EXISTS public.learning_analytics;

-- Create a secure function that respects RLS
CREATE OR REPLACE FUNCTION public.get_learning_analytics(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
    user_id uuid,
    difficulty_level numeric,
    tasks_completed integer,
    correct_answers integer,
    accuracy_rate numeric,
    engagement_score numeric,
    learning_momentum numeric,
    total_tokens_used integer,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    session_duration_minutes numeric,
    learning_velocity numeric,
    difficulty_multiplier numeric,
    session_type text,
    department text,
    preferred_explanation_style text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
    SELECT 
        uls.user_id,
        uls.difficulty_level,
        uls.tasks_completed,
        uls.correct_answers,
        CASE 
            WHEN uls.tasks_completed > 0 THEN (uls.correct_answers::numeric / uls.tasks_completed::numeric) 
            ELSE 0 
        END as accuracy_rate,
        uls.engagement_score,
        uls.learning_momentum,
        uls.total_tokens_used,
        uls.started_at,
        uls.completed_at,
        CASE 
            WHEN uls.completed_at IS NOT NULL AND uls.started_at IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at)) / 60 
            ELSE NULL 
        END as session_duration_minutes,
        uls.learning_momentum as learning_velocity,
        uls.difficulty_level as difficulty_multiplier,
        uls.session_type,
        uls.department,
        uls.explanation_style_used as preferred_explanation_style
    FROM public.unified_learning_sessions uls
    WHERE uls.completed_at IS NOT NULL
      AND (target_user_id IS NULL OR uls.user_id = COALESCE(target_user_id, auth.uid()))
      AND uls.user_id = auth.uid(); -- Enforce RLS at function level
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_learning_analytics(uuid) TO authenticated;