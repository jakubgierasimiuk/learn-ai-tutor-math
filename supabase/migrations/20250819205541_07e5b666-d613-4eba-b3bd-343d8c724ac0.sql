-- REAL LEARNING ENGINE DATABASE SCHEMA
-- Knowledge Graph and Learning Analytics

-- 1. Real Learning Profiles based on Cognitive Science
CREATE TABLE learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Cognitive Fingerprint (real measurements)
    processing_speed_percentile INTEGER DEFAULT 50, -- based on actual response times
    working_memory_span INTEGER DEFAULT 4, -- measured from task complexity
    cognitive_load_threshold NUMERIC(3,2) DEFAULT 0.7, -- when overload occurs
    attention_span_minutes INTEGER DEFAULT 25, -- measured session data
    
    -- Learning Style Profile  
    visual_vs_verbal_preference NUMERIC(3,2) DEFAULT 0.5, -- 0=verbal, 1=visual
    sequential_vs_global_preference NUMERIC(3,2) DEFAULT 0.5, -- learning pathway
    reflection_vs_action_preference NUMERIC(3,2) DEFAULT 0.5, -- thinking style
    
    -- Spaced Repetition Parameters
    initial_interval_hours INTEGER DEFAULT 24,
    ease_factor NUMERIC(3,2) DEFAULT 2.5, -- SuperMemo algorithm
    review_accuracy_threshold NUMERIC(3,2) DEFAULT 0.85,
    
    -- Motivation Profile
    intrinsic_vs_extrinsic NUMERIC(3,2) DEFAULT 0.6, -- motivation type
    mastery_vs_performance_goal NUMERIC(3,2) DEFAULT 0.7, -- goal orientation
    optimal_challenge_level NUMERIC(3,2) DEFAULT 0.7, -- flow state range
    
    -- Measured Learning Patterns
    optimal_session_length_minutes INTEGER DEFAULT 30,
    best_time_of_day TEXT DEFAULT 'morning', -- afternoon, evening
    break_frequency_minutes INTEGER DEFAULT 15,
    mistake_recovery_pattern JSONB DEFAULT '{}',
    
    -- Real-time Adaptation State
    current_energy_level NUMERIC(3,2) DEFAULT 1.0,
    frustration_level NUMERIC(3,2) DEFAULT 0.0,
    confidence_level NUMERIC(3,2) DEFAULT 0.5,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own learning profile" ON learning_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 2. Knowledge Graph - Skill Dependencies & Prerequisites  
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_code TEXT NOT NULL UNIQUE, -- e.g., 'algebra.linear_equations.basic'
    skill_name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'mathematics',
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
    
    -- Cognitive Requirements
    cognitive_load_estimate NUMERIC(3,2) DEFAULT 0.5,
    prerequisite_knowledge_required TEXT[] DEFAULT '{}',
    estimated_mastery_time_hours NUMERIC(4,1) DEFAULT 2.0,
    
    -- Learning Metadata
    bloom_taxonomy_level INTEGER DEFAULT 1, -- 1=remember, 6=create
    misconception_patterns JSONB DEFAULT '[]',
    real_world_applications TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prerequisites relationship table
CREATE TABLE knowledge_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES knowledge_nodes(id),
    prerequisite_id UUID NOT NULL REFERENCES knowledge_nodes(id),
    necessity_level NUMERIC(3,2) DEFAULT 0.8, -- how essential this prereq is
    strength NUMERIC(3,2) DEFAULT 1.0, -- how strong the connection is
    
    UNIQUE(skill_id, prerequisite_id)
);

-- 3. Real Learning Interactions with proper validation
CREATE TABLE learning_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    
    -- Interaction Context
    skill_node_id UUID REFERENCES knowledge_nodes(id),
    task_type TEXT NOT NULL, -- 'practice', 'assessment', 'exploration'
    difficulty_presented NUMERIC(3,1),
    
    -- Student Response Analysis
    student_input TEXT,
    parsed_answer JSONB, -- structured representation of answer
    is_correct BOOLEAN,
    partial_credit_score NUMERIC(3,2) DEFAULT 0,
    
    -- Misconception Detection
    detected_misconceptions TEXT[] DEFAULT '{}',
    error_category TEXT, -- 'procedural', 'conceptual', 'careless'
    hint_level_reached INTEGER DEFAULT 0,
    
    -- Cognitive Metrics (measured, not estimated)
    response_time_ms INTEGER,
    pause_pattern JSONB, -- where student paused thinking
    revision_count INTEGER DEFAULT 0, -- how many times changed answer
    confidence_level NUMERIC(3,2), -- student's self-reported confidence
    
    -- Learning Analytics
    cognitive_load_during_task NUMERIC(3,2), -- calculated from response patterns
    engagement_score NUMERIC(3,2), -- measured from interaction patterns
    transfer_level INTEGER DEFAULT 0, -- how much knowledge transferred from prereqs
    
    -- Adaptation Triggers
    triggered_interventions TEXT[] DEFAULT '{}',
    next_difficulty_adjustment NUMERIC(3,2) DEFAULT 0,
    recommended_review_time TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own interactions" ON learning_interactions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Spaced Repetition Cards (SuperMemo Algorithm)
