-- Create validation_logs table for tracking validation performance
CREATE TABLE validation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('ai_chat', 'study_learn', 'diagnostic')),
  is_correct boolean NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.0,
  detected_misconception text,
  response_time integer,
  hints_used integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own validation logs" 
ON validation_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own validation logs" 
ON validation_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_validation_logs_user_id ON validation_logs(user_id);
CREATE INDEX idx_validation_logs_created_at ON validation_logs(created_at);
CREATE INDEX idx_validation_logs_session_type ON validation_logs(session_type);