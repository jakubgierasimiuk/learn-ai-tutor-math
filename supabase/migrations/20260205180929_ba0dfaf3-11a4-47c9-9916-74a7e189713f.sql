-- Fix remaining overly permissive RLS policies
-- All these tables are system-managed and should only be accessible by service role

-- 1. admin_rate_limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.admin_rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.admin_rate_limits
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 2. ai_conversation_log - keep existing insert policy but restrict to service role
DROP POLICY IF EXISTS "System can insert AI conversation logs" ON public.ai_conversation_log;
CREATE POLICY "Service role can insert AI conversation logs" ON public.ai_conversation_log
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 3. marketing_rewards_history
DROP POLICY IF EXISTS "System can insert marketing rewards" ON public.marketing_rewards_history;
CREATE POLICY "Service role can insert marketing rewards" ON public.marketing_rewards_history
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 4. page_analytics
DROP POLICY IF EXISTS "System can update page analytics" ON public.page_analytics;
DROP POLICY IF EXISTS "System can insert page analytics" ON public.page_analytics;
CREATE POLICY "Service role can manage page analytics" ON public.page_analytics
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 5. referral_events - Already created service role policy, drop the old one
DROP POLICY IF EXISTS "System manages referral events" ON public.referral_events;

-- 6. referral_rewards
DROP POLICY IF EXISTS "System can manage rewards" ON public.referral_rewards;
CREATE POLICY "Service role can manage referral rewards" ON public.referral_rewards
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 7. skill_misconception_patterns
DROP POLICY IF EXISTS "System can update skill misconception patterns" ON public.skill_misconception_patterns;
DROP POLICY IF EXISTS "System can insert skill misconception patterns" ON public.skill_misconception_patterns;
CREATE POLICY "Service role can manage skill misconception patterns" ON public.skill_misconception_patterns
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Allow authenticated users to read
CREATE POLICY "Users can read skill misconception patterns" ON public.skill_misconception_patterns
FOR SELECT USING (auth.role() = 'authenticated');

-- 8. skill_real_world_applications
DROP POLICY IF EXISTS "System can update skill real world applications" ON public.skill_real_world_applications;
DROP POLICY IF EXISTS "System can insert skill real world applications" ON public.skill_real_world_applications;
CREATE POLICY "Service role can manage skill real world applications" ON public.skill_real_world_applications
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Allow authenticated users to read
CREATE POLICY "Users can read skill real world applications" ON public.skill_real_world_applications
FOR SELECT USING (auth.role() = 'authenticated');

-- 9. skills
DROP POLICY IF EXISTS "System can update skills" ON public.skills;
DROP POLICY IF EXISTS "System can insert skills" ON public.skills;
CREATE POLICY "Service role can manage skills" ON public.skills
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Allow authenticated users to read skills (educational content)
CREATE POLICY "Users can read skills" ON public.skills
FOR SELECT USING (auth.role() = 'authenticated');

-- 10. user_referral_stats - drop old permissive policies
DROP POLICY IF EXISTS "Service role can delete stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Service role can update stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Service role can insert stats" ON public.user_referral_stats;

-- 11. user_session_analytics
DROP POLICY IF EXISTS "System can insert user sessions" ON public.user_session_analytics;
DROP POLICY IF EXISTS "System can update user sessions" ON public.user_session_analytics;
CREATE POLICY "Service role can manage user session analytics" ON public.user_session_analytics
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Allow users to view their own session data
CREATE POLICY "Users can view own session analytics" ON public.user_session_analytics
FOR SELECT USING (auth.uid() = user_id);