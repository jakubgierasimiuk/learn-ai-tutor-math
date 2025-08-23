-- Make skill_id nullable in study_sessions to allow general chat
ALTER TABLE public.study_sessions 
ALTER COLUMN skill_id DROP NOT NULL;