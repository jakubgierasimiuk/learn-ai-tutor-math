-- Add missing user policy for SMS verifications
-- Users should be able to see their own SMS verification attempts

CREATE POLICY "Users can view own SMS verifications" 
ON public.sms_verifications FOR SELECT 
USING (auth.uid() = user_id);