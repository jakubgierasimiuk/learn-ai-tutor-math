-- Fix overly permissive RLS policies on system-managed tables
-- These tables should only be accessible by service role (edge functions)

-- 1. founding_scarcity_state - Drop permissive policy and create service-role only
DROP POLICY IF EXISTS "System can manage scarcity state" ON public.founding_scarcity_state;

CREATE POLICY "Service role can manage scarcity state" ON public.founding_scarcity_state
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. referrals - Drop permissive policy and create proper policies
DROP POLICY IF EXISTS "System manages referrals" ON public.referrals;

-- Service role for system operations
CREATE POLICY "Service role can manage referrals" ON public.referrals
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own referrals (read-only)
CREATE POLICY "Users can view own referrals" ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- 3. referral_events - Drop permissive policy and restrict to service role only
-- Note: referral_events has referral_id (FK), not a direct user_id, so only service role access
DROP POLICY IF EXISTS "System can insert referral events" ON public.referral_events;

CREATE POLICY "Service role can manage referral events" ON public.referral_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 4. user_referral_stats - Drop permissive policies and create proper ones
DROP POLICY IF EXISTS "System can manage stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "System can insert referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "System can update referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "System can delete referral stats" ON public.user_referral_stats;

-- Service role for system operations
CREATE POLICY "Service role can manage user referral stats" ON public.user_referral_stats
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own stats (read-only)
CREATE POLICY "Users can view own referral stats" ON public.user_referral_stats
FOR SELECT
USING (auth.uid() = user_id);

-- 5. unified_skill_content - Drop permissive policy and restrict to service role
DROP POLICY IF EXISTS "System can manage unified skill content" ON public.unified_skill_content;

-- Service role for content management
CREATE POLICY "Service role can manage skill content" ON public.unified_skill_content
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- All authenticated users can read skill content (educational content is public to users)
CREATE POLICY "Authenticated users can read skill content" ON public.unified_skill_content
FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. rewards - Drop permissive policy and create proper policies
DROP POLICY IF EXISTS "System can manage rewards" ON public.rewards;

-- Service role for reward management
CREATE POLICY "Service role can manage rewards" ON public.rewards
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own rewards (read-only)
CREATE POLICY "Users can view own rewards" ON public.rewards
FOR SELECT
USING (auth.uid() = user_id);