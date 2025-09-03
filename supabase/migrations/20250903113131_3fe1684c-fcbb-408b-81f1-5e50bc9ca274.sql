-- Fix critical security vulnerability: Add RLS policies for learning_analytics table
-- Currently this table has no RLS policies, allowing public access to sensitive user data

-- Enable RLS on learning_analytics table
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Add policy for users to view their own analytics data only
CREATE POLICY "Users can view their own learning analytics" 
ON public.learning_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy for system to insert analytics data
CREATE POLICY "Service role can insert learning analytics"
ON public.learning_analytics
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Add policy for system to update analytics data  
CREATE POLICY "Service role can update learning analytics"
ON public.learning_analytics
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Fix database functions missing secure search_path
-- Update functions that don't have SET search_path = 'public'

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.generate_random_id()
RETURNS integer
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN FLOOR(RANDOM() * 2147483647)::INTEGER;
END;
$function$;