-- Create Universal Learner Profiles table as central hub for all learning data
CREATE TABLE public.universal_learner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Diagnostic Data
  diagnostic_summary JSONB DEFAULT '{}',
  class_level INTEGER DEFAULT 1,
  track TEXT DEFAULT 'basic',
  last_diagnostic_at TIMESTAMP WITH TIME ZONE,
  
  -- Cognitive Profile
  learning_style JSONB DEFAULT '{}', -- visual, auditory, kinesthetic preferences
  response_patterns JSONB DEFAULT '{}', -- speed, accuracy, confidence patterns
  error_patterns JSONB DEFAULT '{}', -- common misconceptions and error types
  
  -- Skill Mastery Matrix
  skill_mastery_map JSONB DEFAULT '{}', -- detailed skill progress across all subjects
  micro_skill_strengths JSONB DEFAULT '{}', -- strengths in specific micro-skills
  prerequisite_gaps JSONB DEFAULT '{}', -- identified prerequisite knowledge gaps
  
  -- AI Interaction Profile
  preferred_explanation_style TEXT DEFAULT 'balanced', -- concise, detailed, visual, step-by-step
  optimal_difficulty_range JSONB DEFAULT '{"min": 1, "max": 10}',
  engagement_triggers JSONB DEFAULT '{}', -- what keeps the user engaged
  frustration_threshold INTEGER DEFAULT 3, -- consecutive errors before intervention
  
  -- Adaptive Parameters
  difficulty_multiplier NUMERIC DEFAULT 1.0,
  learning_velocity NUMERIC DEFAULT 1.0, -- how fast the user learns new concepts
  retention_rate NUMERIC DEFAULT 0.8, -- how well the user retains knowledge
  
  -- Session Context
  current_learning_context JSONB DEFAULT '{}', -- what they're currently working on
  last_interaction_summary JSONB DEFAULT '{}', -- summary of last learning session
  next_recommended_action JSONB DEFAULT '{}', -- what the system recommends next
  
  -- Progress Tracking
  total_learning_time_minutes INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  concepts_mastered INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.universal_learner_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own learning profile"
ON public.universal_learner_profiles
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_universal_learner_profiles_updated_at
BEFORE UPDATE ON public.universal_learner_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_universal_learner_profiles_user_id ON public.universal_learner_profiles(user_id);
CREATE INDEX idx_universal_learner_profiles_updated_at ON public.universal_learner_profiles(updated_at);

-- Create Learning Sessions table to track unified sessions across all learning modes
CREATE TABLE public.unified_learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.universal_learner_profiles(id),
  
  -- Session Identification
  session_type TEXT NOT NULL DEFAULT 'mixed', -- 'ai_chat', 'study_learn', 'diagnostic', 'mixed'
  skill_focus UUID, -- references skills table
  department TEXT,
  
  -- Session Metrics
  difficulty_level NUMERIC DEFAULT 5.0,
  tasks_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_response_time_ms INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  
  -- Adaptation Data
  difficulty_adjustments JSONB DEFAULT '[]', -- track how difficulty changed during session
  engagement_score NUMERIC DEFAULT 0.5, -- 0-1 scale
  frustration_incidents INTEGER DEFAULT 0,
  learning_momentum NUMERIC DEFAULT 1.0, -- how well the session is going
  
  -- AI Interaction Data
  ai_model_used TEXT DEFAULT 'gpt-4o-mini',
  total_tokens_used INTEGER DEFAULT 0,
  explanation_style_used TEXT DEFAULT 'balanced',
  
  -- Session Flow
  learning_path JSONB DEFAULT '[]', -- track the sequence of topics/skills covered
  context_switches INTEGER DEFAULT 0, -- how many times user switched between modes
  
  -- Outcomes
  concepts_learned JSONB DEFAULT '[]',
  misconceptions_addressed JSONB DEFAULT '[]',
  next_session_recommendations JSONB DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unified_learning_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own learning sessions"
ON public.unified_learning_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_unified_learning_sessions_updated_at
BEFORE UPDATE ON public.unified_learning_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_unified_learning_sessions_user_id ON public.unified_learning_sessions(user_id);
CREATE INDEX idx_unified_learning_sessions_profile_id ON public.unified_learning_sessions(profile_id);
CREATE INDEX idx_unified_learning_sessions_type ON public.unified_learning_sessions(session_type);
CREATE INDEX idx_unified_learning_sessions_skill_focus ON public.unified_learning_sessions(skill_focus);