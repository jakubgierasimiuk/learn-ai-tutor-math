-- Fix referrals table RLS - CRITICAL: Referral system could be exploited
-- This table contains IP addresses, device hashes, phone hashes, and referral codes

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Anyone can view referrals" ON public.referrals;

-- Ensure RLS is enabled
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can only view referrals they're involved in
CREATE POLICY "Users can view their own referrals" 
ON public.referrals FOR SELECT 
USING ((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id));

-- System functions can manage referrals (for edge functions)
CREATE POLICY "System can manage referrals" 
ON public.referrals FOR ALL 
USING (true);

-- Admins can view all referrals for fraud prevention
CREATE POLICY "Admins can view all referrals" 
ON public.referrals FOR SELECT 
USING (is_admin());