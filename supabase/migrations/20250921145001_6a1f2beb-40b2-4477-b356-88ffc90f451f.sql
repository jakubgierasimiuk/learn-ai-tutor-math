-- Fix remaining RLS issues for tables with sensitive data

-- Fix sms_verifications table
ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own SMS verifications" 
ON public.sms_verifications FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view SMS verifications" 
ON public.sms_verifications FOR SELECT 
USING (is_admin());

-- Fix marketing_consents table  
ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own marketing consents" 
ON public.marketing_consents FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view marketing consents" 
ON public.marketing_consents FOR SELECT 
USING (is_admin());