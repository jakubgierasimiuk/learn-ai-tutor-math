-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the founding scarcity updater to run every hour
SELECT cron.schedule(
  'founding-scarcity-hourly-update',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/founding-scarcity-updater',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);