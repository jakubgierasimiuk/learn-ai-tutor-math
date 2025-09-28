-- Fix security vulnerability in analytics_cache table
-- Remove the overly permissive policy that allows public access
DROP POLICY IF EXISTS "System can manage analytics cache" ON public.analytics_cache;

-- Create a new secure policy that only allows service role access
-- This ensures only backend functions can manage the cache
CREATE POLICY "Service role can manage analytics cache" 
ON public.analytics_cache 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- The existing admin policy is secure and should remain:
-- "Admins can view analytics cache" allows only admins to SELECT data