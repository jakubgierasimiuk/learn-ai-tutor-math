-- Create subscription_plans table for dynamic limits configuration
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type TEXT NOT NULL UNIQUE,
  token_limit_soft INTEGER NOT NULL,
  token_limit_hard INTEGER NOT NULL,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing subscription plans
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insert default plans
INSERT INTO public.subscription_plans (plan_type, token_limit_soft, token_limit_hard, monthly_price_cents, features) VALUES
('free', 20000, 25000, 0, '["Podstawowe funkcje AI", "Dostęp do wszystkich działów matematyki", "Wsparcie społeczności"]'::jsonb),
('paid', 999999999, 999999999, 2999, '["Nieograniczone tokeny", "Priorytetowe wsparcie", "Zaawansowane funkcje AI", "Dostęp do beta funkcji"]'::jsonb),
('super', 999999999, 999999999, 4999, '["Wszystkie funkcje paid", "Personalne sesje", "Zaawansowane raporty", "API dostęp"]'::jsonb);

-- Update user_subscriptions table structure
ALTER TABLE public.user_subscriptions 
DROP COLUMN IF EXISTS monthly_token_limit,
DROP COLUMN IF EXISTS tokens_used_this_month,
DROP COLUMN IF EXISTS last_token_reset;

-- Add new columns to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN token_limit_soft INTEGER NOT NULL DEFAULT 20000,
ADD COLUMN token_limit_hard INTEGER NOT NULL DEFAULT 25000,
ADD COLUMN tokens_used_total INTEGER NOT NULL DEFAULT 0;

-- Update existing subscriptions with proper limits
UPDATE public.user_subscriptions 
SET token_limit_soft = 20000, token_limit_hard = 25000, tokens_used_total = 0
WHERE subscription_type = 'free';

UPDATE public.user_subscriptions 
SET token_limit_soft = 999999999, token_limit_hard = 999999999, tokens_used_total = 0
WHERE subscription_type IN ('paid', 'super');

-- Drop the user_daily_limits table as it's no longer needed
DROP TABLE IF EXISTS public.user_daily_limits;

-- Update token_limit_exceeded_logs table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_limit_exceeded_logs') THEN
    ALTER TABLE public.token_limit_exceeded_logs 
    RENAME COLUMN monthly_limit TO account_limit;
    
    ALTER TABLE public.token_limit_exceeded_logs 
    RENAME COLUMN tokens_used_this_month TO tokens_used_total;
  END IF;
END $$;

-- Remove the reset_monthly_tokens function if it exists
DROP FUNCTION IF EXISTS public.reset_monthly_tokens();

-- Create trigger to update subscription limits from plans
CREATE OR REPLACE FUNCTION public.sync_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user subscriptions when subscription plans change
  UPDATE public.user_subscriptions us
  SET 
    token_limit_soft = sp.token_limit_soft,
    token_limit_hard = sp.token_limit_hard,
    updated_at = now()
  FROM public.subscription_plans sp
  WHERE us.subscription_type = sp.plan_type
    AND sp.is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on subscription_plans
CREATE TRIGGER sync_subscription_limits_trigger
AFTER UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.sync_subscription_limits();

-- Create function to get current subscription limits
CREATE OR REPLACE FUNCTION public.get_user_subscription_limits(target_user_id UUID)
RETURNS TABLE(
  subscription_type TEXT,
  token_limit_soft INTEGER,
  token_limit_hard INTEGER,
  tokens_used_total INTEGER,
  status TEXT
) 
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
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