-- Create helper function for generating random ids first
CREATE OR REPLACE FUNCTION generate_random_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(RANDOM() * 2147483647)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  diagnosis_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table (math subjects)
CREATE TABLE public.topics (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skill mastery table (diagnostic results)
CREATE TABLE public.skill_mastery (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  mastery_percentage INTEGER NOT NULL DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Create lesson sessions table
CREATE TABLE public.lesson_sessions (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  had_confusion BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Create chat log table
CREATE TABLE public.chat_logs (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES public.lesson_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'assistant_review')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create points history table
CREATE TABLE public.points_history (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  session_id INTEGER REFERENCES public.lesson_sessions(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for skill mastery
CREATE POLICY "Users can view their own skill mastery" ON public.skill_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skill mastery" ON public.skill_mastery
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for lesson sessions
CREATE POLICY "Users can view their own lesson sessions" ON public.lesson_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lesson sessions" ON public.lesson_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for chat logs
CREATE POLICY "Users can view chat logs from their sessions" ON public.chat_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.lesson_sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can insert chat logs to their sessions" ON public.chat_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.lesson_sessions WHERE id = session_id
    )
  );

-- Create RLS policies for points history
CREATE POLICY "Users can view their own points history" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points history" ON public.points_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Topics are publicly readable (no RLS needed for read access)
CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT USING (true);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_mastery_updated_at
  BEFORE UPDATE ON public.skill_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial topics data
INSERT INTO public.topics (name, description, difficulty_level) VALUES
('Twierdzenie Pitagorasa', 'Relacja między długościami boków trójkąta prostokątnego: a² + b² = c²', 1),
('Równania liniowe', 'Rozwiązywanie równań pierwszego stopnia z jedną niewiadomą', 1),
('Równania kwadratowe', 'Równania drugiego stopnia i metody ich rozwiązywania', 2),
('Funkcje liniowe', 'Funkcje postaci y = ax + b i ich właściwości', 1),
('Logarytmy', 'Definicja logarytmu, własności i obliczenia', 3),
('Trygonometria', 'Funkcje trygonometryczne i ich zastosowania', 2),
('Geometria analityczna', 'Współrzędne punktów, odległości i równania prostych', 2),
('Ciągi liczbowe', 'Ciągi arytmetyczne i geometryczne', 2);