-- Add milestone_rewards_claimed column to track which milestones have been rewarded
ALTER TABLE user_referral_stats
ADD COLUMN IF NOT EXISTS milestone_rewards_claimed INTEGER[] DEFAULT '{}';

-- Function to award ladder bonuses when user reaches milestones (2, 5, 10 conversions)
CREATE OR REPLACE FUNCTION award_ladder_bonus()
RETURNS TRIGGER AS $$
DECLARE
  bonus_days INTEGER := 0;
  milestone_reached INTEGER := 0;
  already_claimed BOOLEAN := false;
BEGIN
  -- Check if user reached a milestone
  IF NEW.successful_referrals >= 2 AND OLD.successful_referrals < 2 THEN
    milestone_reached := 2;
    bonus_days := 30; -- Additional 30 days (total 60 days with first conversion)
  ELSIF NEW.successful_referrals >= 5 AND OLD.successful_referrals < 5 THEN
    milestone_reached := 5;
    bonus_days := 60; -- Additional 60 days (2 months)
  ELSIF NEW.successful_referrals >= 10 AND OLD.successful_referrals < 10 THEN
    milestone_reached := 10;
    bonus_days := 150; -- Additional 150 days (5 months)
  END IF;
  
  -- If milestone reached, check if not already claimed
  IF milestone_reached > 0 THEN
    already_claimed := milestone_reached = ANY(NEW.milestone_rewards_claimed);
    
    IF NOT already_claimed THEN
      -- Grant reward
      INSERT INTO rewards (user_id, kind, amount, source, status, meta, released_at)
      VALUES (
        NEW.user_id,
        'days',
        bonus_days,
        'referral_milestone',
        'released',
        jsonb_build_object(
          'milestone', milestone_reached,
          'total_conversions', NEW.successful_referrals,
          'bonus_description', 
          CASE 
            WHEN milestone_reached = 2 THEN '2 konwersje - dodatkowy miesiąc!'
            WHEN milestone_reached = 5 THEN '5 konwersji - dodatkowe 2 miesiące!'
            WHEN milestone_reached = 10 THEN '10 konwersji - dodatkowe 5 miesięcy!'
          END
        ),
        now()
      );
      
      -- Mark milestone as claimed
      NEW.milestone_rewards_claimed := array_append(NEW.milestone_rewards_claimed, milestone_reached);
      
      -- Log event
      INSERT INTO referral_events (referral_id, event_type, payload)
      SELECT 
        r.id,
        'milestone_reached',
        jsonb_build_object(
          'milestone', milestone_reached,
          'bonus_days', bonus_days,
          'total_conversions', NEW.successful_referrals
        )
      FROM referrals r
      WHERE r.referrer_id = NEW.user_id
      ORDER BY r.created_at DESC
      LIMIT 1;
      
      RAISE NOTICE 'Milestone % reached for user %. Awarded % days.', milestone_reached, NEW.user_id, bonus_days;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on user_referral_stats
DROP TRIGGER IF EXISTS award_ladder_bonuses_trigger ON user_referral_stats;
CREATE TRIGGER award_ladder_bonuses_trigger
AFTER UPDATE ON user_referral_stats
FOR EACH ROW
WHEN (NEW.successful_referrals > OLD.successful_referrals)
EXECUTE FUNCTION award_ladder_bonus();