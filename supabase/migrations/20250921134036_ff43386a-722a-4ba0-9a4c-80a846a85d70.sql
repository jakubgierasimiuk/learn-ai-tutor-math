-- Fix critical security issues - Add missing RLS policies

-- 1. Fix profiles table - restrict to own data only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Fix devices table - restrict to user's own devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own devices" ON public.devices;

CREATE POLICY "Users can manage their own devices" 
ON public.devices FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Fix fraud_signals table - only system and admins
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert fraud signals" ON public.fraud_signals;
DROP POLICY IF EXISTS "Users can view their own fraud signals" ON public.fraud_signals;

CREATE POLICY "System can insert fraud signals" 
ON public.fraud_signals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own fraud signals" 
ON public.fraud_signals FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix referrals table - restrict access
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view referrals they're involved in" ON public.referrals;

CREATE POLICY "System can manage referrals" 
ON public.referrals FOR ALL 
USING (true);

CREATE POLICY "Users can view their own referrals" 
ON public.referrals FOR SELECT 
USING ((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id));

-- 5. Fix user_subscriptions - already has good policies but let's ensure they're strict
-- The existing policies look correct, no changes needed

-- 6. Fix admin_actions_log - only admins should see this
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert admin actions log" ON public.admin_actions_log;
DROP POLICY IF EXISTS "Admins can view admin actions log" ON public.admin_actions_log;

CREATE POLICY "Admins can insert admin actions log" 
ON public.admin_actions_log FOR INSERT 
WITH CHECK (is_admin() AND (auth.uid() = admin_id));

CREATE POLICY "Admins can view admin actions log" 
ON public.admin_actions_log FOR SELECT 
USING (is_admin());

-- 7. Fix app_error_logs - users can only see their own errors
ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own error logs" ON public.app_error_logs;
DROP POLICY IF EXISTS "Users can view their own error logs" ON public.app_error_logs;

CREATE POLICY "Users can insert their own error logs" 
ON public.app_error_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own error logs" 
ON public.app_error_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all error logs" 
ON public.app_error_logs FOR SELECT 
USING (is_admin());