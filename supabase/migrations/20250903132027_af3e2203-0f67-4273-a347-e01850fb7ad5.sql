-- Find and fix the last function without SET search_path
-- Let's check if there are any other functions we missed

-- Fix any remaining functions that might not have search_path set
-- This should address the remaining security warning

-- Check if we missed any other functions by recreating a commonly used one
CREATE OR REPLACE FUNCTION public.set_user_id_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;