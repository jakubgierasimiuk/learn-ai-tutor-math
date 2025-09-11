-- Fix function security issues by setting search_path
CREATE OR REPLACE FUNCTION public.sync_subscription_limits()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;