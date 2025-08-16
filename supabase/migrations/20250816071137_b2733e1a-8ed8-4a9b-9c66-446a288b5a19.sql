-- Wywołanie funkcji seed-curriculum dla fazy 1 (PP)
SELECT net.http_post(
  url := 'https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/seed-curriculum',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAyNjk0OCwiZXhwIjoyMDY4NjAyOTQ4fQ.FUoYOZN_k1j-C3z-4JfMO1E6TYJyEhT-xFj8lktCdFs'
  ),
  body := jsonb_build_object('phase', 1)
) as result;