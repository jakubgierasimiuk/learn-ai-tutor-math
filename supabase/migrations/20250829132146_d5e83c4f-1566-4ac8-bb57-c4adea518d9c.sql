-- Fix security definer view issue
-- Drop the existing learning_analytics view and recreate it without SECURITY DEFINER
-- Views cannot have RLS directly, but security is enforced through underlying tables

-- First, drop the existing view
DROP VIEW IF EXISTS public.learning_analytics;

-- Recreate the view explicitly as SECURITY INVOKER (this is the default but being explicit)
-- This ensures the view uses the permissions of the querying user, not the view creator
CREATE VIEW public.learning_analytics
WITH (security_invoker=true) AS
SELECT 
    uls.user_id,
    uls.session_type,
    uls.department,
    uls.difficulty_level,
    uls.tasks_completed,
    uls.correct_answers,
    CASE
        WHEN (uls.tasks_completed > 0) THEN ((uls.correct_answers)::numeric / (uls.tasks_completed)::numeric)
        ELSE (0)::numeric
    END AS accuracy_rate,
    uls.engagement_score,
    uls.learning_momentum,
    uls.total_tokens_used,
    uls.started_at,
    uls.completed_at,
    (EXTRACT(epoch FROM (uls.completed_at - uls.started_at)) / (60)::numeric) AS session_duration_minutes,
    ulp.learning_velocity,
    ulp.difficulty_multiplier,
    ulp.preferred_explanation_style
FROM unified_learning_sessions uls
LEFT JOIN universal_learner_profiles ulp ON (ulp.user_id = uls.user_id)
WHERE uls.completed_at IS NOT NULL;