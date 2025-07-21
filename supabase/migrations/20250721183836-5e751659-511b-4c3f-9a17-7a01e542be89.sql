-- Create achievements system
CREATE TABLE public.achievements (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- points, lessons_completed, streak, score_average, topics_mastered
  condition_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general', -- general, learning, social, special
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements tracking
CREATE TABLE public.user_achievements (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user streaks tracking
CREATE TABLE public.user_streaks (
  id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read access)
CREATE POLICY "Anyone can view active achievements" 
ON public.achievements 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user streaks
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks" 
ON public.user_streaks 
FOR ALL 
USING (auth.uid() = user_id);

-- Create foreign key relationships
ALTER TABLE public.user_achievements 
ADD CONSTRAINT user_achievements_achievement_id_fkey 
FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);

-- Add updated_at trigger for user_streaks
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, points_reward, category) VALUES
('Pierwszy krok', 'Ukończ swoją pierwszą lekcję', '🎯', 'lessons_completed', 1, 50, 'learning'),
('Początkujący uczony', 'Zdobądź 100 punktów', '📚', 'points', 100, 25, 'general'),
('Matematyczny talent', 'Ukończ 5 lekcji', '🧮', 'lessons_completed', 5, 100, 'learning'),
('Mistrz liczb', 'Zdobądź 500 punktów', '🏆', 'points', 500, 100, 'general'),
('Perfekcjonista', 'Uzyskaj średnią ocenę 90% z 3 lekcji', '⭐', 'score_average', 90, 150, 'learning'),
('Seria zwycięstw', 'Utrzymaj passę nauki przez 3 dni', '🔥', 'streak', 3, 75, 'general'),
('Długodystansowiec', 'Utrzymaj passę nauki przez 7 dni', '💪', 'streak', 7, 200, 'general'),
('Ekspert tematów', 'Ukończ wszystkie lekcje z 2 tematów', '🎓', 'topics_mastered', 2, 250, 'learning'),
('Uczony mistrz', 'Zdobądź 1000 punktów', '👑', 'points', 1000, 200, 'general'),
('Matematyczny genius', 'Ukończ 20 lekcji', '🧠', 'lessons_completed', 20, 300, 'learning');

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  achievement_record RECORD;
  user_stats RECORD;
  avg_score NUMERIC;
  current_streak INTEGER;
BEGIN
  -- Get user statistics
  SELECT 
    COALESCE(p.total_points, 0) as total_points,
    COUNT(DISTINCT ulp.lesson_id) as lessons_completed,
    COUNT(DISTINCT ulp.topic_id) as topics_with_lessons
  INTO user_stats
  FROM profiles p
  LEFT JOIN user_lesson_progress ulp ON ulp.user_id = p.user_id AND ulp.status = 'completed'
  WHERE p.user_id = p_user_id
  GROUP BY p.total_points;

  -- Get average score from recent lessons
  SELECT AVG(score) INTO avg_score
  FROM user_lesson_progress
  WHERE user_id = p_user_id 
    AND status = 'completed' 
    AND score IS NOT NULL
    AND completed_at >= NOW() - INTERVAL '30 days'
  LIMIT 3;

  -- Get current streak
  SELECT COALESCE(current_streak, 0) INTO current_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Check each achievement
  FOR achievement_record IN 
    SELECT a.* FROM achievements a
    WHERE a.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Check if user meets achievement conditions
    IF (achievement_record.condition_type = 'points' AND user_stats.total_points >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'lessons_completed' AND user_stats.lessons_completed >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'score_average' AND avg_score >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'streak' AND current_streak >= achievement_record.condition_value) OR
       (achievement_record.condition_type = 'topics_mastered' AND user_stats.topics_with_lessons >= achievement_record.condition_value)
    THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (p_user_id, achievement_record.id);
      
      -- Award bonus points
      UPDATE profiles 
      SET total_points = total_points + achievement_record.points_reward
      WHERE user_id = p_user_id;
      
      -- Log points
      INSERT INTO points_history (user_id, points, reason)
      VALUES (p_user_id, achievement_record.points_reward, 'Osiągnięcie: ' || achievement_record.name);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  streak_record RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, today_date);
  ELSE
    -- Update existing streak
    IF streak_record.last_activity_date = today_date THEN
      -- Already counted today, do nothing
      RETURN;
    ELSIF streak_record.last_activity_date = today_date - 1 THEN
      -- Consecutive day, increment streak
      UPDATE user_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = today_date
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE user_streaks
      SET current_streak = 1,
          last_activity_date = today_date
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;