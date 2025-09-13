-- Add trial functionality columns to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS monthly_tokens_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_cycle_start timestamp with time zone DEFAULT now();

-- Add the new limited_free plan to subscription_plans (using monthly_price_cents)
INSERT INTO public.subscription_plans (
  plan_type, 
  token_limit_soft, 
  token_limit_hard, 
  monthly_price_cents, 
  is_active,
  features,
  created_at
) VALUES (
  'limited_free', 
  1000, 
  1200, 
  0, 
  true,
  '["1000 tokenów miesięcznie", "Podstawowe funkcje AI"]'::jsonb,
  now()
) ON CONFLICT (plan_type) DO UPDATE SET
  token_limit_soft = EXCLUDED.token_limit_soft,
  token_limit_hard = EXCLUDED.token_limit_hard,
  is_active = EXCLUDED.is_active,
  features = EXCLUDED.features;

-- Set trial_end_date for existing free users (7 days from now)
UPDATE public.user_subscriptions 
SET trial_end_date = now() + interval '7 days',
    billing_cycle_start = now()
WHERE subscription_type = 'free' 
AND trial_end_date IS NULL;

-- Create index for efficient trial expiry queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end_date 
ON public.user_subscriptions(trial_end_date) 
WHERE trial_end_date IS NOT NULL;