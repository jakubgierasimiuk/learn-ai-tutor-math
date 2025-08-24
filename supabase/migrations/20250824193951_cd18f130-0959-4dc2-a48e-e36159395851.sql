-- Update monthly token reset to use subscription anniversary date
CREATE OR REPLACE FUNCTION public.reset_monthly_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Reset tokens for subscriptions that have reached their monthly anniversary
  FOR subscription_record IN 
    SELECT user_id, subscription_type, monthly_token_limit, created_at
    FROM user_subscriptions 
    WHERE status = 'active'
    AND (
      -- For paid subscriptions, check if it's been a month since creation or last reset
      (subscription_type = 'paid' AND 
       DATE_PART('day', NOW() - created_at) >= 30 AND
       DATE_PART('day', NOW() - COALESCE(last_token_reset, created_at)) >= 30)
      OR
      -- For other subscription types, use calendar month (existing behavior)
      (subscription_type IN ('free', 'test', 'super') AND 
       DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', COALESCE(last_token_reset, created_at)))
    )
  LOOP
    -- Reset the token usage
    UPDATE user_subscriptions 
    SET tokens_used_this_month = 0,
        last_token_reset = NOW()
    WHERE user_id = subscription_record.user_id;
    
    -- Log the reset
    INSERT INTO ai_conversation_log (
      user_id, function_name, endpoint, full_prompt, ai_response, model_used
    ) VALUES (
      subscription_record.user_id, 
      'reset_monthly_tokens', 
      'system', 
      'Monthly token reset for subscription type: ' || subscription_record.subscription_type,
      'Tokens reset to 0, limit: ' || subscription_record.monthly_token_limit,
      'system'
    );
  END LOOP;
END;
$$;

-- Add last_token_reset column to track when tokens were last reset
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS last_token_reset TIMESTAMP WITH TIME ZONE;