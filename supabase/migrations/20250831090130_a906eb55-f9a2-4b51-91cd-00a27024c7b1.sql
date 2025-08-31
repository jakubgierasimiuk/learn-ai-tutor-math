-- Fix remaining database functions with missing search_path
-- These were identified by the security linter

-- Fix generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, trunc(random() * length(chars))::integer + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix update_referral_stats function
CREATE OR REPLACE FUNCTION public.update_referral_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  successful_count INTEGER;
  total_points INTEGER;
  available_points INTEGER;
  free_months INTEGER;
  tier TEXT;
BEGIN
  -- Count successful referrals
  SELECT COUNT(*) INTO successful_count
  FROM referrals
  WHERE referrer_id = p_user_id AND status = 'completed';
  
  -- Calculate free months based on referrals
  IF successful_count >= 10 THEN
    free_months := 5;
  ELSIF successful_count >= 5 THEN
    free_months := 2;
  ELSIF successful_count >= 2 THEN
    free_months := 1;
  ELSE
    free_months := 0;
  END IF;
  
  -- Calculate points (1 point per referral above 10)
  IF successful_count > 10 THEN
    total_points := successful_count - 10;
  ELSE
    total_points := 0;
  END IF;
  
  -- Calculate available points (subtract spent points)
  SELECT COALESCE(total_points - COALESCE(SUM(points_spent), 0), total_points) 
  INTO available_points
  FROM reward_claims
  WHERE user_id = p_user_id AND status != 'cancelled';
  
  -- Determine tier
  IF successful_count >= 20 THEN
    tier := 'legend';
  ELSIF successful_count >= 10 THEN
    tier := 'ambassador';
  ELSIF successful_count >= 5 THEN
    tier := 'promoter';
  ELSIF successful_count >= 2 THEN
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
    p_user_id, successful_count, total_points, available_points,
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

-- Fix update_referral_stats_v2 function
CREATE OR REPLACE FUNCTION public.update_referral_stats_v2(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix calculate_risk_score function
CREATE OR REPLACE FUNCTION public.calculate_risk_score(p_user_id uuid, p_phone_verified boolean DEFAULT false, p_phone_is_voip boolean DEFAULT false, p_ip_is_vpn boolean DEFAULT false, p_device_is_duplicate boolean DEFAULT false, p_onboarding_completed boolean DEFAULT false, p_learning_time_minutes integer DEFAULT 0)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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