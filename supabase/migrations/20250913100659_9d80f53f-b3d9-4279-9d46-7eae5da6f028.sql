-- Fix critical security issue: Remove public access to user_subscriptions
-- The current "System can manage all subscriptions" policy with qual:true is dangerous

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can manage all subscriptions" ON public.user_subscriptions;

-- Create a more secure system policy that only allows service role access
-- This prevents public users from reading all subscription data including Stripe IDs
CREATE POLICY "Service role can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
TO service_role 
USING (true);

-- Add insert policy for authenticated users (for new subscriptions)
CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Fix search_path for security functions to prevent schema manipulation attacks
CREATE OR REPLACE FUNCTION public.get_user_total_token_usage(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(tokens_used), 0)::integer
  FROM ai_conversation_log
  WHERE user_id = target_user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_subscription_limits(target_user_id uuid)
RETURNS TABLE(subscription_type text, token_limit_soft integer, token_limit_hard integer, tokens_used_total integer, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    us.subscription_type,
    COALESCE(sp.token_limit_soft, us.token_limit_soft) as token_limit_soft,
    COALESCE(sp.token_limit_hard, us.token_limit_hard) as token_limit_hard,
    COALESCE(get_user_total_token_usage(target_user_id), 0) as tokens_used_total,
    us.status
  FROM public.user_subscriptions us
  LEFT JOIN public.subscription_plans sp ON sp.plan_type = us.subscription_type AND sp.is_active = true
  WHERE us.user_id = target_user_id;
$$;

-- Add index for better performance and security on user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;