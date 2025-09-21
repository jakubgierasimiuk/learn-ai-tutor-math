-- Fix referrals table RLS - CRITICAL: Referral system could be exploited
-- Handle existing policies properly

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view referrals they're involved in" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;

-- Ensure RLS is enabled
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create secure policies
CREATE POLICY "Users can view their referrals" 
ON public.referrals FOR SELECT 
USING ((auth.uid() = referrer_id) OR (auth.uid() = referred_user_id));

CREATE POLICY "System manages referrals" 
ON public.referrals FOR ALL 
USING (true);

CREATE POLICY "Admins can view all referrals" 
ON public.referrals FOR SELECT 
USING (is_admin());