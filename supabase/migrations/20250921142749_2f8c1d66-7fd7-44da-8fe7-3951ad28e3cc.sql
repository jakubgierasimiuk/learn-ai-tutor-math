-- Fix fraud_signals table RLS - handle existing policies
-- Drop all existing policies and recreate them securely

DROP POLICY IF EXISTS "System can insert fraud signals" ON public.fraud_signals;
DROP POLICY IF EXISTS "Users can view their own fraud signals" ON public.fraud_signals;
DROP POLICY IF EXISTS "Users can view own fraud signals" ON public.fraud_signals;
DROP POLICY IF EXISTS "Admins can view all fraud signals" ON public.fraud_signals;

-- Ensure RLS is enabled
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

-- Create secure policies
CREATE POLICY "System inserts fraud signals" 
ON public.fraud_signals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users view own fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins view fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (is_admin());