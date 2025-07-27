-- Create referral system tables

-- Referral codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'trial', 'completed', 'expired')),
  trial_started_at TIMESTAMPTZ,
  subscription_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id) -- One referral per user
);

-- Referral rewards table
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_month', 'points')),
  amount INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Physical rewards catalog
CREATE TABLE public.rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User referral stats
CREATE TABLE public.user_referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  free_months_earned INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'beginner',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reward claims table
CREATE TABLE public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards_catalog(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'fulfilled', 'cancelled')),
  delivery_info JSONB,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" ON referral_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they're involved in" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can manage referrals" ON referrals
  FOR ALL USING (true);

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view their own rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rewards" ON referral_rewards
  FOR ALL USING (true);

-- RLS Policies for rewards_catalog
CREATE POLICY "Anyone can view active rewards" ON rewards_catalog
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_referral_stats
CREATE POLICY "Users can view their own stats" ON user_referral_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_referral_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage stats" ON user_referral_stats
  FOR ALL USING (true);

-- RLS Policies for reward_claims
CREATE POLICY "Users can view their own claims" ON reward_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" ON reward_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats(p_user_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats when referral status changes
CREATE OR REPLACE FUNCTION trigger_update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_referral_stats(NEW.referrer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referral_status_change
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_referral_stats();

-- Insert sample rewards catalog
INSERT INTO rewards_catalog (name, description, points_required, category, is_active) VALUES
('Spotify Premium - 1 miesiąc', 'Karta podarunkowa Spotify Premium na 1 miesiąc', 3, 'streaming', true),
('Netflix - 50 zł', 'Karta podarunkowa Netflix o wartości 50 zł', 5, 'streaming', true),
('Amazon - 50 zł', 'Karta podarunkowa Amazon o wartości 50 zł', 5, 'shopping', true),
('Allegro - 100 zł', 'Karta podarunkowa Allegro o wartości 100 zł', 10, 'shopping', true),
('Empik - 100 zł', 'Karta podarunkowa Empik o wartości 100 zł', 10, 'books', true),
('Steam - 100 zł', 'Karta podarunkowa Steam o wartości 100 zł', 10, 'gaming', true);

-- Create trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referral_stats_updated_at
  BEFORE UPDATE ON user_referral_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();