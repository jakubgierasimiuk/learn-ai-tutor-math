-- Add learner_profile column to profiles table for progressive profile building
ALTER TABLE public.profiles 
ADD COLUMN learner_profile JSONB DEFAULT '{
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

-- Add learning_goals table for tracking user goals
CREATE TABLE public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'improve_grade', 'master_topic', 'test_prep', 'strengthen_knowledge'
  target_topic TEXT,
  target_value INTEGER,
  current_progress INTEGER DEFAULT 0,
  deadline DATE,
  motivation_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on learning_goals
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_goals
CREATE POLICY "Users can manage their own learning goals"
ON public.learning_goals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for performance optimization
CREATE INDEX idx_learning_goals_user_active ON public.learning_goals(user_id, is_active);

-- Add positive motivation options to diagnostic_sessions meta field
COMMENT ON COLUMN public.diagnostic_sessions.meta IS 'Stores motivation type, learning goals, and positive assessment data';

-- Create trigger for updating learner_profile timestamp
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

CREATE TRIGGER trigger_update_learner_profile
  BEFORE UPDATE OF learner_profile ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_learner_profile_timestamp();