-- 1. Add is_founding_member column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT FALSE;

-- 2. Fix existing founding members - set correct subscription
UPDATE user_subscriptions us
SET 
  subscription_type = 'paid',
  status = 'active',
  subscription_end_date = fm.created_at + INTERVAL '30 days',
  token_limit_soft = 10000000,
  token_limit_hard = 10000000,
  monthly_tokens_used = 0,
  billing_cycle_start = fm.created_at,
  updated_at = now()
FROM founding_members fm
WHERE us.user_id = fm.user_id
  AND fm.status = 'registered'
  AND (us.subscription_type != 'paid' OR us.subscription_end_date IS NULL);

-- 3. Set founding member flag in profiles
UPDATE profiles p
SET is_founding_member = TRUE
FROM founding_members fm
WHERE p.user_id = fm.user_id AND fm.status = 'registered';