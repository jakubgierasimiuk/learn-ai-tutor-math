-- Check if knowledge_nodes exists and add missing tables
DO $$ 
BEGIN
    -- Drop existing knowledge_nodes if it exists and create the proper one
    DROP TABLE IF EXISTS knowledge_nodes CASCADE;
    
    -- Create the real learning engine tables
    CREATE TABLE knowledge_nodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        skill_code TEXT NOT NULL UNIQUE,
        skill_name TEXT NOT NULL,
        department TEXT NOT NULL DEFAULT 'mathematics',
        difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
        cognitive_load_estimate NUMERIC(3,2) DEFAULT 0.5,
        prerequisite_knowledge_required TEXT[] DEFAULT '{}',
        estimated_mastery_time_hours NUMERIC(4,1) DEFAULT 2.0,
        bloom_taxonomy_level INTEGER DEFAULT 1,
        misconception_patterns JSONB DEFAULT '[]',
        real_world_applications TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Real Learning Profiles (if not exists)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_profiles') THEN
        CREATE TABLE learning_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            processing_speed_percentile INTEGER DEFAULT 50,
            working_memory_span INTEGER DEFAULT 4,
            cognitive_load_threshold NUMERIC(3,2) DEFAULT 0.7,
            attention_span_minutes INTEGER DEFAULT 25,
            visual_vs_verbal_preference NUMERIC(3,2) DEFAULT 0.5,
            sequential_vs_global_preference NUMERIC(3,2) DEFAULT 0.5,
            initial_interval_hours INTEGER DEFAULT 24,
            ease_factor NUMERIC(3,2) DEFAULT 2.5,
            intrinsic_vs_extrinsic NUMERIC(3,2) DEFAULT 0.6,
            optimal_challenge_level NUMERIC(3,2) DEFAULT 0.7,
            optimal_session_length_minutes INTEGER DEFAULT 30,
            current_energy_level NUMERIC(3,2) DEFAULT 1.0,
            frustration_level NUMERIC(3,2) DEFAULT 0.0,
            confidence_level NUMERIC(3,2) DEFAULT 0.5,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users manage own learning profile" ON learning_profiles
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Spaced Repetition Cards (if not exists)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spaced_repetition_cards') THEN
        CREATE TABLE spaced_repetition_cards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            skill_node_id UUID NOT NULL REFERENCES knowledge_nodes(id),
            interval_days NUMERIC(5,2) DEFAULT 1.0,
            ease_factor NUMERIC(3,2) DEFAULT 2.5,
            repetition_count INTEGER DEFAULT 0,
            next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
            last_reviewed_at TIMESTAMP WITH TIME ZONE,
            review_history JSONB DEFAULT '[]',
            mastery_level NUMERIC(3,2) DEFAULT 0,
            predicted_retention NUMERIC(3,2) DEFAULT 0.9,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE spaced_repetition_cards ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users manage own cards" ON spaced_repetition_cards
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Misconception Database 
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'misconception_database') THEN
        CREATE TABLE misconception_database (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            misconception_code TEXT NOT NULL UNIQUE,
            skill_node_id UUID REFERENCES knowledge_nodes(id),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            trigger_patterns JSONB NOT NULL,
            intervention_strategy TEXT NOT NULL,
            detection_accuracy NUMERIC(3,2) DEFAULT 0.8,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;

END $$;