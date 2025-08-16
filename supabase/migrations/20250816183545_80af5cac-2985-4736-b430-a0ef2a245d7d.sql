-- STEP 1: Rozbudowa tabeli skills o nowe pola
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS learning_objectives jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS phases jsonb DEFAULT '{}'::jsonb;

-- STEP 2: Utworzenie tabeli skill_phases dla systemu 5 faz nauki
CREATE TABLE IF NOT EXISTS public.skill_phases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  phase_number integer NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  phase_name text NOT NULL,
  phase_description text,
  success_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_instructions text,
  estimated_duration_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(skill_id, phase_number)
);

-- Enable RLS on skill_phases
ALTER TABLE public.skill_phases ENABLE ROW LEVEL SECURITY;

-- RLS policies for skill_phases
CREATE POLICY "Anyone can view active skill phases" 
ON public.skill_phases 
FOR SELECT 
USING (is_active = true);

-- STEP 3: Utworzenie tabeli micro_skills
CREATE TABLE IF NOT EXISTS public.micro_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  task_types text[] DEFAULT '{}',
  difficulty_range integer[] DEFAULT '{1,5}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on micro_skills
ALTER TABLE public.micro_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for micro_skills
CREATE POLICY "Anyone can view active micro skills" 
ON public.micro_skills 
FOR SELECT 
USING (is_active = true);

-- STEP 4: Utworzenie tabeli learning_phase_progress
CREATE TABLE IF NOT EXISTS public.learning_phase_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  phase_number integer NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  attempts_count integer DEFAULT 0,
  correct_attempts integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_attempt_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, skill_id, phase_number)
);

-- Enable RLS on learning_phase_progress
ALTER TABLE public.learning_phase_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_phase_progress
CREATE POLICY "Users can manage their own learning phase progress" 
ON public.learning_phase_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- STEP 5: Utworzenie tabeli skill_prerequisites
CREATE TABLE IF NOT EXISTS public.skill_prerequisites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  prerequisite_skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  required_mastery_level integer DEFAULT 80 CHECK (required_mastery_level BETWEEN 0 AND 100),
  is_hard_requirement boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(skill_id, prerequisite_skill_id),
  CHECK (skill_id != prerequisite_skill_id)
);

-- Enable RLS on skill_prerequisites
ALTER TABLE public.skill_prerequisites ENABLE ROW LEVEL SECURITY;

-- RLS policies for skill_prerequisites
CREATE POLICY "Anyone can view skill prerequisites" 
ON public.skill_prerequisites 
FOR SELECT 
USING (true);

-- STEP 6: Utworzenie tabeli misconception_patterns
CREATE TABLE IF NOT EXISTS public.misconception_patterns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  department text NOT NULL,
  micro_skill text NOT NULL,
  misconception_id text NOT NULL,
  description text NOT NULL,
  feedback_template text NOT NULL,
  correction_strategy text,
  difficulty_adjustment integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(department, micro_skill, misconception_id)
);

-- Enable RLS on misconception_patterns
ALTER TABLE public.misconception_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies for misconception_patterns
CREATE POLICY "Anyone can view active misconception patterns" 
ON public.misconception_patterns 
FOR SELECT 
USING (is_active = true);

-- STEP 7: Dodanie triggera do aktualizacji updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla nowych tabel
CREATE TRIGGER update_skill_phases_updated_at 
  BEFORE UPDATE ON public.skill_phases 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_micro_skills_updated_at 
  BEFORE UPDATE ON public.micro_skills 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_phase_progress_updated_at 
  BEFORE UPDATE ON public.learning_phase_progress 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();