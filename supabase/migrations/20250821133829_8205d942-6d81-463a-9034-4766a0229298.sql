-- Add conversation content and summary columns to learning_interactions
ALTER TABLE public.learning_interactions 
ADD COLUMN IF NOT EXISTS user_input TEXT,
ADD COLUMN IF NOT EXISTS ai_response TEXT,
ADD COLUMN IF NOT EXISTS tokens_estimate INTEGER DEFAULT 0;

-- Add summary columns to study_sessions
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS summary_compact TEXT,
ADD COLUMN IF NOT EXISTS summary_state JSONB,
ADD COLUMN IF NOT EXISTS last_summarized_sequence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS summary_updated_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_summary_updated_at
ON public.study_sessions (summary_updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_summary_state_gin
ON public.study_sessions USING GIN (summary_state);

CREATE INDEX IF NOT EXISTS idx_learning_interactions_sequence_content
ON public.learning_interactions (session_id, sequence_number DESC) 
WHERE user_input IS NOT NULL OR ai_response IS NOT NULL;