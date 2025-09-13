-- Fix remaining security issues: Add missing search_path to all remaining functions

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(p_user_id uuid, p_action_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, trunc(random() * length(chars))::integer + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;