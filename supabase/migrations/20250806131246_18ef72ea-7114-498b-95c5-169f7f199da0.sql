-- Create skills table (814 atomic math skills from MEN curriculum)
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL, -- 'algebra', 'geometry', 'trigonometry', etc.
  level TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'extended'
  class_level INTEGER NOT NULL DEFAULT 1, -- 1-4 (liceum)
  prerequisites UUID[], -- array of skill UUIDs
  estimated_time_minutes INTEGER DEFAULT 15,
  difficulty_rating INTEGER DEFAULT 1, -- 1-5
  men_code TEXT, -- official MEN curriculum code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active skills
CREATE POLICY "Anyone can view active skills" 
ON public.skills 
FOR SELECT 
USING (is_active = true);

-- Create skill_progress table (Spaced Repetition algorithm)
CREATE TABLE public.skill_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  mastery_level INTEGER DEFAULT 0, -- 0-5 (Leitner boxes)
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  difficulty_multiplier DECIMAL DEFAULT 1.0,
  is_mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS for skill_progress
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own skill progress
CREATE POLICY "Users can manage their own skill progress" 
ON public.skill_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  session_type TEXT NOT NULL DEFAULT 'lesson', -- 'lesson', 'diagnostic', 'review', 'quiz'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  total_steps INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  early_reveals INTEGER DEFAULT 0, -- "Pokaż rozwiązanie" clicks
  pseudo_activity_strikes INTEGER DEFAULT 0,
  average_response_time_ms INTEGER,
  mastery_score DECIMAL, -- final assessment 0-100
  ai_model_used TEXT DEFAULT 'gpt-4o',
  total_tokens_used INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own study sessions
CREATE POLICY "Users can manage their own study sessions" 
ON public.study_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create lesson_steps table (tracks progress within a lesson)
CREATE TABLE public.lesson_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.study_sessions(id),
  step_number INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'question', 'explanation', 'hint', 'solution'
  ai_prompt TEXT,
  ai_response TEXT,
  user_input TEXT,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for lesson_steps
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage steps from their own sessions
CREATE POLICY "Users can manage their own lesson steps" 
ON public.lesson_steps 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.study_sessions 
  WHERE id = lesson_steps.session_id
));

-- Create diagnostic_tests table
CREATE TABLE public.diagnostic_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  test_type TEXT NOT NULL DEFAULT 'pre_lesson', -- 'pre_lesson', 'recheck'
  questions_data JSONB NOT NULL, -- array of questions and answers
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  final_score DECIMAL, -- 0-100
  estimated_mastery_level INTEGER, -- 0-5 for Leitner
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for diagnostic_tests
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own diagnostic tests
CREATE POLICY "Users can manage their own diagnostic tests" 
ON public.diagnostic_tests 
FOR ALL 
USING (auth.uid() = user_id);

-- Create user_daily_limits table (token usage tracking)
CREATE TABLE public.user_daily_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_used INTEGER DEFAULT 0,
  soft_limit INTEGER DEFAULT 20000,
  hard_limit INTEGER DEFAULT 25000,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS for user_daily_limits
ALTER TABLE public.user_daily_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own limits
CREATE POLICY "Users can view their own daily limits" 
ON public.user_daily_limits 
FOR ALL 
USING (auth.uid() = user_id);

-- Create math_validation_cache table (for future Python/SymPy integration)
CREATE TABLE public.math_validation_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expression_hash TEXT NOT NULL UNIQUE,
  input_expression TEXT NOT NULL,
  validation_result JSONB,
  is_correct BOOLEAN,
  error_message TEXT,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for math_validation_cache
ALTER TABLE public.math_validation_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cache (for performance)
CREATE POLICY "Anyone can read math validation cache" 
ON public.math_validation_cache 
FOR SELECT 
USING (true);

-- Add trigger for updating timestamps
CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_progress_updated_at
BEFORE UPDATE ON public.skill_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample skills data (basic math curriculum)
INSERT INTO public.skills (name, description, department, level, class_level, men_code) VALUES
('Działania na liczbach rzeczywistych', 'Podstawowe operacje arytmetyczne na liczbach rzeczywistych', 'algebra', 'basic', 1, 'MAT.I.1.1'),
('Rozwiązywanie równań liniowych', 'Umiejętność rozwiązywania równań pierwszego stopnia', 'algebra', 'basic', 1, 'MAT.I.2.1'),
('Funkcja liniowa', 'Zrozumienie pojęcia funkcji liniowej i jej właściwości', 'funkcje', 'basic', 1, 'MAT.I.3.1'),
('Twierdzenie Pitagorasa', 'Zastosowanie twierdzenia Pitagorasa w geometrii', 'geometry', 'basic', 1, 'MAT.I.4.1'),
('Równania kwadratowe', 'Rozwiązywanie równań drugiego stopnia', 'algebra', 'basic', 2, 'MAT.II.2.2'),
('Funkcje trygonometryczne', 'Podstawowe funkcje trygonometryczne w trójkącie prostokątnym', 'trigonometry', 'basic', 2, 'MAT.II.5.1'),
('Ciągi arytmetyczne', 'Zrozumienie i zastosowanie ciągów arytmetycznych', 'sequences', 'basic', 2, 'MAT.II.6.1'),
('Prawdopodobieństwo klasyczne', 'Obliczanie prawdopodobieństwa w modelach klasycznych', 'statistics', 'basic', 3, 'MAT.III.8.1'),
('Pochodna funkcji', 'Pojęcie pochodnej i jej interpretacja geometryczna', 'calculus', 'extended', 3, 'MAT.III.7.1'),
('Całka nieoznaczona', 'Podstawy rachunku całkowego', 'calculus', 'extended', 4, 'MAT.IV.7.2');