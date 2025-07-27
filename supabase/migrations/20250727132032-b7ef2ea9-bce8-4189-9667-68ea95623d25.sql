-- Fix security warnings by setting search_path for functions

-- Fix generate_referral_code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT 
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
CREATE OR REPLACE FUNCTION update_referral_stats(p_user_id UUID)
RETURNS VOID 
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

-- Fix trigger_update_referral_stats function
CREATE OR REPLACE FUNCTION trigger_update_referral_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM update_referral_stats(NEW.referrer_id);
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;