-- Create performance indexes for engagement calculations
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_skill 
ON study_sessions(user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_learning_interactions_session_timestamp 
ON learning_interactions(session_id, interaction_timestamp DESC);

-- Add computed column for session duration (for future optimization)
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (completed_at - started_at))/60
    ELSE NULL
  END
) STORED;

-- Index for engagement queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_duration 
ON study_sessions(user_id, skill_id, duration_minutes) 
WHERE duration_minutes IS NOT NULL;