-- Check if columns exist first and add them separately
DO $$ 
BEGIN
    -- Add monthly_tokens_used column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_subscriptions' 
                  AND column_name = 'monthly_tokens_used') THEN
        ALTER TABLE public.user_subscriptions 
        ADD COLUMN monthly_tokens_used integer DEFAULT 0;
    END IF;

    -- Add billing_cycle_start column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_subscriptions' 
                  AND column_name = 'billing_cycle_start') THEN
        ALTER TABLE public.user_subscriptions 
        ADD COLUMN billing_cycle_start timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Now create the function with the correct columns
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