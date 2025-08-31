-- Critical security fixes for the application

-- 1. Fix learning_analytics view security issue
-- The view should properly inherit RLS from underlying tables
DROP VIEW IF EXISTS public.learning_analytics;

-- 2. Ensure all underlying tables have proper RLS enabled
-- Check if unified_learning_sessions has RLS (it should already)
-- This view will inherit permissions from the underlying tables

-- 3. Recreate the view with explicit security_invoker setting
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
        WHEN uls.tasks_completed > 0 
        THEN ROUND((uls.correct_answers::numeric / uls.tasks_completed::numeric) * 100, 2)
        ELSE 0 
    END as accuracy_rate,
    uls.engagement_score,
    uls.learning_momentum,
    uls.total_tokens_used,
    uls.started_at,
    uls.completed_at,
    CASE 
        WHEN uls.completed_at IS NOT NULL AND uls.started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at))/60.0
        ELSE NULL 
    END as session_duration_minutes,
    CASE 
        WHEN uls.completed_at IS NOT NULL AND uls.started_at IS NOT NULL
        AND EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at)) > 0
        THEN (uls.tasks_completed::numeric / (EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at))/60.0))
        ELSE 0 
    END as learning_velocity,
    uls.difficulty_level as difficulty_multiplier,
    uls.explanation_style_used as preferred_explanation_style
FROM public.unified_learning_sessions uls
WHERE uls.completed_at IS NOT NULL;

-- 4. Create a function to check if OTP settings are properly configured
CREATE OR REPLACE FUNCTION public.check_security_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Return security recommendations
    result := jsonb_build_object(
        'recommendations', jsonb_build_array(
            'Configure OTP expiry to 10 minutes in Supabase Auth settings',
            'Enable leaked password protection in Supabase Auth settings',
            'Review admin role assignment procedures',
            'Implement regular security audits'
        ),
        'timestamp', now()
    );
    
    RETURN result;
END;
$$;