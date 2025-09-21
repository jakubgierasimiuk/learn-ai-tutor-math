-- Ensure page_analytics table has all required columns
ALTER TABLE public.page_analytics 
ADD COLUMN IF NOT EXISTS average_load_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS device_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platform_stats JSONB DEFAULT '{}';

-- Ensure user_session_analytics table has all required columns  
ALTER TABLE public.user_session_analytics
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_event_logs_event_type_created_at 
ON public.app_event_logs (event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_page_analytics_date_route 
ON public.page_analytics (date, route);

CREATE INDEX IF NOT EXISTS idx_user_session_analytics_started_at 
ON public.user_session_analytics (started_at);

CREATE INDEX IF NOT EXISTS idx_user_session_analytics_session_id 
ON public.user_session_analytics (session_id);

-- Set up CRON job for daily analytics aggregation (runs at 2 AM daily)
SELECT cron.schedule(
  'daily-analytics-aggregation',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/analytics-aggregator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"}'::jsonb,
    body := '{"operation": "daily_aggregation"}'::jsonb
  );
  $$
);

-- Set up CRON job for session cleanup (runs every 4 hours)
SELECT cron.schedule(
  'session-cleanup',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/analytics-aggregator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"}'::jsonb,
    body := '{"operation": "session_cleanup"}'::jsonb
  );
  $$
);

-- Set up CRON job for bounce rate calculation (runs at 3 AM daily)
SELECT cron.schedule(
  'bounce-rate-calculation',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/analytics-aggregator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"}'::jsonb,
    body := '{"operation": "bounce_rate_calculation"}'::jsonb
  );
  $$
);