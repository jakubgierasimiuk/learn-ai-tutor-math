-- Add token tracking columns to learning_interactions
ALTER TABLE learning_interactions
  ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS completion_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER 
    GENERATED ALWAYS AS (COALESCE(prompt_tokens,0)+COALESCE(completion_tokens,0)) STORED;

-- Add assistant flags for event tracking
ALTER TABLE learning_interactions
  ADD COLUMN IF NOT EXISTS assistant_flags JSONB DEFAULT '{}';

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_learning_interactions_total_tokens ON learning_interactions(total_tokens);
CREATE INDEX IF NOT EXISTS idx_learning_interactions_assistant_flags ON learning_interactions USING GIN(assistant_flags);