-- Create analytics tables for professional traffic measurement

-- Page analytics - aggregated daily data per route
CREATE TABLE public.page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  route TEXT NOT NULL,
  total_page_views INTEGER NOT NULL DEFAULT 0,
  unique_page_views INTEGER NOT NULL DEFAULT 0,
  total_session_duration_minutes INTEGER NOT NULL DEFAULT 0,
  average_session_duration_minutes NUMERIC DEFAULT 0,
  bounce_count INTEGER NOT NULL DEFAULT 0,
  bounce_rate NUMERIC DEFAULT 0,
  exit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, route)
);

-- User session analytics - detailed per user session data
CREATE TABLE public.user_session_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  pages_visited INTEGER NOT NULL DEFAULT 0,
  entry_page TEXT,
  exit_page TEXT,
  is_bounce BOOLEAN DEFAULT false,
  user_agent TEXT,
  device_type TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics cache for performance
CREATE TABLE public.analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_analytics
CREATE POLICY "Admins can view page analytics" 
ON public.page_analytics FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert page analytics" 
ON public.page_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update page analytics" 
ON public.page_analytics FOR UPDATE
USING (true);

-- RLS policies for user_session_analytics
CREATE POLICY "Admins can view user session analytics" 
ON public.user_session_analytics FOR SELECT
USING (is_admin());

CREATE POLICY "Users can view their own sessions" 
ON public.user_session_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user sessions" 
ON public.user_session_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update user sessions" 
ON public.user_session_analytics FOR UPDATE
USING (true);

-- RLS policies for analytics_cache
CREATE POLICY "Admins can view analytics cache" 
ON public.analytics_cache FOR SELECT
USING (is_admin());

CREATE POLICY "System can manage analytics cache" 
ON public.analytics_cache FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX idx_page_analytics_date_route ON public.page_analytics(date, route);
CREATE INDEX idx_page_analytics_date ON public.page_analytics(date);
CREATE INDEX idx_user_session_analytics_user_id ON public.user_session_analytics(user_id);
CREATE INDEX idx_user_session_analytics_started_at ON public.user_session_analytics(started_at);
CREATE INDEX idx_analytics_cache_key ON public.analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON public.analytics_cache(expires_at);

-- Create function to clean expired cache
CREATE OR REPLACE FUNCTION public.cleanup_analytics_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.analytics_cache 
  WHERE expires_at < now();
END;
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_page_analytics_updated_at
  BEFORE UPDATE ON public.page_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_session_analytics_updated_at
  BEFORE UPDATE ON public.user_session_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();