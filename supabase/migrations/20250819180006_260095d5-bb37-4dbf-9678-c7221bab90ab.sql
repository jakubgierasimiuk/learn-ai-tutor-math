-- Fix 1: Create missing universal_learner_profiles table
CREATE TABLE IF NOT EXISTS public.universal_learner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnostic_summary JSONB NOT NULL DEFAULT '{}',
  class_level INTEGER NOT NULL DEFAULT 1,
  track TEXT NOT NULL DEFAULT 'basic',
  last_diagnostic_at TIMESTAMP WITH TIME ZONE,
  learning_style JSONB NOT NULL DEFAULT '{"visual": 0.33, "auditory": 0.33, "kinesthetic": 0.33}',
  response_patterns JSONB NOT NULL DEFAULT '{"avg_response_time": 30000, "confidence_pattern": "moderate"}',
  error_patterns JSONB NOT NULL DEFAULT '{}',
  skill_mastery_map JSONB NOT NULL DEFAULT '{}',
  micro_skill_strengths JSONB NOT NULL DEFAULT '{}',
  prerequisite_gaps JSONB NOT NULL DEFAULT '{}',
  preferred_explanation_style TEXT NOT NULL DEFAULT 'detailed',
  optimal_difficulty_range JSONB NOT NULL DEFAULT '{"min": 3, "max": 7}',
  engagement_triggers JSONB NOT NULL DEFAULT '{"variety": true, "progress_feedback": true}',
  frustration_threshold NUMERIC NOT NULL DEFAULT 3,
  difficulty_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  learning_velocity NUMERIC NOT NULL DEFAULT 1.0,
  retention_rate NUMERIC NOT NULL DEFAULT 0.8,
  current_learning_context JSONB NOT NULL DEFAULT '{}',
  last_interaction_summary JSONB NOT NULL DEFAULT '{}',
  next_recommended_action JSONB NOT NULL DEFAULT '{"type": "diagnostic", "priority": "high"}',
  total_learning_time_minutes INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  concepts_mastered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.universal_learner_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own learner profile" 
ON public.universal_learner_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Fix 2: Standardize skills.content_data structure
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS content_structure JSONB DEFAULT '{
  "theory": {"sections": []},
  "examples": {"solved": []},
  "practiceExercises": []
}';

-- Update existing skills with proper content structure
UPDATE public.skills 
SET content_structure = COALESCE(content_data, '{
  "theory": {"sections": []},
  "examples": {"solved": []},
  "practiceExercises": []
}')
WHERE content_structure IS NULL;

-- Fix 3: Create unified task definitions table
CREATE TABLE IF NOT EXISTS public.task_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID REFERENCES public.skills(id),
  department TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  micro_skill TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  latex_content TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  misconception_map JSONB NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'generator' CHECK (source_type IN ('generator', 'content', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.task_definitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Anyone can view active task definitions" 
ON public.task_definitions 
FOR SELECT 
USING (is_active = true);

-- Fix 4: Update validation_logs to use proper foreign keys
ALTER TABLE public.validation_logs 
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.task_definitions(id),
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.unified_learning_sessions(id);

-- Fix 5: Create comprehensive learning analytics view
CREATE OR REPLACE VIEW public.learning_analytics AS
SELECT 
  uls.user_id,
  uls.session_type,
  uls.department,
  uls.difficulty_level,
  uls.tasks_completed,
  uls.correct_answers,
  CASE 
    WHEN uls.tasks_completed > 0 
    THEN uls.correct_answers::NUMERIC / uls.tasks_completed 
    ELSE 0 
  END as accuracy_rate,
  uls.engagement_score,
  uls.learning_momentum,
  uls.total_tokens_used,
  uls.started_at,
  uls.completed_at,
  EXTRACT(EPOCH FROM (uls.completed_at - uls.started_at))/60 as session_duration_minutes,
  ulp.learning_velocity,
  ulp.difficulty_multiplier,
  ulp.preferred_explanation_style
FROM public.unified_learning_sessions uls
LEFT JOIN public.universal_learner_profiles ulp ON ulp.user_id = uls.user_id
WHERE uls.completed_at IS NOT NULL;

-- Fix 6: Create trigger to auto-update learner profiles
CREATE OR REPLACE FUNCTION public.update_learner_profile_from_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total learning time and session count
  UPDATE public.universal_learner_profiles 
  SET 
    total_learning_time_minutes = total_learning_time_minutes + 
      COALESCE(EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60, 0),
    sessions_completed = sessions_completed + 1,
    concepts_mastered = concepts_mastered + 
      COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
    last_interaction_summary = jsonb_build_object(
      'session_type', NEW.session_type,
      'performance', NEW.engagement_score,
      'concepts_learned', COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
      'duration_minutes', EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60
    ),
    current_learning_context = jsonb_build_object(
      'last_skill', NEW.skill_focus,
      'last_department', NEW.department,
      'current_difficulty', NEW.difficulty_level,
      'momentum', NEW.learning_momentum
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_profile_on_session_complete ON public.unified_learning_sessions;
CREATE TRIGGER update_profile_on_session_complete
  AFTER UPDATE OF completed_at ON public.unified_learning_sessions
  FOR EACH ROW
  WHEN (OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION public.update_learner_profile_from_session();

-- Fix 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_universal_learner_profiles_user_id ON public.universal_learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_learning_sessions_user_id ON public.unified_learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_learning_sessions_completed ON public.unified_learning_sessions(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_definitions_skill_difficulty ON public.task_definitions(skill_id, difficulty) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_validation_logs_user_session ON public.validation_logs(user_id, session_type, created_at);