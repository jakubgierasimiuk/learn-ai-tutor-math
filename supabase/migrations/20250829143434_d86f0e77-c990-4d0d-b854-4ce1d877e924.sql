-- Update referrals table for v2 system
-- First backup existing data structure before changes
ALTER TABLE public.referrals DROP COLUMN IF EXISTS trial_started_at;
ALTER TABLE public.referrals DROP COLUMN IF EXISTS subscription_activated_at;

-- Add new columns for v2 system
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'invited' CHECK (stage IN ('invited', 'activated', 'converted', 'blocked'));
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS phone_hash TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS device_hash TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS ip INET;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '{}';

-- Remove old status column and use stage instead
ALTER TABLE public.referrals DROP COLUMN IF EXISTS status;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_stage ON public.referrals (stage);
CREATE INDEX IF NOT EXISTS idx_referrals_risk_score ON public.referrals (risk_score);
CREATE INDEX IF NOT EXISTS idx_referrals_ip ON public.referrals (ip);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals (referrer_id);

-- Update foreign key constraint for referral_events
ALTER TABLE public.referral_events 
DROP CONSTRAINT IF EXISTS referral_events_referral_id_fkey;

ALTER TABLE public.referral_events 
ADD CONSTRAINT referral_events_referral_id_fkey 
FOREIGN KEY (referral_id) REFERENCES public.referrals(id) ON DELETE CASCADE;

-- Add foreign key constraints to other tables
ALTER TABLE public.devices 
ADD CONSTRAINT devices_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.fraud_signals 
ADD CONSTRAINT fraud_signals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.rewards 
ADD CONSTRAINT rewards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
  p_user_id UUID,
  p_phone_verified BOOLEAN DEFAULT FALSE,
  p_phone_is_voip BOOLEAN DEFAULT FALSE,
  p_ip_is_vpn BOOLEAN DEFAULT FALSE,
  p_device_is_duplicate BOOLEAN DEFAULT FALSE,
  p_onboarding_completed BOOLEAN DEFAULT FALSE,
  p_learning_time_minutes INTEGER DEFAULT 0
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
  ip_burst_count INTEGER;
BEGIN
  -- Base score for SMS verification + HLR
  IF p_phone_verified AND NOT p_phone_is_voip THEN
    score := score + 40;
  END IF;

  -- Check for no collisions (phone/device/ip)
  IF NOT p_device_is_duplicate THEN
    score := score + 20;
  END IF;

  -- Onboarding completion
  IF p_onboarding_completed AND p_learning_time_minutes >= 20 THEN
    score := score + 10;
  END IF;

  -- Penalties
  IF p_ip_is_vpn THEN
    score := score - 30;
  END IF;

  IF p_phone_is_voip THEN
    score := score - 20;
  END IF;

  IF p_device_is_duplicate THEN
    score := score - 20;
  END IF;

  -- Pseudo-activity penalty (ultra-short learning sessions)
  IF p_learning_time_minutes > 0 AND p_learning_time_minutes < 5 THEN
    score := score - 10;
  END IF;

  -- Ensure score is between 0 and 100
  score := GREATEST(0, LEAST(100, score));

  RETURN score;
END;
$$;

-- Create function to update referral stats (updated for v2)
CREATE OR REPLACE FUNCTION public.update_referral_stats_v2(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activated_count INTEGER;
  converted_count INTEGER;
  total_points INTEGER;
  available_points INTEGER;
  free_months INTEGER;
  tier TEXT;
BEGIN
  -- Count activated referrals
  SELECT COUNT(*) INTO activated_count
  FROM referrals
  WHERE referrer_id = p_user_id AND stage IN ('activated', 'converted');
  
  -- Count converted referrals
  SELECT COUNT(*) INTO converted_count
  FROM referrals
  WHERE referrer_id = p_user_id AND stage = 'converted';
  
  -- Calculate free months based on conversions (ladder system)
  IF converted_count >= 10 THEN
    free_months := 5 + 2 + 1; -- 10+ = 5, 5+ = 2, 2+ = 1
  ELSIF converted_count >= 5 THEN
    free_months := 2 + 1; -- 5+ = 2, 2+ = 1
  ELSIF converted_count >= 2 THEN
    free_months := 1; -- 2+ = 1
  ELSE
    free_months := 0;
  END IF;
  
  -- Calculate points (1 point per conversion above 10)
  IF converted_count > 10 THEN
    total_points := converted_count - 10;
  ELSE
    total_points := 0;
  END IF;
  
  -- Calculate available points (subtract spent points from rewards)
  SELECT COALESCE(total_points - COALESCE(SUM(amount), 0), total_points) 
  INTO available_points
  FROM rewards
  WHERE user_id = p_user_id AND kind = 'points' AND status = 'consumed';
  
  -- Determine tier
  IF converted_count >= 20 THEN
    tier := 'legend';
  ELSIF converted_count >= 10 THEN
    tier := 'ambassador';
  ELSIF converted_count >= 5 THEN
    tier := 'promoter';
  ELSIF converted_count >= 2 THEN
    tier := 'advocate';
  ELSE
    tier := 'beginner';
  END IF;
  
  -- Upsert stats
  INSERT INTO user_referral_stats (
    user_id, successful_referrals, total_points, available_points, 
    free_months_earned, current_tier, updated_at
  )
  VALUES (
    p_user_id, converted_count, total_points, available_points,
    free_months, tier, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    successful_referrals = EXCLUDED.successful_referrals,
    total_points = EXCLUDED.total_points,
    available_points = EXCLUDED.available_points,
    free_months_earned = EXCLUDED.free_months_earned,
    current_tier = EXCLUDED.current_tier,
    updated_at = now();
END;
$$;

-- Create trigger to auto-update stats when referral stage changes
CREATE OR REPLACE FUNCTION public.trigger_update_referral_stats_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update stats if stage changed to activated or converted
  IF NEW.stage IN ('activated', 'converted') AND (OLD.stage IS NULL OR OLD.stage != NEW.stage) THEN
    PERFORM update_referral_stats_v2(NEW.referrer_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_referral_stats ON public.referrals;
CREATE TRIGGER trigger_update_referral_stats_v2
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_referral_stats_v2();