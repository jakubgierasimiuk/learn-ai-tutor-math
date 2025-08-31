-- CRITICAL SECURITY FIXES

-- 1. Secure the assign-admin-role function by requiring JWT authentication
-- First, ensure the function requires authentication in config.toml (done separately)

-- 2. Fix database functions with missing search_path (identified by linter)
-- Update functions that don't have proper search_path set

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Fix get_user_roles function
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = _user_id;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- Fix get_user_learning_profile function
CREATE OR REPLACE FUNCTION public.get_user_learning_profile(target_user_id uuid)
RETURNS TABLE(user_id uuid, processing_speed_percentile integer, working_memory_span integer, cognitive_load_threshold numeric, attention_span_minutes integer, optimal_session_length_minutes integer, current_energy_level numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT 
        lp.user_id,
        lp.processing_speed_percentile,
        lp.working_memory_span,
        lp.cognitive_load_threshold,
        lp.attention_span_minutes,
        lp.optimal_session_length_minutes,
        lp.current_energy_level
    FROM learning_profiles lp
    WHERE lp.user_id = target_user_id;
$$;

-- 3. Fix the learning_analytics security issue properly
-- Since it's a view, drop the incorrect migration and ensure proper security through underlying tables
DROP VIEW IF EXISTS public.learning_analytics;

-- Recreate the view with proper security invoker settings
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
        THEN (uls.correct_answers::numeric / uls.tasks_completed::numeric) 
        ELSE 0 
    END as accuracy_rate,
    uls.engagement_score,
    uls.learning_momentum,
    uls.total_tokens_used,
    uls.started_at,
    uls.completed_at,
    CASE 
        WHEN uls.completed_at IS NOT NULL AND uls.started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at)) / 60.0 
        ELSE NULL 
    END as session_duration_minutes,
    CASE 
        WHEN uls.tasks_completed > 0 AND uls.completed_at IS NOT NULL AND uls.started_at IS NOT NULL
        THEN (uls.tasks_completed::numeric / (EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at)) / 60.0))
        ELSE 0 
    END as learning_velocity,
    uls.difficulty_level as difficulty_multiplier,
    ulp.preferred_explanation_style
FROM unified_learning_sessions uls
LEFT JOIN universal_learner_profiles ulp ON (ulp.user_id = uls.user_id)
WHERE uls.completed_at IS NOT NULL;

-- 4. Add rate limiting table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action_type text NOT NULL,
    attempt_count integer NOT NULL DEFAULT 1,
    window_start timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limiting table
CREATE POLICY "System can manage rate limits" 
ON public.admin_rate_limits 
FOR ALL 
TO authenticated
USING (true);

-- 5. Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
    p_user_id uuid,
    p_action_type text,
    p_max_attempts integer DEFAULT 5,
    p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_attempts integer;
    window_start timestamp with time zone;
BEGIN
    -- Clean up old entries
    DELETE FROM admin_rate_limits 
    WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
    
    -- Get current attempts in window
    SELECT attempt_count, admin_rate_limits.window_start
    INTO current_attempts, window_start
    FROM admin_rate_limits
    WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
    
    IF current_attempts IS NULL THEN
        -- First attempt in window
        INSERT INTO admin_rate_limits (user_id, action_type, attempt_count)
        VALUES (p_user_id, p_action_type, 1);
        RETURN true;
    ELSIF current_attempts < p_max_attempts THEN
        -- Increment attempts
        UPDATE admin_rate_limits 
        SET attempt_count = attempt_count + 1
        WHERE user_id = p_user_id AND action_type = p_action_type;
        RETURN true;
    ELSE
        -- Rate limit exceeded
        RETURN false;
    END IF;
END;
$$;