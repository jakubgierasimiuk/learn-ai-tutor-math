-- Remove obsolete lessons-related tables
DROP TABLE IF EXISTS lesson_steps CASCADE;
DROP TABLE IF EXISTS chat_logs CASCADE;
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS lesson_sessions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;

-- Remove topic-related tables that are part of the old system
DROP TABLE IF EXISTS topic_progress_history CASCADE;
DROP TABLE IF EXISTS session_analytics CASCADE;
DROP TABLE IF EXISTS topics CASCADE;