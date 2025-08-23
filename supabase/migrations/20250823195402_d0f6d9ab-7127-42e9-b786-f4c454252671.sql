-- Create AI conversation log table for complete AI interaction tracking
CREATE TABLE ai_conversation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  sequence_number integer NOT NULL DEFAULT 0,
  function_name text NOT NULL,
  endpoint text,
  full_prompt text NOT NULL,
  ai_response text NOT NULL,
  parameters jsonb DEFAULT '{}',
  user_input text,
  processing_time_ms integer,
  tokens_used integer,
  model_used text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_conversation_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI conversation logs
CREATE POLICY "Users can view their own AI conversation logs" 
ON ai_conversation_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert AI conversation logs
CREATE POLICY "System can insert AI conversation logs" 
ON ai_conversation_log 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_ai_conversation_log_user_timestamp ON ai_conversation_log(user_id, timestamp DESC);
CREATE INDEX idx_ai_conversation_log_session ON ai_conversation_log(session_id, sequence_number);