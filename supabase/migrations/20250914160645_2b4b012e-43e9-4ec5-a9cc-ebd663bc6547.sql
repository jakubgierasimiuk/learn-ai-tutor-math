-- Phase 1: Marketing Consent Management System
-- Create comprehensive marketing consents table
CREATE TABLE public.marketing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('email', 'sms', 'personalization', 'analytics', 'general')),
  is_granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  consent_version TEXT DEFAULT '1.0',
  source TEXT DEFAULT 'registration_popup' CHECK (source IN ('registration_popup', 'settings_manual', 'first_lesson', 'reengagement', 'api')),
  metadata JSONB DEFAULT '{}',
  device_fingerprint TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketing rewards history table with anti-fraud protection
CREATE TABLE public.marketing_rewards_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('bonus_days', 'bonus_tokens', 'personalized_plan')),
  amount INTEGER NOT NULL,
  description TEXT DEFAULT 'Spersonalizowany Plan Nauki',
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source TEXT NOT NULL CHECK (source IN ('marketing_consent', 'referral', 'achievement', 'manual')),
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'clawed_back', 'expired')),
  clawed_back_at TIMESTAMP WITH TIME ZONE,
  clawback_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketing consent rewards management table
CREATE TABLE public.marketing_consent_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reward_granted BOOLEAN DEFAULT false,
  reward_granted_at TIMESTAMP WITH TIME ZONE,
  bonus_days INTEGER DEFAULT 0,
  bonus_tokens INTEGER DEFAULT 0,
  clawback_eligible_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'clawed_back', 'expired')),
  marketing_consent_revoked_at TIMESTAMP WITH TIME ZONE,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_rewards_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_consent_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_consents
CREATE POLICY "Users can view their own marketing consents"
ON public.marketing_consents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing consents"
ON public.marketing_consents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing consents"
ON public.marketing_consents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all marketing consents"
ON public.marketing_consents FOR SELECT
USING (is_admin());

-- RLS Policies for marketing_rewards_history
CREATE POLICY "Users can view their own marketing rewards history"
ON public.marketing_rewards_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert marketing rewards"
ON public.marketing_rewards_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all marketing rewards history"
ON public.marketing_rewards_history FOR SELECT
USING (is_admin());

-- RLS Policies for marketing_consent_rewards
CREATE POLICY "Users can view their own marketing consent rewards"
ON public.marketing_consent_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own marketing consent rewards"
ON public.marketing_consent_rewards FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_marketing_consents_user_id ON public.marketing_consents(user_id);
CREATE INDEX idx_marketing_consents_consent_type ON public.marketing_consents(consent_type);
CREATE INDEX idx_marketing_consents_is_granted ON public.marketing_consents(is_granted);
CREATE INDEX idx_marketing_consents_device_fingerprint ON public.marketing_consents(device_fingerprint);

CREATE INDEX idx_marketing_rewards_history_user_id ON public.marketing_rewards_history(user_id);
CREATE INDEX idx_marketing_rewards_history_device_fingerprint ON public.marketing_rewards_history(device_fingerprint);
CREATE INDEX idx_marketing_rewards_history_status ON public.marketing_rewards_history(status);

CREATE INDEX idx_marketing_consent_rewards_user_id ON public.marketing_consent_rewards(user_id);
CREATE INDEX idx_marketing_consent_rewards_status ON public.marketing_consent_rewards(status);
CREATE INDEX idx_marketing_consent_rewards_clawback_eligible ON public.marketing_consent_rewards(clawback_eligible_until);

-- Add triggers for updated_at
CREATE TRIGGER update_marketing_consents_updated_at
BEFORE UPDATE ON public.marketing_consents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_consent_rewards_updated_at
BEFORE UPDATE ON public.marketing_consent_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to migrate existing marketing consent data
CREATE OR REPLACE FUNCTION migrate_existing_marketing_consents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Migrate existing marketing_consent data to new structure
  INSERT INTO public.marketing_consents (user_id, consent_type, is_granted, granted_at, source)
  SELECT 
    user_id,
    'general' as consent_type,
    COALESCE(marketing_consent, false) as is_granted,
    COALESCE(marketing_consent_at, created_at) as granted_at,
    'settings_manual' as source
  FROM public.profiles
  WHERE marketing_consent IS NOT NULL
  ON CONFLICT DO NOTHING;
  
  -- Initialize marketing_consent_rewards for existing users
  INSERT INTO public.marketing_consent_rewards (user_id, reward_granted, status)
  SELECT 
    user_id,
    false as reward_granted,
    'pending' as status
  FROM public.profiles
  ON CONFLICT DO NOTHING;
END;
$$;

-- Execute the migration
SELECT migrate_existing_marketing_consents();