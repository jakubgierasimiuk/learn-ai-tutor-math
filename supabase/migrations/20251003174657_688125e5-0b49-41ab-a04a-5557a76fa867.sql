-- Fix RLS policy for referrals table - add WITH CHECK clause
DROP POLICY IF EXISTS "System manages referrals" ON public.referrals;

CREATE POLICY "System manages referrals"
  ON public.referrals
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fix RLS policy for referral_events table if it exists
DROP POLICY IF EXISTS "System manages referral events" ON public.referral_events;

CREATE POLICY "System manages referral events"
  ON public.referral_events
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fix RLS policy for rewards table if it exists
DROP POLICY IF EXISTS "System can manage rewards" ON public.rewards;

CREATE POLICY "System can manage rewards"
  ON public.rewards
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);