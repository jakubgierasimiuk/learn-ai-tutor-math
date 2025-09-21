-- Fix overly permissive policies that make tables publicly accessible

-- Fix fraud_signals - remove policy that allows anyone to insert
DROP POLICY IF EXISTS "System inserts fraud signals" ON public.fraud_signals;

-- Create proper system policy for fraud signals (only edge functions can insert)
CREATE POLICY "Edge functions can insert fraud signals" 
ON public.fraud_signals FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

-- Fix user_subscriptions - the "Service role" policy is too permissive
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;

-- Create proper service role policy that doesn't allow public access
CREATE POLICY "Service role can manage subscriptions" 
ON public.user_subscriptions FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');