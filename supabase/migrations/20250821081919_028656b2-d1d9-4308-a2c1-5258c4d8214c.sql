-- Create skill examples table
CREATE TABLE public.skill_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  example_code TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  time_estimate INTEGER NOT NULL DEFAULT 120,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill theory content table  
CREATE TABLE public.skill_theory_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  theory_text TEXT NOT NULL,
  key_formulas JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_estimate INTEGER NOT NULL DEFAULT 180,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill practice exercises table
CREATE TABLE public.skill_practice_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  exercise_code TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  time_estimate INTEGER NOT NULL DEFAULT 60,
  misconception_map JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill misconception patterns table (extends existing misconception_patterns)
CREATE TABLE public.skill_misconception_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  pattern_code TEXT NOT NULL,
  description TEXT NOT NULL,
  example_error TEXT NOT NULL,
  intervention_strategy TEXT NOT NULL,
  difficulty_adjustment INTEGER DEFAULT 0,
  frequency_weight NUMERIC DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill real world applications table
CREATE TABLE public.skill_real_world_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  context TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  age_group TEXT NOT NULL,
  connection_explanation TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill pedagogical notes table
CREATE TABLE public.skill_pedagogical_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  scaffolding_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisite_skill_id UUID,
  prerequisite_description TEXT,
  next_skill_id UUID,
  next_topic_description TEXT,
  estimated_total_time INTEGER NOT NULL DEFAULT 900,
  teaching_flow JSONB NOT NULL DEFAULT '["theory", "example", "guided_practice", "independent_practice"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill assessment rubrics table
CREATE TABLE public.skill_assessment_rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL,
  scope_description TEXT NOT NULL,
  mastery_threshold INTEGER NOT NULL DEFAULT 80,
  skill_levels JSONB NOT NULL DEFAULT '{
    "beginner": "0-40% poprawnych odpowiedzi",
    "developing": "41-70% poprawnych odpowiedzi", 
    "proficient": "71-90% poprawnych odpowiedzi",
    "advanced": "91-100% poprawnych odpowiedzi"
  }'::jsonb,
  total_questions INTEGER DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.skill_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_theory_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_practice_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_misconception_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_real_world_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_pedagogical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessment_rubrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (these are educational content)
CREATE POLICY "Anyone can view active skill examples" ON public.skill_examples FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill theory" ON public.skill_theory_content FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill exercises" ON public.skill_practice_exercises FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill misconceptions" ON public.skill_misconception_patterns FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill applications" ON public.skill_real_world_applications FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill pedagogical notes" ON public.skill_pedagogical_notes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active skill rubrics" ON public.skill_assessment_rubrics FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_skill_examples_skill_id ON public.skill_examples(skill_id);
CREATE INDEX idx_skill_examples_difficulty ON public.skill_examples(difficulty_level);
CREATE INDEX idx_skill_theory_skill_id ON public.skill_theory_content(skill_id);
CREATE INDEX idx_skill_exercises_skill_id ON public.skill_practice_exercises(skill_id);
CREATE INDEX idx_skill_exercises_difficulty ON public.skill_practice_exercises(difficulty_level);
CREATE INDEX idx_skill_misconceptions_skill_id ON public.skill_misconception_patterns(skill_id);
CREATE INDEX idx_skill_misconceptions_pattern ON public.skill_misconception_patterns(pattern_code);
CREATE INDEX idx_skill_applications_skill_id ON public.skill_real_world_applications(skill_id);
CREATE INDEX idx_skill_pedagogical_skill_id ON public.skill_pedagogical_notes(skill_id);
CREATE INDEX idx_skill_rubrics_skill_id ON public.skill_assessment_rubrics(skill_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_examples_updated_at BEFORE UPDATE ON public.skill_examples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_theory_updated_at BEFORE UPDATE ON public.skill_theory_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_exercises_updated_at BEFORE UPDATE ON public.skill_practice_exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_misconceptions_updated_at BEFORE UPDATE ON public.skill_misconception_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_applications_updated_at BEFORE UPDATE ON public.skill_real_world_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_pedagogical_updated_at BEFORE UPDATE ON public.skill_pedagogical_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_rubrics_updated_at BEFORE UPDATE ON public.skill_assessment_rubrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing skills table to support generator integration
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS generator_params JSONB DEFAULT '{"microSkill": "default", "difficultyRange": [1, 3], "fallbackTrigger": true}'::jsonb;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS class_level INTEGER;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS teaching_flow JSONB DEFAULT '["theory", "example", "guided_practice", "independent_practice"]'::jsonb;