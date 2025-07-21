-- Create math topics with structured content
CREATE TABLE public.topics (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'mathematics',
  prerequisites TEXT[], -- Array of topic IDs or names
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  estimated_time_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create lessons table for structured learning content
CREATE TABLE public.lessons (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  topic_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'theory', -- theory, practice, quiz, interactive
  content_data JSONB NOT NULL DEFAULT '{}', -- Lesson content, questions, etc.
  lesson_order INTEGER NOT NULL DEFAULT 1,
  estimated_time_minutes INTEGER DEFAULT 15,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user lesson progress tracking
CREATE TABLE public.user_lesson_progress (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  completion_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  score NUMERIC DEFAULT NULL, -- For quizzes/exercises
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics (public read access)
CREATE POLICY "Anyone can view active topics" 
ON public.topics 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for lessons (public read access)
CREATE POLICY "Anyone can view active lessons" 
ON public.lessons 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user lesson progress
CREATE POLICY "Users can view their own lesson progress" 
ON public.user_lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" 
ON public.user_lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.user_lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create foreign key relationships
ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id);

ALTER TABLE public.user_lesson_progress 
ADD CONSTRAINT user_lesson_progress_lesson_id_fkey 
FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);

ALTER TABLE public.user_lesson_progress 
ADD CONSTRAINT user_lesson_progress_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id);

-- Add updated_at trigger for lessons
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for user_lesson_progress
CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial math topics
INSERT INTO public.topics (name, description, difficulty_level, category, learning_objectives, estimated_time_minutes) VALUES
('Arytmetyka podstawowa', 'Podstawowe operacje matematyczne: dodawanie, odejmowanie, mnożenie, dzielenie', 1, 'mathematics', 
 ARRAY['Opanowanie podstawowych operacji arytmetycznych', 'Rozumienie kolejności wykonywania działań', 'Umiejętność wykonywania obliczeń w pamięci'], 45),
('Ułamki', 'Wprowadzenie do ułamków zwykłych i dziesiętnych', 2, 'mathematics',
 ARRAY['Rozumienie pojęcia ułamka', 'Dodawanie i odejmowanie ułamków', 'Mnożenie i dzielenie ułamków', 'Zamiana ułamków na liczby dziesiętne'], 60),
('Procenty', 'Obliczanie procentów i zastosowania praktyczne', 2, 'mathematics',
 ARRAY['Rozumienie pojęcia procenta', 'Obliczanie procentu z liczby', 'Rozwiązywanie zadań z życia codziennego'], 50),
('Równania liniowe', 'Rozwiązywanie równań pierwszego stopnia z jedną niewiadomą', 3, 'mathematics',
 ARRAY['Rozumienie pojęcia równania', 'Metody rozwiązywania równań liniowych', 'Sprawdzanie poprawności rozwiązań'], 75),
('Geometria płaska', 'Podstawowe figury geometryczne i ich właściwości', 3, 'mathematics',
 ARRAY['Rozpoznawanie figur geometrycznych', 'Obliczanie pól i obwodów', 'Twierdzenie Pitagorasa'], 90),
('Funkcje liniowe', 'Wprowadzenie do funkcji i ich reprezentacji graficznej', 4, 'mathematics',
 ARRAY['Rozumienie pojęcia funkcji', 'Rysowanie wykresów funkcji liniowych', 'Interpretacja parametrów funkcji'], 80);

-- Insert sample lessons for arithmetic topic
INSERT INTO public.lessons (topic_id, title, description, content_type, content_data, lesson_order, estimated_time_minutes, difficulty_level) VALUES
(
  (SELECT id FROM public.topics WHERE name = 'Arytmetyka podstawowa' LIMIT 1),
  'Dodawanie i odejmowanie',
  'Podstawy dodawania i odejmowania liczb naturalnych',
  'theory',
  '{
    "theory_content": "Dodawanie to łączenie dwóch lub więcej liczb w jedną sumę. Odejmowanie to operacja odwrotna do dodawania.",
    "examples": [
      {"question": "5 + 3 = ?", "answer": "8", "explanation": "Dodajemy 3 do 5"},
      {"question": "10 - 4 = ?", "answer": "6", "explanation": "Od 10 odejmujemy 4"}
    ],
    "key_concepts": ["Dodawanie", "Odejmowanie", "Liczby naturalne"]
  }',
  1, 15, 1
),
(
  (SELECT id FROM public.topics WHERE name = 'Arytmetyka podstawowa' LIMIT 1),
  'Mnożenie i dzielenie',
  'Podstawy mnożenia i dzielenia liczb naturalnych',
  'theory',
  '{
    "theory_content": "Mnożenie to skrócony sposób dodawania tej samej liczby. Dzielenie to operacja odwrotna do mnożenia.",
    "examples": [
      {"question": "4 × 3 = ?", "answer": "12", "explanation": "4 powtórzone 3 razy: 4+4+4=12"},
      {"question": "15 ÷ 3 = ?", "answer": "5", "explanation": "15 podzielone na 3 równe części"}
    ],
    "key_concepts": ["Mnożenie", "Dzielenie", "Tabliczka mnożenia"]
  }',
  2, 20, 1
),
(
  (SELECT id FROM public.topics WHERE name = 'Arytmetyka podstawowa' LIMIT 1),
  'Ćwiczenia praktyczne',
  'Rozwiąż zadania z podstawowych operacji',
  'practice',
  '{
    "exercises": [
      {"question": "Oblicz: 25 + 17", "answer": "42", "type": "calculation"},
      {"question": "Oblicz: 48 - 29", "answer": "19", "type": "calculation"},
      {"question": "Oblicz: 7 × 8", "answer": "56", "type": "calculation"},
      {"question": "Oblicz: 72 ÷ 9", "answer": "8", "type": "calculation"},
      {"question": "Anna ma 35 cukierków. Daje 12 swojemu bratu. Ile cukierków zostało Annie?", "answer": "23", "type": "word_problem"}
    ]
  }',
  3, 25, 1
);