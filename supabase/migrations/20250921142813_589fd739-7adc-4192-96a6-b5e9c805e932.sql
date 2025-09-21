-- Fix devices table RLS - CRITICAL: Device tracking data exposed
-- This table contains IP addresses and device fingerprints

-- Drop any permissive policies
DROP POLICY IF EXISTS "Anyone can view devices" ON public.devices;

-- Ensure RLS is enabled
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own devices
CREATE POLICY "Users manage own devices" 
ON public.devices FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all devices for security monitoring
CREATE POLICY "Admins view all devices" 
ON public.devices FOR SELECT 
USING (is_admin());