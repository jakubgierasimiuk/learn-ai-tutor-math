-- Step 1: Update subscription plans table with correct token limits
UPDATE public.subscription_plans 
SET token_limit_hard = 10000000
WHERE plan_type = 'paid';

-- Add expired plan with 5k tokens
INSERT INTO public.subscription_plans (plan_type, token_limit_soft, token_limit_hard, monthly_price_cents, features, is_active)
VALUES ('expired', 5000, 5000, 0, '["Limited access after subscription end"]', true)
ON CONFLICT (plan_type) DO UPDATE SET
  token_limit_soft = EXCLUDED.token_limit_soft,
  token_limit_hard = EXCLUDED.token_limit_hard,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Step 2: Add monthly_tokens_used column to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS monthly_tokens_used integer DEFAULT 0;

-- Add billing_cycle_start column to track when monthly limits reset
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle_start timestamp with time zone DEFAULT now();

-- Step 3: Create function to reset monthly tokens for paid users
CREATE OR REPLACE FUNCTION public.reset_monthly_tokens_for_billing_cycle()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reset monthly_tokens_used for paid users whose billing cycle has passed
  UPDATE public.user_subscriptions
  SET 
    monthly_tokens_used = 0,
    billing_cycle_start = billing_cycle_start + INTERVAL '1 month'
  WHERE subscription_type = 'paid' 
    AND status = 'active'
    AND billing_cycle_start <= now() - INTERVAL '1 month';
END;
$$;

-- Step 4: Update get_user_subscription_limits function to handle monthly vs lifetime tokens
CREATE OR REPLACE FUNCTION public.get_user_subscription_limits(target_user_id uuid)
RETURNS TABLE(
  subscription_type text, 
  token_limit_soft integer, 
  token_limit_hard integer, 
  tokens_used_total integer,
  monthly_tokens_used integer,
  status text,
  billing_cycle_start timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.subscription_type,
    COALESCE(sp.token_limit_soft, us.token_limit_soft) as token_limit_soft,
    COALESCE(sp.token_limit_hard, us.token_limit_hard) as token_limit_hard,
    COALESCE(get_user_total_token_usage(target_user_id), 0) as tokens_used_total,
    COALESCE(us.monthly_tokens_used, 0) as monthly_tokens_used,
    us.status,
    us.billing_cycle_start
  FROM public.user_subscriptions us
  LEFT JOIN public.subscription_plans sp ON sp.plan_type = us.subscription_type AND sp.is_active = true
  WHERE us.user_id = target_user_id;
$$;