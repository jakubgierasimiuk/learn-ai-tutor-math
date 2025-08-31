-- Fix security vulnerability in user_referral_stats table
-- Remove the overly permissive "System can manage stats" policy that allows public access

-- Drop the dangerous policy that allows anyone to do anything
DROP POLICY IF EXISTS "System can manage stats" ON public.user_referral_stats;

-- Add secure system-level INSERT policy for edge functions only
CREATE POLICY "Service role can insert stats" 
ON public.user_referral_stats 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Add secure system-level UPDATE policy for edge functions only  
CREATE POLICY "Service role can update stats"
ON public.user_referral_stats
FOR UPDATE  
TO service_role
USING (true)
WITH CHECK (true);

-- Add secure system-level DELETE policy for edge functions only (if needed)
CREATE POLICY "Service role can delete stats"
ON public.user_referral_stats
FOR DELETE
TO service_role  
USING (true);

-- Ensure the existing user policies remain (they're already correct)
-- Users can view their own stats: (auth.uid() = user_id) 
-- Users can update their own stats: (auth.uid() = user_id)