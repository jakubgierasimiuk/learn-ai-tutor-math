-- Create sms_verifications table for SMS verification codes
CREATE TABLE IF NOT EXISTS public.sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_e164 TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for sms_verifications
ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own SMS verifications" 
ON public.sms_verifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sms_verifications_user_id ON public.sms_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON public.sms_verifications (phone_e164);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON public.sms_verifications (expires_at);

-- Add foreign key constraint
ALTER TABLE public.sms_verifications 
ADD CONSTRAINT sms_verifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;