-- Add missing fields to study_sessions table
ALTER TABLE public.study_sessions 
ADD COLUMN IF NOT EXISTS current_equation TEXT,
ADD COLUMN IF NOT EXISTS initialized BOOLEAN DEFAULT FALSE;

-- Update existing sessions to be marked as initialized if they have steps
UPDATE public.study_sessions 
SET initialized = TRUE 
WHERE id IN (
  SELECT DISTINCT session_id 
  FROM lesson_steps 
  WHERE lesson_steps.session_id = study_sessions.id
);