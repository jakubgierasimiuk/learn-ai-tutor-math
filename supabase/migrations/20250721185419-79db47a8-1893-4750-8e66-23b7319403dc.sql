-- Create study groups table
CREATE TABLE public.study_groups (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study group members table
CREATE TABLE public.study_group_members (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_by UUID NOT NULL,
    challenged_user UUID NOT NULL,
    topic_id INTEGER NOT NULL,
    difficulty_level INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    challenger_score INTEGER DEFAULT 0,
    challenged_score INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create leaderboards table
CREATE TABLE public.leaderboards (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    user_id UUID NOT NULL,
    period_type TEXT NOT NULL,
    period_start DATE NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    challenges_won INTEGER NOT NULL DEFAULT 0,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, period_type, period_start)
);

-- Create social achievements table
CREATE TABLE public.social_achievements (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    achievement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study sessions table for group learning
CREATE TABLE public.group_study_sessions (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    group_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session participants table
CREATE TABLE public.session_participants (
    id INTEGER NOT NULL DEFAULT generate_random_id() PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    participation_score INTEGER DEFAULT 0,
    UNIQUE(session_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study groups
CREATE POLICY "Users can view groups they belong to or public groups" 
ON public.study_groups 
FOR SELECT 
USING (
    is_public = true OR 
    EXISTS (
        SELECT 1 FROM study_group_members 
        WHERE group_id = study_groups.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create study groups" 
ON public.study_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.study_groups 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for study group members
CREATE POLICY "Users can view group members of groups they belong to" 
ON public.study_group_members 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM study_group_members sgm 
        WHERE sgm.group_id = study_group_members.group_id AND sgm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can join groups" 
ON public.study_group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups or admins can remove members" 
ON public.study_group_members 
FOR DELETE 
USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM study_group_members 
        WHERE group_id = study_group_members.group_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- RLS Policies for challenges
CREATE POLICY "Users can view challenges they're involved in" 
ON public.challenges 
FOR SELECT 
USING (auth.uid() = created_by OR auth.uid() = challenged_user);

CREATE POLICY "Users can create challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Challenge participants can update" 
ON public.challenges 
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() = challenged_user);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view leaderboards" 
ON public.leaderboards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" 
ON public.leaderboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" 
ON public.leaderboards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for social achievements
CREATE POLICY "Anyone can view active social achievements" 
ON public.social_achievements 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for group study sessions
CREATE POLICY "Group members can view sessions" 
ON public.group_study_sessions 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM study_group_members 
        WHERE group_id = group_study_sessions.group_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Group members can create sessions" 
ON public.group_study_sessions 
FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM study_group_members 
        WHERE group_id = group_study_sessions.group_id AND user_id = auth.uid()
    )
);

-- RLS Policies for session participants
CREATE POLICY "Group members can view session participants" 
ON public.session_participants 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM group_study_sessions gss
        JOIN study_group_members sgm ON sgm.group_id = gss.group_id
        WHERE gss.id = session_participants.session_id AND sgm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can join sessions" 
ON public.session_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at
BEFORE UPDATE ON public.leaderboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial social achievements
INSERT INTO public.social_achievements (name, description, icon, achievement_type, requirement_value, points_reward) VALUES
('Pierwszy Wyzwanie', 'Wyślij swoje pierwsze wyzwanie do kolegi', '⚔️', 'challenges_sent', 1, 50),
('Mistrz Wyzwań', 'Wygraj 5 wyzwań z innymi uczniami', '🏆', 'challenges_won', 5, 200),
('Społecznik', 'Dołącz do swojej pierwszej grupy nauki', '👥', 'groups_joined', 1, 30),
('Mentor', 'Utwórz grupę nauki i zdobądź 10 członków', '🎓', 'group_members', 10, 300),
('Top 10', 'Znajdź się w top 10 miesięcznego rankingu', '🥇', 'leaderboard_position', 10, 150),
('Współpracownik', 'Weź udział w 5 sesjach grupowych', '🤝', 'group_sessions', 5, 100);

-- Create function to generate unique join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, trunc(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to update leaderboards
CREATE OR REPLACE FUNCTION public.update_leaderboard(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
DECLARE
    current_week DATE;
    current_month DATE;
BEGIN
    current_week := date_trunc('week', CURRENT_DATE)::DATE;
    current_month := date_trunc('month', CURRENT_DATE)::DATE;
    
    -- Update weekly leaderboard
    INSERT INTO public.leaderboards (user_id, period_type, period_start, total_points)
    VALUES (p_user_id, 'weekly', current_week, p_points)
    ON CONFLICT (user_id, period_type, period_start)
    DO UPDATE SET 
        total_points = leaderboards.total_points + p_points,
        updated_at = now();
    
    -- Update monthly leaderboard
    INSERT INTO public.leaderboards (user_id, period_type, period_start, total_points)
    VALUES (p_user_id, 'monthly', current_month, p_points)
    ON CONFLICT (user_id, period_type, period_start)
    DO UPDATE SET 
        total_points = leaderboards.total_points + p_points,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check social achievements
CREATE OR REPLACE FUNCTION public.check_social_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
BEGIN
    -- Get user social statistics
    SELECT 
        COUNT(DISTINCT c1.id) as challenges_sent,
        COUNT(DISTINCT c2.id) as challenges_won,
        COUNT(DISTINCT sgm.group_id) as groups_joined,
        COUNT(DISTINCT sp.session_id) as group_sessions
    INTO user_stats
    FROM profiles p
    LEFT JOIN challenges c1 ON c1.created_by = p.user_id
    LEFT JOIN challenges c2 ON c2.challenged_user = p.user_id AND c2.status = 'completed' AND c2.challenged_score > c2.challenger_score
    LEFT JOIN study_group_members sgm ON sgm.user_id = p.user_id
    LEFT JOIN session_participants sp ON sp.user_id = p.user_id
    WHERE p.user_id = p_user_id
    GROUP BY p.user_id;

    -- Check each social achievement
    FOR achievement_record IN 
        SELECT sa.* FROM social_achievements sa
        WHERE sa.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = sa.id
        )
    LOOP
        -- Check if user meets achievement conditions
        IF (achievement_record.achievement_type = 'challenges_sent' AND user_stats.challenges_sent >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'challenges_won' AND user_stats.challenges_won >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'groups_joined' AND user_stats.groups_joined >= achievement_record.requirement_value) OR
           (achievement_record.achievement_type = 'group_sessions' AND user_stats.group_sessions >= achievement_record.requirement_value)
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
            VALUES (p_user_id, achievement_record.points_reward, 'Osiągnięcie społecznościowe: ' || achievement_record.name);
            
            -- Update leaderboard
            PERFORM update_leaderboard(p_user_id, achievement_record.points_reward);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;