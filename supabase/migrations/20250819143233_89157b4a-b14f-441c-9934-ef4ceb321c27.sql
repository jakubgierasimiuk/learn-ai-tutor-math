-- Add learner_profile column to profiles table for progressive profile building
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS learner_profile JSONB DEFAULT '{
  "learning_goals": [],
  "motivation_type": "achievement", 
  "preferred_difficulty": 3,
  "struggle_areas": [],
  "strength_areas": [],
  "learning_pace": "normal",
  "diagnostic_data": {},
  "performance_patterns": {},
  "last_updated": null
}'::jsonb;

-- Update existing learning_goals table with new columns
ALTER TABLE public.learning_goals 
ADD COLUMN IF NOT EXISTS motivation_message TEXT,
ADD COLUMN IF NOT EXISTS target_topic TEXT;

-- Add positive motivation options to diagnostic_sessions meta field
COMMENT ON COLUMN public.diagnostic_sessions.meta IS 'Stores motivation type, learning goals, and positive assessment data';

-- Create or replace trigger for updating learner_profile timestamp
CREATE OR REPLACE FUNCTION update_learner_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.learner_profile = jsonb_set(
    COALESCE(NEW.learner_profile, '{}'::jsonb),
    '{last_updated}',
    to_jsonb(NOW()::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_learner_profile ON public.profiles;
CREATE TRIGGER trigger_update_learner_profile
  BEFORE UPDATE OF learner_profile ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_learner_profile_timestamp();