CREATE TABLE spaced_repetition_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    skill_node_id UUID NOT NULL REFERENCES knowledge_nodes(id),
    
    -- SuperMemo Algorithm State
    interval_days NUMERIC(5,2) DEFAULT 1.0,
    ease_factor NUMERIC(3,2) DEFAULT 2.5,
    repetition_count INTEGER DEFAULT 0,
    
    -- Schedule
    next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance History
    review_history JSONB DEFAULT '[]', -- array of {date, grade, response_time}
    average_grade NUMERIC(3,2),
    mastery_level NUMERIC(3,2) DEFAULT 0,
    
    -- Forgetting Curve Prediction
    predicted_retention NUMERIC(3,2) DEFAULT 0.9,
    forgetting_rate NUMERIC(4,3) DEFAULT 0.05,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS and create indexes
ALTER TABLE spaced_repetition_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cards" ON spaced_repetition_cards
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_spaced_repetition_review ON spaced_repetition_cards(user_id, next_review_at);
CREATE INDEX idx_learning_interactions_session ON learning_interactions(session_id, created_at);
CREATE INDEX idx_knowledge_prerequisites ON knowledge_prerequisites(skill_id, prerequisite_id);

-- 5. Real-time Learning Sessions with proper tracking
CREATE TABLE intelligent_learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Session Context
    session_type TEXT NOT NULL, -- 'adaptive_practice', 'spaced_review', 'mastery_check'
    target_skills UUID[] DEFAULT '{}', -- array of knowledge_node ids
    difficulty_range NUMRANGE DEFAULT '[1,10]',
    
    -- Adaptive State
    current_difficulty NUMERIC(3,1) DEFAULT 5.0,
    cognitive_load_level NUMERIC(3,2) DEFAULT 0.5,
    engagement_level NUMERIC(3,2) DEFAULT 0.5,
    flow_state_probability NUMERIC(3,2) DEFAULT 0.5,
    
    -- Real Metrics (calculated from interactions)
    tasks_completed INTEGER DEFAULT 0,
    correct_responses INTEGER DEFAULT 0,
    total_response_time_ms BIGINT DEFAULT 0,
    hints_provided INTEGER DEFAULT 0,
    misconceptions_addressed TEXT[] DEFAULT '{}',
    
    -- Learning Outcomes
    skills_practiced UUID[] DEFAULT '{}',
    skills_mastered UUID[] DEFAULT '{}',
    knowledge_gaps_identified UUID[] DEFAULT '{}',
    
    -- Session Management
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    session_quality_score NUMERIC(3,2), -- calculated post-session
    
    -- AI Model State
    ai_model_used TEXT DEFAULT 'gpt-5-2025-08-07',
    personalization_context JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE intelligent_learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions" ON intelligent_learning_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 6. Misconception Database with patterns
CREATE TABLE misconception_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    misconception_code TEXT NOT NULL UNIQUE,
    skill_node_id UUID REFERENCES knowledge_nodes(id),
    
    -- Misconception Details
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    prevalence_rate NUMERIC(3,2) DEFAULT 0.1, -- how common this error is
    
    -- Detection Patterns
    trigger_patterns JSONB NOT NULL, -- what inputs/behaviors indicate this
    typical_student_answers TEXT[] DEFAULT '{}',
    confusion_indicators JSONB DEFAULT '{}',
    
    -- Remediation Strategy
    intervention_strategy TEXT NOT NULL,
    explanation_template TEXT NOT NULL,
    practice_exercises JSONB DEFAULT '[]',
    prerequisite_review_needed UUID[] DEFAULT '{}',
    
    -- Effectiveness Tracking
    detection_accuracy NUMERIC(3,2) DEFAULT 0.8,
    intervention_success_rate NUMERIC(3,2) DEFAULT 0.7,
    average_correction_time_minutes INTEGER DEFAULT 15,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Update trigger for learning profiles
CREATE OR REPLACE FUNCTION update_learning_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_profiles_updated_at
    BEFORE UPDATE ON learning_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_profile_timestamp();

CREATE TRIGGER update_spaced_repetition_updated_at
    BEFORE UPDATE ON spaced_repetition_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_profile_timestamp();