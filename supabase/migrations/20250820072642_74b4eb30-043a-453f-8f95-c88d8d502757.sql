-- Fix security issues from the migration

-- 1. Enable RLS on knowledge_nodes and misconception_database
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE misconception_database ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for knowledge_nodes (public read, admin write)
CREATE POLICY "Anyone can view knowledge nodes" ON knowledge_nodes
    FOR SELECT USING (true);

-- 3. Create RLS policy for misconception_database (public read)  
CREATE POLICY "Anyone can view misconceptions" ON misconception_database
    FOR SELECT USING (true);

-- 4. Create secure function for user profile access
CREATE OR REPLACE FUNCTION get_user_learning_profile(target_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    processing_speed_percentile INTEGER,
    working_memory_span INTEGER,
    cognitive_load_threshold NUMERIC(3,2),
    attention_span_minutes INTEGER,
    optimal_session_length_minutes INTEGER,
    current_energy_level NUMERIC(3,2)
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT 
        lp.user_id,
        lp.processing_speed_percentile,
        lp.working_memory_span,
        lp.cognitive_load_threshold,
        lp.attention_span_minutes,
        lp.optimal_session_length_minutes,
        lp.current_energy_level
    FROM learning_profiles lp
    WHERE lp.user_id = target_user_id;
$$;

-- 5. Create function for spaced repetition scheduling
CREATE OR REPLACE FUNCTION get_due_cards_for_user(target_user_id UUID)
RETURNS TABLE(
    card_id UUID,
    skill_node_id UUID,
    next_review_at TIMESTAMP WITH TIME ZONE,
    mastery_level NUMERIC(3,2)
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT 
        src.id,
        src.skill_node_id,
        src.next_review_at,
        src.mastery_level
    FROM spaced_repetition_cards src
    WHERE src.user_id = target_user_id 
    AND src.next_review_at <= NOW();
$$;

-- 6. Fix search path for existing functions
CREATE OR REPLACE FUNCTION public.update_learning_profile_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;