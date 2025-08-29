-- Extend profiles table for new referral system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create unique index on phone_e164 (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_e164 ON public.profiles (phone_e164) WHERE phone_e164 IS NOT NULL;

-- Create unique index on referral_code (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles (referral_code) WHERE referral_code IS NOT NULL;

-- Create devices table for anti-fraud
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_hash TEXT UNIQUE NOT NULL,
  first_ip INET NOT NULL,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devices" 
ON public.devices 
FOR ALL 
USING (auth.uid() = user_id);

-- Create fraud_signals table
CREATE TABLE IF NOT EXISTS public.fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('vpn', 'datacenter', 'voip', 'ip_burst', 'device_match', 'pseudo_activity', 'ring_detection')),
  signal_value TEXT NOT NULL,
  score_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for fraud_signals
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fraud signals" 
ON public.fraud_signals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert fraud signals" 
ON public.fraud_signals 
FOR INSERT 
WITH CHECK (true);

-- Create referral_events table for audit log
CREATE TABLE IF NOT EXISTS public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for referral_events
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referral events for their referrals" 
ON public.referral_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.referrals r 
    WHERE r.id = referral_events.referral_id 
    AND (r.referrer_id = auth.uid() OR r.referred_user_id = auth.uid())
  )
);

CREATE POLICY "System can insert referral events" 
ON public.referral_events 
FOR INSERT 
WITH CHECK (true);

-- Create rewards table for new reward system
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('days', 'tokens', 'convertible', 'points')),
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'consumed', 'revoked')),
  source TEXT NOT NULL CHECK (source IN ('activation', 'conversion', 'ladder', 'shop')),
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ
);

-- RLS for rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards" 
ON public.rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
ON public.rewards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rewards" 
ON public.rewards 
FOR ALL 
USING (true);

-- Create reward_catalog table for shop
CREATE TABLE IF NOT EXISTS public.reward_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  cost_points INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for reward_catalog
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active reward catalog" 
ON public.reward_catalog 
FOR SELECT 
USING (active = true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices (user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user_id ON public.fraud_signals (user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON public.fraud_signals (signal_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_referral_id ON public.referral_events (referral_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards (user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON public.rewards (status);
CREATE INDEX IF NOT EXISTS idx_rewards_source ON public.rewards (source);