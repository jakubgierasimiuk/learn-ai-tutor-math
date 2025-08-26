-- Create table for tracking token limit exceeded events
CREATE TABLE public.token_limit_exceeded_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attempted_tokens INTEGER,
  monthly_limit INTEGER,
  tokens_used_this_month INTEGER,
  subscription_type TEXT,
  conversation_length INTEGER,
  skill_id UUID,
  user_message TEXT,
  enriched_context_enabled BOOLEAN DEFAULT false,
  context_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_limit_exceeded_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "Admins can view all token limit logs" 
ON public.token_limit_exceeded_logs 
FOR SELECT 
USING (public.is_admin());

-- Create index for better performance
CREATE INDEX idx_token_limit_exceeded_logs_timestamp ON public.token_limit_exceeded_logs(timestamp DESC);
CREATE INDEX idx_token_limit_exceeded_logs_user_id ON public.token_limit_exceeded_logs(user_id);