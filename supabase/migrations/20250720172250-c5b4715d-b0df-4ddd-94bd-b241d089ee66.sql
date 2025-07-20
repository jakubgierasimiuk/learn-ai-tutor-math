-- Create analytics tables for progress tracking

-- Daily statistics for user progress
CREATE TABLE public.daily_stats (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    topics_practiced INTEGER DEFAULT 0,
    average_accuracy DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Learning goals for users
CREATE TABLE public.learning_goals (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    user_id UUID NOT NULL,
    goal_type TEXT NOT NULL, -- 'daily_lessons', 'weekly_time', 'topic_mastery', 'points_target'
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Topic progress history for detailed tracking
CREATE TABLE public.topic_progress_history (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id INTEGER NOT NULL,
    mastery_percentage INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    session_id INTEGER
);

-- Session analytics for detailed lesson analysis
CREATE TABLE public.session_analytics (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    topic_id INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    mistakes_made INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_stats
CREATE POLICY "Users can view their own daily stats" 
ON public.daily_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily stats" 
ON public.daily_stats 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for learning_goals
CREATE POLICY "Users can view their own learning goals" 
ON public.learning_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning goals" 
ON public.learning_goals 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for topic_progress_history
CREATE POLICY "Users can view their own topic progress history" 
ON public.topic_progress_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topic progress history" 
ON public.topic_progress_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for session_analytics
CREATE POLICY "Users can view their own session analytics" 
ON public.session_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session analytics" 
ON public.session_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_daily_stats_updated_at
BEFORE UPDATE ON public.daily_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at
BEFORE UPDATE ON public.learning_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();