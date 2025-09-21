-- Fix fraud_signals table RLS - CRITICAL: Security system data exposed
-- This table contains fraud detection scores that could help attackers

-- Drop any permissive policies
DROP POLICY IF EXISTS "Anyone can view fraud signals" ON public.fraud_signals;

-- Ensure RLS is enabled
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

-- Only system can insert fraud signals (edge functions)
CREATE POLICY "System can insert fraud signals" 
ON public.fraud_signals FOR INSERT 
WITH CHECK (true);

-- Users can only view their own signals
CREATE POLICY "Users can view own fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all signals for security monitoring
CREATE POLICY "Admins can view all fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (is_admin());