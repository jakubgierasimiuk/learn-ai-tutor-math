-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule hourly session cleanup
SELECT cron.schedule(
  'cleanup-stale-sessions',
  '0 * * * *', -- every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/cleanup-sessions',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);