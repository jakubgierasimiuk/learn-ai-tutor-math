-- Add trial functionality columns to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN trial_end_date timestamp with time zone,
ADD COLUMN monthly_tokens_used integer DEFAULT 0,
ADD COLUMN billing_cycle_start timestamp with time zone DEFAULT now();

-- Add the new limited_free plan to subscription_plans
INSERT INTO public.subscription_plans (
  plan_type, 
  token_limit_soft, 
  token_limit_hard, 
  price_monthly, 
  is_active,
  created_at
) VALUES (
  'limited_free', 
  1000, 
  1200, 
  0.00, 
  true,
  now()
) ON CONFLICT (plan_type) DO UPDATE SET
  token_limit_soft = EXCLUDED.token_limit_soft,
  token_limit_hard = EXCLUDED.token_limit_hard,
  is_active = EXCLUDED.is_active;

-- Set trial_end_date for existing free users (7 days from now)
UPDATE public.user_subscriptions 
SET trial_end_date = now() + interval '7 days'
WHERE subscription_type = 'free' 
AND trial_end_date IS NULL;

-- Create index for efficient trial expiry queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end_date 
ON public.user_subscriptions(trial_end_date) 
WHERE trial_end_date IS NOT NULL;